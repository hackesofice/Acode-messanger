"use strict";

(() => {
    const DEVELOPMENT_MODE = false;
    const PLUGIN_ID = "hackesofice.messanger_Ax";
    
    // Acode dependencies
    const editorManager = window.editorManager;
    const sidebarApps = acode.require('sidebarApps');
    const editorFile = acode.require('editorFile');
    const appSettings = acode.require('settings');
    const fs = acode.require('fs');
    const browser = window.cordova.plugin.http;
    const websocket = window.cordova.websocket;
    const SERVER_URL = 'http://fi5.bot-hosting.net:22148'

    // CSS Design System
    const CSS_VARS = {
        primary: 'var(--primary-color, #2563eb)',
        secondary: 'var(--secondary-color, #64748b)',
        accent: 'var(--accent-color, #8b5cf6)',
        success: 'var(--success-color, #10b981)',
        warning: 'var(--warning-color, #f59e0b)',
        error: 'var(--error-color, #ef4444)',
        background: 'var(--background-color, #0f172a)',
        surface: 'var(--surface-color, #1e293b)',
        text: 'var(--primary-text-color, #f1f5f9)',
        textSecondary: 'var(--secondary-text-color, #94a3b8)'
    };

    // Utility Classes
    class ConsoleManager {
        static log(...values) {
            if (DEVELOPMENT_MODE) {
                values.forEach(value => console.log(value));
            }
        }

        static error(...values) {
            values.forEach(value => console.error(value));
        }

        static warn(...values) {
            values.forEach(value => console.warn(value));
        }
    }

    class SettingsManager {
        constructor(){}
        
        static getCookie() {
            const pluginSettings = appSettings.get(PLUGIN_ID);
            return pluginSettings ? pluginSettings.COOKIE : null;
        }

        static getUid() {
            const pluginSettings = appSettings.get(PLUGIN_ID);
            return pluginSettings ? pluginSettings.UID : null;
        }

        static setCookie(cookie) {
            SettingsManager.initializeSettings();
            appSettings.update({
                [PLUGIN_ID]: {
                    ...appSettings.get(PLUGIN_ID),
                    COOKIE: cookie
                }
            });
        }

        static setUid(uid) {
            SettingsManager.initializeSettings();
            appSettings.update({
                [PLUGIN_ID]: {
                    ...appSettings.get(PLUGIN_ID),
                    UID: uid
                }
            });
        }

        static initializeSettings() {
            if (!appSettings.get(PLUGIN_ID)) {
                appSettings.value[PLUGIN_ID] = {
                        UID: '',
                        COOKIE: ''
                    }
            }
        }

        static clearSettings() {
            appSettings.update({
                [PLUGIN_ID]: {
                    UID: '',
                    COOKIE: ''
                }
            });
        }
    }
    
    // ill create custom evet listenert
    class CustomListener {
        constructor() {
            this.onLine = navigator.onLine;
            this.events = {};
            this.#trackForEvents();
        }

        #trackForEvents() {
            setInterval(() => {
                this.#tracker();
              //  ('tracking ', this.onLine ? 'online' : 'offline');
            }, 3000);
        }

        #tracker() {
            if (navigator.onLine && this.onLine === false) {
                ConsoleManager.log('online');
                this.onLine = true;
                this.#handleOnLineEvents();
            } else if (!navigator.onLine && this.onLine === true) {
                ConsoleManager.log('offline');
                this.onLine = false;
                this.#handleOfflineEvents();
            }
        }

        #handleOnLineEvents() {
            if (this.events.onLine) {
                this.events.onLine.forEach(cb => cb());
            }
        }

        #handleOfflineEvents() {
            if (this.events.offLine) {
                this.events.offLine.forEach(cb => cb());
            }
        }

        addEventListener(event, callback) {
            if (!this.events[event]) {
                this.events[event] = [];
            }
            this.#filterIfDuplicate(event, callback) ? {} : this.events[event].push(callback)
        }
        #filterIfDuplicate(event, callback){
            if (this.events[event].includes(callback)){
                return true
            }else{
                return false
            }
        }
    }

    class NotificationManager {
        static showToast(message, type = 'info', duration = 3000) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                transform: translateX(400px);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                backdrop-filter: blur(10px);
            `;

            const colors = {
                info: CSS_VARS.primary,
                success: CSS_VARS.success,
                warning: CSS_VARS.warning,
                error: CSS_VARS.error
            };

            toast.style.backgroundColor = colors[type] || colors.info;
            
            const safeConverter = new SafeConverter();
            const displayMessage = (message.startsWith('h:') || message.startsWith('u:')) 
                ? safeConverter.makeUnSafe(message) 
                : message;
                
            toast.textContent = displayMessage;
            document.body.appendChild(toast);

            requestAnimationFrame(() => {
                toast.style.transform = 'translateX(0)';
            });

            setTimeout(() => {
                toast.style.transform = 'translateX(400px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
        }
    }

    class SafeConverter {
        constructor(mode = "hex") {
            this.mode = mode;
            this.encoder = new TextEncoder();
            this.decoder = new TextDecoder();

            // Precompute hex lookup table for performance
            this._hexTable = new Array(256);
            for (let i = 0; i < 256; i++) {
                const s = i.toString(16);
                this._hexTable[i] = (s.length === 1 ? "0" + s : s);
            }
        }

        _bytesToHex(bytes) {
            const parts = new Array(bytes.length);
            for (let i = 0; i < bytes.length; i++) {
                parts[i] = this._hexTable[bytes[i]];
            }
            return parts.join("");
        }

        _hexToBytes(hex) {
            const len = hex.length;
            if (len % 2 !== 0) throw new Error("Invalid hex length");
            const out = new Uint8Array(len / 2);
            for (let i = 0, j = 0; i < len; i += 2, j++) {
                out[j] = parseInt(hex[i] + hex[i + 1], 16);
            }
            return out;
        }

        _bytesToB64url(bytes) {
            let bin = "";
            const CHUNK = 0x8000;
            for (let i = 0; i < bytes.length; i += CHUNK) {
                const slice = bytes.subarray(i, i + CHUNK);
                bin += String.fromCharCode.apply(null, slice);
            }
            let b64 = btoa(bin);
            return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }

        _b64urlToBytes(b64url) {
            let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            const bin = atob(b64);
            const len = bin.length;
            const out = new Uint8Array(len);
            for (let i = 0; i < len; i++) out[i] = bin.charCodeAt(i);
            return out;
        }

        makeSafe(str) {
            if (typeof str !== "string") str = String(str);
            const bytes = this.encoder.encode(str);

            if (this.mode === "hex") {
                return "h:" + this._bytesToHex(bytes);
            } else if (this.mode === "b64url") {
                return "u:" + this._bytesToB64url(bytes);
            } else {
                throw new Error("Unknown mode");
            }
        }

        makeUnSafe(safeStr) {
            if (typeof safeStr !== "string") throw new Error("Expected string");
            if (safeStr.length < 2 || safeStr[1] !== ":") {
                ConsoleManager.log(safeStr);
                return safeStr;
            }
            
            const marker = safeStr[0];
            const payload = safeStr.slice(2);

            if (marker === "h") {
                const bytes = this._hexToBytes(payload);
                return this.decoder.decode(bytes);
            } else if (marker === "u") {
                const bytes = this._b64urlToBytes(payload);
                return this.decoder.decode(bytes);
            } else {
                throw new Error("Unknown encoding marker");
            }
        }
    }

    class WebSocketManager {
        constructor() {
            this.socket = null;
            this.isConnected = false;
            this.events = {};
            this.reconnectAttempts = 0;
            this.maxReconnectAttempts = 3000;
            this.reconnectDelay = 3000; // 3 seconds
            this.url = null;
            this.reconnecting = false;
        }

        async connect(url) {
            this.url = url;
            try {
                const sock = await window.cordova.websocket.connect(url);
                this.socket = sock;
                this.#setupSocketHandlers(sock);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                ConsoleManager.log('✅ Connected to WebSocket server');
            } catch (err) {
                ConsoleManager.log('❌ Initial connection failed:', err);
                this.#scheduleReconnect();
            }
        }

        #setupSocketHandlers(sock) {
            sock.onopen = () => {
                ConsoleManager.log('🔌 WebSocket open');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.reconnecting = false;
            };

            sock.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.event && this.events[msg.event]) {
                        this.events[msg.event].forEach(cb => cb(msg.data));
                    }
                } catch (err) {
                    ConsoleManager.log('❌ Failed to parse message', err);
                }
            };

            sock.onclose = () => {
                ConsoleManager.log('⚠️ Socket closed, reconnecting...');
                this.isConnected = false;
                this.socket = null;
                this.#scheduleReconnect();
            };

            sock.onerror = (err) => {
                ConsoleManager.log('⚠️ Socket error:', err);
                this.isConnected = false;
                sock.close(); // triggers onclose → reconnect
            };
        }

        #scheduleReconnect() {
            if (this.reconnecting) return; // already trying
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                ConsoleManager.log('🚫 Max reconnect attempts reached');
                return;
            }

            this.reconnecting = true;
            this.reconnectAttempts++;

            const delay = this.reconnectDelay * this.reconnectAttempts; // exponential backoff
            ConsoleManager.log(`⏳ Reconnecting in ${delay / 1000}s...`);

            setTimeout(() => {
                this.reconnecting = false;
                if (this.url) this.connect(this.url);
            }, delay);
        }

        on(event, callback) {
            if (!this.events[event]) this.events[event] = new Set();
            for (const codeStr of this.events[event]){
                if (codeStr.toString() === callback.toString()){
                    return
                }
            }
            this.events[event].add(callback);
        }

        off(event, callback) {
            this.events[event]?.delete(callback);
        }

        emit(event, data) {
            if (this.socket && this.isConnected) {
                this.socket.send(JSON.stringify({ event, data }));
            } else {
                ConsoleManager.log('⚠️ Cannot send, socket not ready');
            }
        }

        disconnect() {
            if (this.socket) {
                this.socket.close();
                this.socket = null;
                this.isConnected = false;
            }
        }
    }

    class NetworkManager {
        constructor() {}

        async #makeRequest(method, endpoint, data, headers = {}) {
            const oldSerializer = browser.getDataSerializer();
            await browser.setDataSerializer('json');
            
            return new Promise((resolve, reject) => {
                browser[method](
                    SERVER_URL + endpoint,
                    data,
                    { ...headers, "Content-Type": "application/json" },
                    (successData) => {
                        ConsoleManager.log(successData)
                        browser.setDataSerializer(oldSerializer);
                        resolve(successData);
                    },
                    (errorData) => {
                        ConsoleManager.log(errorData)
                        browser.setDataSerializer(oldSerializer);
                        reject(errorData);
                    }
                );
            });
        }

        async post(endpoint, data, headers = {}) {
            return this.#makeRequest('post', endpoint, data, headers);
        }

        async get(endpoint, data, headers = {}) {
            return this.#makeRequest('get', endpoint, data, headers);
        }

        async patch(endpoint, data, headers = {}) {
            return this.#makeRequest('patch', endpoint, data, headers);
        }
    }

    class UIManager {
        static showLoader(parentElement = null) {
            const loaderDiv = document.createElement('div');
            loaderDiv.style.cssText = 'height: 30px; width: 30px; margin: auto; display: flex; align-items: center; justify-content: center;';
            loaderDiv.id = 'loader';
            
            const loaderStyle = document.createElement('style');
            loaderStyle.textContent = `
                @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .loader-spinner {
                    height: 20px;
                    width: 20px;
                    border: 3px solid transparent;
                    border-radius: 50%;
                    border-top: 3px solid ${CSS_VARS.primary};
                    animation: rotate 500ms linear infinite;
                }
            `;
            
            const loader = document.createElement('div');
            loader.className = 'loader-spinner';
            loaderDiv.appendChild(loaderStyle);
            loaderDiv.appendChild(loader);
            
            if (parentElement) {
                parentElement.appendChild(loaderDiv);
                return loaderDiv;
            }
            return loaderDiv;
        }

        static removeLoader(parentElement) {
            const loader = parentElement.querySelector('#loader');
            if (loader) {
                loader.remove();
            }
        }

        static async showPlaceholder(text, inputElement, timing = 50) {
            inputElement.placeholder = '';
            for (const char of text) {
                await new Promise(resolve => {
                    inputElement.placeholder += char;
                    setTimeout(resolve, timing);
                });
            }
        }

        static createElement(tag, styles = {}, attributes = {}, textContent = '') {
            const element = document.createElement(tag);

            // Object.assign(element.style, styles);
            if (typeof styles === "string") {
                element.style.cssText = styles;   // handle "color:red; font-size:16px" or string formate styles also
            } else {
                Object.assign(element.style, styles);
            }

            Object.keys(attributes).forEach(key => {
                element.setAttribute(key, attributes[key]);
            });
            if (textContent) {
                element.textContent = textContent;
            }
            return element;
        }

        static clearContainer(container) {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
        }

        static createInputField(type, id, placeholder, required = true, styles = {}) {
            const input = this.createElement('input', {
                height: '35px',
                border: 'none',
                boxShadow: '0 1px 2px var(--primary-text-color)',
                padding: '0 10px',
                borderRadius: '5px',
                backgroundColor: 'transparent',
                color: 'var(--primary-text-color)',
                ...styles
            }, {
                type,
                id,
                name: id,
                required,
                placeholder
            });
            return input;
        }

        static createButton(text, id, styles = {}, type = 'button') {
            const button = this.createElement('button', {
                padding: '10px 20px',
                border: 'none',
                borderRadius: '10px',
                backgroundColor: 'transparent',
                color: 'var(--primary-text-color)',
                boxShadow: '0 1px 2px var(--primary-text-color)',
                cursor: 'pointer',
                ...styles
            }, {
                type,
                id
            }, text);
            return button;
        }
    }

    class AuthManager {
        constructor(networkManager, settingsManager) {
            this.network = networkManager;
            // SettingsManager = settingsManager;
            this.converter = new SafeConverter();
        }

        async trySignUp(formData, containerRef) {
            const submitBtn = formData.querySelector('#submit');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '';
            submitBtn.appendChild(UIManager.showLoader());

            try {
                const locationResponse = await fetch('https://ipinfo.io/json');
                const locationData = await locationResponse.json();

                const data = {
                    "FIRST_NAME": formData.querySelector('#first_name').value,
                    "LAST_NAME": formData.querySelector('#last_name').value,
                    "EMAIL": formData.querySelector('#email').value,
                    "PHONE_NO": formData.querySelector('#phone').value,
                    "PASSWORD": formData.querySelector('#pass').value,
                    "IP_INFO": locationData
                };

                const response = await this.network.post('/sign_up', data);
                
                if (response.status === 200) {
                    const responseData = JSON.parse(response.data);
                    SettingsManager.setUid(responseData.UID);
                    SettingsManager.setCookie(responseData.COOKIE);
                    return { success: true, requiresOtp: true };
                } else {
                    throw new Error(response.message || 'Sign up failed');
                }
            } catch (error) {
                throw error;
            } finally {
                this.resetSubmitButton(formData);
            }
        }

        async tryLogin(formData, containerRef) {
            const submitBtn = formData.querySelector('#submit_login_form');
            submitBtn.disabled = true;
            const loader = UIManager.showLoader(formData);

            try {
                const data = {
                    "EMAIL": formData.querySelector('#email').value ||'not found',
                    "PASSWORD": formData.querySelector('#pass').value|| 'not found'
                };
                const response = await this.network.post('/login', data);
                const responseData = JSON.parse(response.data);
                SettingsManager.setUid(responseData.UID);
                SettingsManager.setCookie(responseData.COOKIE);
                return { success: true, uid: responseData.UID, token: responseData.TOKEN };
            } catch (error) {
                if (error.error) {
                    const errorData = JSON.parse(error.error);
                    if (errorData.message === 'Access Denaid ! Verification pending') {
                        SettingsManager.setUid(errorData.UID);
                        SettingsManager.setCookie(errorData.COOKIE);
                        return { success: false, requiresOtp: true };
                    }else{
                         throw new Error(errorData.message);
                    }
                }
                throw error;
            } finally {
                UIManager.removeLoader(formData);
                submitBtn.disabled = false;
            }
        }

        async tryCookieLogin(containerRef) {
            UIManager.showLoader(containerRef);
            
            try {
                const uid = SettingsManager.getUid();
                const cookie = SettingsManager.getCookie();
                
                if (!uid || !cookie) {
                    throw new Error('No stored credentials');
                }

                const response = await this.network.post('/get_token', { UID: uid, COOKIE: cookie });
                const responseData = JSON.parse(response.data);
                
                return { success: true, uid: uid, token: responseData.TOKEN };
            } catch (error) {
                if (error.error) {
                    const errorData = JSON.parse(error.error);
                    return { success: false, error: errorData };
                }
                return { success: false, error: error };
            } finally {
                UIManager.removeLoader(containerRef);
            }
        }

        async submitOtp(otpForm, containerRef) {
            const submitBtn = otpForm.querySelector('#submit');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '';
            submitBtn.appendChild(UIManager.showLoader());

            try {
                let enteredOtp = "";
                otpForm.querySelectorAll('input').forEach(element => {
                    enteredOtp += element.value;
                });

                const data = {
                    "COOKIE": SettingsManager.getCookie(),
                    "UID": SettingsManager.getUid(),
                    "ENTERD_OTP": enteredOtp
                };

                const response = await this.network.post('/account_verification', data);
                const responseData = JSON.parse(response.data);
                
                if (response.status === 200) {
                    return { success: true, token: responseData.TOKEN };
                } else {
                    throw new Error(responseData.message);
                }
            } catch (error) {
                throw error;
            } finally {
                this.resetOtpButton(otpForm);
            }
        }

        async resendOtp(email = '') {
            try {
                const data = {
                    "COOKIE": SettingsManager.getCookie(),
                    "UID": SettingsManager.getUid(),
                    "EMAIL": email,
                    "MODE": email ? "EMAIL_CHANGE" : "DEFAULT"
                };

                const response = await this.network.post('/resend_otp', data);
                return { success: true, data: JSON.parse(response.data) };
            } catch (error) {
                throw error;
            }
        }

        resetSubmitButton(form) {
            const submitBtn = form.querySelector('#submit');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign-Up';
                UIManager.removeLoader(form);
            }
        }

        resetOtpButton(otpForm) {
            const submitBtn = otpForm.querySelector('#submit');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Verify';
                UIManager.removeLoader(otpForm);
            }
        }

        showError(form, message) {
            const errorElement = form.querySelector('#err_p') || form.querySelector('#errP');
            if (errorElement) {
                errorElement.textContent = message;
                setTimeout(() => { errorElement.textContent = ''; }, 3000);
            }
        }
    }

    class ChatManager {
        constructor(networkManager, settingsManager, socketManager) {
            this.network = networkManager;
            // SettingsManager = settingsManager;
            this.socket = socketManager;
            this.allChatsMessages = {};
            this.personalDetails = {};
            this.allChatsList = {};
            this.converter = new SafeConverter();
        }

        async fetchOldMessages() {
            try {
                const data = {
                    UID: SettingsManager.getUid(),
                    COOKIE: SettingsManager.getCookie()
                };

                const response = await this.network.post('/get_old_messages', data);
                const responseData = JSON.parse(response.data);
                return responseData.groups_messages || {};
            } catch (error) {
                ConsoleManager.error('Failed to fetch old messages:', error);
                return {};
            }
        }

        async getPersonalDetails() {
            if (Object.keys(this.personalDetails).length > 0) {
                return this.personalDetails;
            }

            try {
                const data = {
                    'UID': SettingsManager.getUid(),
                    'COOKIE': SettingsManager.getCookie()
                };

                const response = await this.network.post('/get_settings_data', data);
                const responseData = JSON.parse(response.data);
                this.personalDetails = responseData.credentials || {};
                return this.personalDetails;
            } catch (error) {
                ConsoleManager.error('Failed to fetch personal details:', error);
                return {};
            }
        }

        async savePersonalDetailsChanges(formData) {
            try {
                const data = {
                    'PROFILE_PIC': formData.profile_pic,
                    'FIRST_NAME': formData.first_name,
                    'LAST_NAME': formData.last_name,
                    'EMAIL': formData.email,
                    'OTP': formData.otp,
                    'PHONE': formData.phone,
                    'DOB': formData.dob,
                    'UID': SettingsManager.getUid(),
                    'COOKIE': SettingsManager.getCookie()
                };

                const response = await this.network.patch('/get_settings_data', data);
                const responseData = JSON.parse(response.data);
                this.personalDetails = data;
                return responseData.credentials;
            } catch (error) {
                ConsoleManager.error('Failed to save personal details:', error);
                throw error;
            }
        }

        async getAllUsers(token) {
            try {
                const data = {
                    "UID": SettingsManager.getUid(),
                    "TOKEN": token
                };

                const response = await this.network.post('/get_all_users', data);
                return JSON.parse(response.data);
            } catch (error) {
                ConsoleManager.error('Failed to fetch users:', error);
                return {};
            }
        }

        sendMessage(message, groupId, isNewChat = false) {
            const personalDetails = this.personalDetails;
            const socketRoute = isNewChat ? 'send_message_new_chat' : 'send_message';
            
            this.socket.emit(socketRoute, {
                "SENDER_ID": SettingsManager.getUid(),
                "GROUP_ID": groupId,
                "MESSAGE": this.converter.makeSafe(message),
                "PROFILE_PIC": personalDetails.PROFILE_PIC || ''
            });
        }

        setupMessageHandlers(containerRef) {
            const handleMessage = (rawData) => {
                const data = rawData.content || rawData;
                ConsoleManager.log('New message received:', data);

                // Check if message group is open in editor
                if (window.editorManager.files) {
                    let isDisplayed = false;
                    window.editorManager.files.forEach((file) => {
                        if (file.id && file.id.includes(data.GROUP_ID)) {
                            this.displayMessageInChat(data, file);
                            isDisplayed = true;
                            return;
                        }
                    });
                    isDisplayed ? {} : data.SENDER_ID == SettingsManager.getUid() ? {} : NotificationManager.showToast(this.converter.makeUnSafe(data.MESSAGE))
                }

                // Store message in local database
                this.storeMessage(data);
            };

            this.socket.on('new_message', handleMessage);
            this.socket.on('send_message_new_chat', handleMessage);
            this.socket.on('send_message', handleMessage);
        }

        displayMessageInChat(messageData, tab) {
            const tabMessagesContainer = tab.content.shadowRoot.querySelector(`#chats_elemnt_${messageData.GROUP_ID}`);
            if (tabMessagesContainer) {
                this.showMessage(messageData, tabMessagesContainer);
                tabMessagesContainer.scrollTo({
                    top: tabMessagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }

        storeMessage(messageData) {
            if (!this.allChatsMessages[messageData.GROUP_ID]) {
                this.allChatsMessages[messageData.GROUP_ID] = {};
            }
            this.allChatsMessages[messageData.GROUP_ID][messageData.MESSAGE_ID] = {
                "MESSAGE": messageData.MESSAGE,
                "SENDER_ID": messageData.SENDER_ID,
                "SENDER_NAME": messageData.SENDER_NAME,
                "TIME_STAMP": messageData.TIME_STAMP,
                "PROFILE_PIC": messageData.PROFILE_PIC
            };
        }

        showMessage(messageData, container) {
            const isOwnMessage = messageData.SENDER_ID === SettingsManager.getUid();
            const messageElement = document.createElement('fieldset');
            const messageText = this.converter.makeUnSafe(messageData.MESSAGE);

            if (!isOwnMessage) {
                messageElement.style.cssText = "max-width:70%; min-width:30%; display:flex; flex-direction:row; column-gap:20px; border:none; border-radius:10px; box-shadow:0 1px 2px; padding:10px; margin-right:auto;";
                
                const senderLegend = document.createElement('legend');
                senderLegend.style.cssText = 'margin-left:-20px; display:flex; flex-direction:row; column-gap:3px; border-radius: 5px;';

                const senderProfilePic = document.createElement('div');
                senderProfilePic.style.cssText = "height:15px; width:15px; border-radius:5px; margin-top:2px; background-size: cover;";
                senderProfilePic.style.backgroundImage = `url(${messageData.PROFILE_PIC || 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s'})`;
                senderLegend.appendChild(senderProfilePic);

                const senderName = document.createElement('p');
                senderName.textContent = messageData.SENDER_NAME;
                senderLegend.appendChild(senderName);

                messageElement.appendChild(senderLegend);
            } else {
                messageElement.style.cssText = "max-width:70%; min-width:20%; display:flex; flex-direction:row; column-gap:20px; border:none; border-radius:10px; box-shadow:0 1px 2px; padding:10px; margin-left:auto;";
            }

            const messageContent = document.createElement('p');
            messageContent.style.cssText = 'font-weight:500; overflow-x:auto; ' + (isOwnMessage ? 'margin-left:auto;' : 'margin-right:auto;');

            if (messageText.startsWith("render'''")) {
                messageContent.innerHTML = messageText.replace("render'''", " ");
            } else {
                messageContent.textContent = messageText;
            }

            messageElement.appendChild(messageContent);
            container.appendChild(messageElement);
        }
          
        
        requestAllChats(token) {
            
            this.socket.emit('get_all_messages', {
                "UID": SettingsManager.getUid(),
                "TOKEN": token
            });
        }
    }

    class UIRenderer {
        constructor(authManager, chatManager, settingsManager) {
            this.auth = authManager;
            this.chat = chatManager;
            this.network = new NetworkManager()
            // SettingsManager = settingsManager;
        }

        showLoginPage(containerRef) {
            UIManager.clearContainer(containerRef);

            const section = UIManager.createElement('section', { height: '100%' });

            // Header
            const header = this.createHeader('Welcome to', 'Messenger Ax');
            section.appendChild(header);

            // Login Form
            const body = UIManager.createElement('fieldset', {
                border: 'none',
                marginTop: '20px',
                borderRadius: '10px',
                boxShadow: '0 0 10px',
                maxWidth: '92%',
                marginLeft: 'auto',
                marginRight: 'auto'
            });

            const legend = UIManager.createElement('legend', {
                margin: 'auto',
                padding: '5px 12px',
                borderRadius: '40%',
                textShadow: '0px 0px 3px',
                fontWeight: '900',
                fontSize: '20px',
                letterSpacing: '6px',
                boxShadow: '0 0 10px'
            }, {}, ' Login ');

            body.appendChild(legend);

            const loginForm = UIManager.createElement('form');
            loginForm.onsubmit = async (event) => {
                event.preventDefault();
                try {
                    const result = await this.auth.tryLogin(loginForm, containerRef);
                    if (result.success) {
                        this.showMainPage(containerRef, result.uid, result.token);
                    } else if (result.requiresOtp) {
                        this.showOtpPage(containerRef);
                    }
                } catch (error) {
                    this.auth.showError(loginForm, error.message);
                }
            };

            // Email Input
            const emailInput = UIManager.createInputField('email', 'email', 'Enter Your Email');
            emailInput.style.cssText += 'height:35px; display:block; margin:60px auto 0 auto; border-top:none; border-left:none; border-right:none; box-shadow:0 2px 5px var(--primary-text-color);';
            loginForm.appendChild(emailInput);

            // Password Input
            const passwordInput = UIManager.createInputField('password', 'pass', 'Enter Password');
            passwordInput.style.cssText += 'height:35px; display:block; margin:40px auto 0 auto; border-top:none; border-left:none; border-right:none; box-shadow:0 2px 5px var(--primary-text-color);';
            loginForm.appendChild(passwordInput);

            // Submit Button
            const submitBtn = UIManager.createButton('Login', 'submit_login_form', {
                display: 'block',
                margin: '30px auto',
                padding: '10px 20px',
                borderRadius: '30px'
            }, 'submit');
            loginForm.appendChild(submitBtn);

            // Error Message
            const errorP = UIManager.createElement('p', {
                textAlign: 'center',
                color: 'red',
                marginBottom: '8px'
            }, { id: 'errP' });
            loginForm.appendChild(errorP);

            // Sign Up Link
            const signupLink = UIManager.createElement('p', {
                textAlign: 'center',
                marginBottom: '50px'
            });
            signupLink.innerHTML = "Don't have an account? <u id='signup_page_gate' style='color:blue; cursor:pointer;'>Create Account</u> here";
            signupLink.querySelector('#signup_page_gate').onclick = () => this.showSignUpPage(containerRef);
            loginForm.appendChild(signupLink);

            body.appendChild(loginForm);
            section.appendChild(body);
            containerRef.appendChild(section);
        }

        showSignUpPage(containerRef) {
            UIManager.clearContainer(containerRef);

            const section = UIManager.createElement('section', { id: 'section' });

            // Header
            const header = this.createHeader('Welcome to', 'Messenger Ax');
            section.appendChild(header);

            // Sign Up Form
            const body = UIManager.createElement('fieldset', {
                maxWidth: '90%',
                height: '70%',
                border: 'none',
                boxShadow: '0 0 10px',
                margin: '20% auto 0 auto',
                padding: '5%',
                borderRadius: '10px'
            });

            const legend = UIManager.createElement('legend', {
                marginLeft: 'auto',
                marginRight: 'auto',
                padding: '5px',
                boxShadow: '0 0 10px',
                borderRadius: '10px'
            });

            const legendText = UIManager.createElement('p', { id: 'legend_p' }, {}, 'Sign-up');
            legend.appendChild(legendText);
            body.appendChild(legend);

            const signupForm = UIManager.createElement('form', {
                overflowY: 'auto',
                height: '100%',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                paddingTop: '10%'
            }, { id: 'singup_form' });

            signupForm.onsubmit = async (event) => {
                event.preventDefault();
                try {
                    const result = await this.auth.trySignUp(signupForm, containerRef);
                    if (result.success && result.requiresOtp) {
                        this.showOtpPage(containerRef);
                    }
                } catch (error) {
                    this.auth.showError(signupForm, error.message);
                }
            };

            // Form Fields
            const fields = [
                { id: 'first_name', placeholder: 'Enter Your First Name', type: 'text' },
                { id: 'last_name', placeholder: 'Enter Your Last Name', type: 'text' },
                { id: 'email', placeholder: 'Enter Your Email', type: 'email' },
                { id: 'phone', placeholder: 'Phone No. with prefix', type: 'number' },
                { id: 'dob', placeholder: 'dd/mm/yy', type: 'text' },
                { id: 'pass', placeholder: 'New Password', type: 'password' },
                { id: 'confirm_pw', placeholder: 'Re Enter Your Password', type: 'password' }
            ];

            fields.forEach(field => {
                const input = UIManager.createInputField(field.type, field.id, field.placeholder);
                input.style.cssText += 'width: 90%; margin-bottom: 15px;';
                
                if (field.id === 'dob') {
                    input.onclick = () => {
                        input.type = 'date';
                        input.click();
                    };
                }
                
                signupForm.appendChild(input);
            });

            // Error Message
            const errorP = UIManager.createElement('p', {
                color: 'red',
                textAlign: 'center'
            }, { id: 'err_p' });
            signupForm.appendChild(errorP);

            // Submit Button
            const submitBtn = UIManager.createButton('Sign-Up', 'submit', {
                width: '60%',
                borderRadius: '10px',
                margin: '10px auto'
            }, 'submit');
            signupForm.appendChild(submitBtn);

            body.appendChild(signupForm);
            section.appendChild(body);
            containerRef.appendChild(section);
        }

        showOtpPage(containerRef) {
            ConsoleManager.log('showing the otp page')
            UIManager.clearContainer(containerRef);
            
            containerRef.style.cssText = 'margin:auto;';

            const otpForm = UIManager.createElement('form', {
                boxShadow: '0px 0px 4px 1px',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                rowGap: '10px',
                padding: '20px 10px'
            }, { id: 'otp_form' });

            otpForm.onsubmit = async (event) => {
                event.preventDefault();
                try {
                    const result = await this.auth.submitOtp(otpForm, containerRef);
                    if (result.success) {
                        containerRef.style.cssText = 'height:100%; width:100%;';
                        this.showMainPage(containerRef, SettingsManager.getUid(), result.token);
                    }
                } catch (error) {
                    this.auth.showError(otpForm, error.message);
                }
            };

            // OTP Form Content
            const messages = [
                { text: 'Welcome To', styles: 'font-weight:500; margin-top:35px;' },
                { text: 'Messenger Ax', styles: 'font-size:24px; margin-top:15px;' },
                { text: 'OTP Verification', styles: 'padding:5px 20px; box-shadow:1px 1px 2px -0px; border-radius:20px; margin-top:25px;' },
                { text: 'Enter The 6-digit code sent to your email/phone', styles: 'text-align:center; margin-top:15px; font-size:14px;' }
            ];
            
            
            messages.forEach(msg => {
                const p = UIManager.createElement('p', msg.styles, {}, msg.text);
                otpForm.appendChild(p);
            });
            

            // OTP Input Boxes
            const otpBox = UIManager.createElement('div', {
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'flex',
                flexDirection: 'row',
                columnGap: '3px',
                marginTop: '10px'
            }, { id: 'otp_box' });
            
            
            for (let i = 0; i < 6; i++) {
                const digitInput = UIManager.createInputField('text', `digit_${i + 1}`, '', true, {
                    height: '35px',
                    width: '25px',
                    padding: '0 8px',
                    boxShadow: 'inset 0 0 6px 0px',
                    border: 'none',
                    textAlign: 'center'
                });
                digitInput.maxLength = 1;
                digitInput.inputMode = 'numeric';
                otpBox.appendChild(digitInput);
            }
            
            // Setup OTP input navigation
            const inputs = otpBox.querySelectorAll('input');
            inputs.forEach((input, index) => {
                input.addEventListener('input', () => {
                    if (input.value.length === 1 && index < inputs.length - 1) {
                        inputs[index + 1].focus();
                    }
                });
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Backspace' && input.value === '' && index > 0) {
                        inputs[index - 1].focus();
                    }
                });
            });

            otpForm.appendChild(otpBox);

            // Submit Button
            const submitBtn = UIManager.createButton('Verify', 'submit', {
                width: '50%',
                padding: '8px 10px',
                marginTop: '15%',
                borderRadius: '10px'
            }, 'submit');
            otpForm.appendChild(submitBtn);
            
            
            
            // Error Message
            const errorP = UIManager.createElement('span', { color: 'red' }, { id: 'err_p' });
            otpForm.appendChild(errorP);

            // Resend OTP
            const resendText = UIManager.createElement('p', { textAlign: 'center' });
            resendText.innerHTML = "Don't received a code? <span id='resend_otp' style='color:blue; cursor:pointer;'>Resend OTP</span>";
            resendText.querySelector('#resend_otp').onclick = async () => {
                try {
                    await this.auth.resendOtp();
                    NotificationManager.showToast('OTP resent successfully', 'success');
                } catch (error) {
                    this.auth.showError(otpForm, error.message);
                }
            };
            otpForm.appendChild(resendText);
            ConsoleManager.log('appwnded otp form');
            containerRef.appendChild(otpForm);
            inputs[0].focus();
        }

        showMainPage(containerRef, uid, token) {
            UIManager.clearContainer(containerRef);

            const section = UIManager.createElement('section', { height: '96%' }, { id: 'main_screen' });

            // Header
            const header = UIManager.createElement('fieldset', {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '15%',
                height: '5%',
                width: '70%',
                boxShadow: '0 5px 10px',
                borderRadius: '10px',
                border: 'none'
            }, { id: 'chats_hader' });

            const headerLegend = UIManager.createElement('legend', {
                border: 'none',
                marginLeft: 'auto',
                marginRight: 'auto',
                boxShadow: '0 5px 10px',
                padding: '5px'
            }, {}, 'Welcome M.R');
            header.appendChild(headerLegend);

            // Body
            const body = UIManager.createElement('fieldset', {
                border: 'none',
                marginRight: 'auto',
                marginLeft: 'auto',
                marginTop: '20%',
                borderRadius: '10px',
                height: '87%'
            }, { id: 'chatList_body' });

            const bodyLegend = UIManager.createElement('legend', {
                marginLeft: 'auto',
                marginRight: 'auto',
                border: 'none',
                width: '80%'
            });

            const legendContainer = UIManager.createElement('div', {
                marginLeft: 'auto',
                marginRight: 'auto',
                borderRadius: '20px',
                boxShadow: '0 1px 3px',
                padding: '5px',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                height: '100%',
                width: '100%'
                
            });

            // Navigation Buttons
            const navButtons = [
                { id: 'chats_logo', text: 'CHATS', action: () => this.showChatsList(containerRef, token) },
                { id: 'settings_logo', text: '⚙', action: () => this.showSettingsPage(containerRef) },
                { id: 'users_logo', text: 'USERS', action: () => this.showUsersList(containerRef, token) }
            ];

            navButtons.forEach(button => {
                const btn = UIManager.createElement('div', {
                    padding: '3px 10px',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 1px 2px',
                    cursor: 'pointer'
                }, { id: button.id }, button.text);
                btn.onclick = button.action;
                legendContainer.appendChild(btn);
            });

            bodyLegend.appendChild(legendContainer);
            body.appendChild(bodyLegend);

            // Chat List
            const aside = UIManager.createElement('aside', {
                marginTop: '6%',
                overflowY: 'auto',
                height: '80%'
            }, { id: 'aside', className: 'scroll' });

            const chatList = UIManager.createElement('ul', {
                paddingBottom: '12px'
            }, { id: 'ul' });
            aside.appendChild(chatList);

            body.appendChild(aside);
            section.appendChild(header);
            section.appendChild(body);
            containerRef.appendChild(section);

            // Load initial data and show chats
            this.initializeMainPage(containerRef, uid, token);
        }

        async initializeMainPage(containerRef, uid, token) {
            try {
                // Fetch old messages and personal details
                this.chat.allChatsMessages = await this.chat.fetchOldMessages();
                await this.chat.getPersonalDetails();
                
                // Setup message handlers
                this.chat.setupMessageHandlers(containerRef);
                
                // Show chats by default
                this.showChatsList(containerRef, token);
            } catch (error) {
                ConsoleManager.error('Error initializing main page:', error);
                NotificationManager.showToast('Failed to load messages', 'error');
            }
        }

        async showChatsList(containerRef, token) {
            const body = containerRef.querySelector('#chatList_body');
            const list = containerRef.querySelector('#ul');
            UIManager.clearContainer(list);

            // Update active state
            this.updateNavActiveState('chats_logo');

            UIManager.showLoader(body);

            // Show chats
            let response = await this.network.post('/get_all_chats', {UID: SettingsManager.getUid(), COOKIE: SettingsManager.getCookie()});
            if (response.status == 200){
                this.renderChatsList(JSON.parse(response.data).chats, list)
            }else {
                NotificationManager.showToast('err while loadin chats')
            }
            
            // Setup chat list handler
            this.chat.socket.on('get_all_messages', (response) => {
                UIManager.removeLoader(body);
                if (response.status_code === 200) {
                  //  this.renderChatsList(response.chats, list);
                } else {
                    NotificationManager.showToast(response.message, 'error');
                    this.showLoginPage(containerRef);
                }
            });

            // Request chats
            this.chat.requestAllChats(token);
        }

        async showUsersList(containerRef, token) {
            const body = containerRef.querySelector('#chatList_body');
            const list = containerRef.querySelector('#ul');
            UIManager.clearContainer(list);

            // Update active state
            this.updateNavActiveState('users_logo');

            UIManager.showLoader(body);

            try {
                const users = await this.chat.getAllUsers(token);
                UIManager.removeLoader(body);
                this.renderUsersList(users, list);
            } catch (error) {
                UIManager.removeLoader(body);
                NotificationManager.showToast('Failed to load users', 'error');
            }
        }

        async showSettingsPage(containerRef) {
            const list = containerRef.querySelector('#ul');
            const body = containerRef.querySelector('#chatList_body');
            UIManager.clearContainer(list);

            // Update active state
            this.updateNavActiveState('settings_logo');

            try {
                const personalDetails = await this.chat.getPersonalDetails();
                this.renderSettingsPage(personalDetails, list);
            } catch (error) {
                NotificationManager.showToast('Failed to load settings', 'error');
            }
        }

        renderChatsList(chats, list) {
            UIManager.clearContainer(list);
            this.chat.allChatsList = chats;

            Object.keys(chats).forEach(chatId => {
                const chatItem = this.createChatListItem(chatId, chats[chatId].NAME, 'old_chat');
                list.appendChild(chatItem);
            });
        }

        renderUsersList(users, list) {
            UIManager.clearContainer(list);
            const uid = SettingsManager.getUid();

            Object.keys(users).forEach(userId => {
                const combinedId = uid + '0000000000000000' + userId;
                const userItem = this.createChatListItem(combinedId, users[userId].NAME, 'new_chat');
                list.appendChild(userItem);
            });
        }

        createChatListItem(id, name, chatType) {
            const listItem = UIManager.createElement('li', {
                height: '35px',
                padding: '5px 5px 5px 7px',
                boxShadow: '0 1px 3px',
                width: '90%',
                border: 'none',
                margin: '10px auto',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'row',
                columnGap: '10px',
                cursor: 'pointer'
            }, { id });

            listItem.onclick = () => {
                document.querySelector('.mask')?.click();
                this.openChat(id, name, chatType);
            };

            const chatLogo = UIManager.createElement('div', {
                border: 'none',
                borderRadius: '50%',
                height: '35px',
                width: '35px',
                backgroundSize: 'cover',
                backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s)'
            });
            listItem.appendChild(chatLogo);

            const nameText = UIManager.createElement('p', {
                marginTop: 'auto',
                marginBottom: 'auto',
                overflowY: 'auto'
            }, {}, name);
            listItem.appendChild(nameText);

            return listItem;
        }

        renderSettingsPage(personalDetails, list) {
            const mainContainer = UIManager.createElement('main', {
                display: 'flex',
                flexDirection: 'column'
            });

            // Profile Picture Section
            const profileSection = UIManager.createElement('div', {
                display: 'flex',
                flexDirection: 'column'
            });

            const profilePic = UIManager.createElement('div', {
                marginLeft: 'auto',
                marginRight: 'auto',
                height: '100px',
                width: '100px',
                border: '3px solid black',
                borderRadius: '50%',
                backgroundSize: 'cover',
                backgroundImage: `url(${personalDetails.PROFILE_PIC || ''})`
            });

            const profilePicInput = UIManager.createInputField('text', 'profile_pic', 'Profile Picture URL', false, {
                marginTop: '10px'
            });
            profilePicInput.value = personalDetails.PROFILE_PIC || '';
            profilePicInput.readOnly = true;

            profileSection.appendChild(profilePic);
            profileSection.appendChild(profilePicInput);

            // Personal Details Section
            const detailsSection = UIManager.createElement('div', {
                display: 'flex',
                flexDirection: 'column'
            });

            const fields = [
                { id: 'first_name', value: personalDetails.FIRST_NAME || '' },
                { id: 'last_name', value: personalDetails.LAST_NAME || '' },
                { id: 'email', value: personalDetails.EMAIL || '' },
                { id: 'phone', value: personalDetails.PHONE || '' },
                { id: 'dob', value: personalDetails.DOB || '' }
            ];

            fields.forEach(field => {
                const input = UIManager.createInputField('text', field.id, '', false);
                input.value = field.value;
                input.readOnly = true;
                detailsSection.appendChild(input);
            });

            // OTP Section (hidden by default)
            const otpSection = UIManager.createElement('div', {
                width: '100%',
                border: 'none',
                display: 'none'
            }, { id: 'toggling_otp_box' });

            const otpInput = UIManager.createInputField('text', 'otp', 'Enter the OTP', false, {
                width: '70%',
                marginLeft: 'auto',
                marginRight: 'auto',
                display: 'block'
            });
            otpSection.appendChild(otpInput);

            const otpStatus = UIManager.createElement('p', { textAlign: 'center' });
            otpSection.appendChild(otpStatus);

            const otpButton = UIManager.createButton('Send OTP', 'otp_btn', {
                padding: '10px',
                margin: '10px auto',
                display: 'block',
                border: 'none',
                borderRadius: '8px'
            });
            otpButton.onclick = async () => {
                otpButton.disabled = true;
                const loader = UIManager.showLoader(otpButton);
                try {
                    const emailInput = detailsSection.querySelector('#email');
                    await this.auth.resendOtp(emailInput.value);
                    otpStatus.textContent = 'OTP sent successfully';
                } catch (error) {
                    otpStatus.textContent = error.message;
                } finally {
                    UIManager.removeLoader(otpButton);
                    otpButton.disabled = false;
                }
            };
            otpSection.appendChild(otpButton);

            detailsSection.appendChild(otpSection);

            // Email change handler
            const emailInput = detailsSection.querySelector('#email');
            emailInput.onchange = () => {
                const originalEmail = personalDetails.EMAIL;
                otpSection.style.display = emailInput.value !== originalEmail ? 'block' : 'none';
            };

            // Edit/Save Button
            const actionButton = UIManager.createButton('Edit', 'changes_btn', {
                marginTop: '20px'
            });
            let isEditing = false;

            actionButton.onclick = async () => {
                if (!isEditing) {
                    // Switch to edit mode
                    mainContainer.querySelectorAll('input').forEach(input => {
                        input.readOnly = false;
                    });
                    actionButton.textContent = 'Save';
                    isEditing = true;
                } else {
                    // Save changes
                    try {
                        const formData = {
                            profile_pic: profilePicInput.value,
                            first_name: detailsSection.querySelector('#first_name').value,
                            last_name: detailsSection.querySelector('#last_name').value,
                            email: detailsSection.querySelector('#email').value,
                            otp: otpInput.value,
                            phone: detailsSection.querySelector('#phone').value,
                            dob: detailsSection.querySelector('#dob').value
                        };
                        await this.chat.savePersonalDetailsChanges(formData);
                        NotificationManager.showToast('Settings saved successfully', 'success');
                        actionButton.textContent = 'Edit';
                        isEditing = false;
                    } catch (error) {
                        NotificationManager.showToast('Failed to save settings', 'error');
                    }
                }
            };

            mainContainer.appendChild(profileSection);
            mainContainer.appendChild(detailsSection);
            mainContainer.appendChild(actionButton);
            list.appendChild(mainContainer);
        }

        openChat(chatId, chatName, chatType) {
            // Close existing chat tab if open
            const existingTab = editorManager.getFile(`messanger_tab_${chatId}`, 'id');
            if (existingTab) {
                existingTab.remove();
            }

            const container = UIManager.createElement('div', {
                marginBottom: '0',
                width: '99%',
                border: 'none',
                height: '98%'
            });

            this.renderChatInterface(chatId, chatName, chatType, container);

            const tab = new editorFile(chatName, {
                type: 'page',
                uri: 'By Messenger - AX',
                id: `messanger_tab_${chatId}`,
                tabIcon: 'icon messanger',
                content: container,
                stylesheets: '/static/css/tab.css',
                hideQuickTools: true,
                render: true
            });
        }

        renderChatInterface(chatId, chatName, chatType, container) {
            const mainPage = UIManager.createElement('div', {
                minHeight: '99%',
                maxHeight: '99%',
                minWidth: '99%',
                maxWidth: '99%',
                display: 'flex',
                flexDirection: 'column',
                marginLeft: 'auto',
                marginRight: 'auto'
            }, { id: 'idds' });

            // Header
            const header = UIManager.createElement('div', {
                position: 'sticky',
                boxShadow: '0 1px 2px',
                marginTop: '2%',
                width: '92%',
                marginLeft: 'auto',
                marginRight: 'auto',
                border: 'none',
                borderRadius: '20px',
                display: 'flex',
                flexDirection: 'row',
                padding: '5px 7px'
            });

            const chatLogo = UIManager.createElement('div', {
                height: '30px',
                width: '30px',
                borderRadius: '50%',
                border: 'none',
                marginTop: 'auto',
                marginBottom: 'auto',
                backgroundSize: 'cover',
                backgroundImage: 'url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s)'
            }, { id: 'logo_div' });

            const chatNameElement = UIManager.createElement('p', {
                flexGrow: '1',
                margin: 'auto 0 auto 20px',
                overflowY: 'auto'
            }, {}, chatName);

            header.appendChild(chatLogo);
            header.appendChild(chatNameElement);

            // Messages Area
            const messagesArea = UIManager.createElement('div', {
                minWidth: '95%',
                maxWidth: '95%',
                minHeight: '100%',
                maxHeight: '100%',
                flexGrow: '1',
                display: 'flex',
                marginLeft: 'auto',
                marginRight: 'auto'
            });

            const messagesContainer = UIManager.createElement('section', {
                flexGrow: '1',
                overflowY: 'auto',
                minHeight: '90%',
                maxHeight: '90%',
                display: 'flex',
                flexDirection: 'column',
                rowGap: '10px',
                padding: '20px'
            }, { id: `chats_elemnt_${chatId}`, className: 'scroll' });

            messagesArea.appendChild(messagesContainer);

            // Input Area
            const inputArea = UIManager.createElement('div', {
                width: '96%',
                minHeight: '55px',
                maxHeight: '100px',
                margin: '0 2% 9px 2%',
                overflow: 'hidden',
                border: 'none',
                marginBottom: '0'
            });

            const messageForm = UIManager.createElement('form', {
                display: 'flex',
                flexDirection: 'row',
                columnGap: '10px',
                border: '1px solid',
                padding: '6px 6px',
                maxHeight: '100%',
                maxWidth: '100%',
                borderRadius: '30px'
            }, { id: 'message-form' });

            messageForm.onsubmit = (event) => {
                event.preventDefault();
                const textarea = messageForm.querySelector('#message-textarea');
                const message = textarea.value.trim();
                if (message) {
                    this.chat.sendMessage(message, chatId, chatType === 'new_chat');
                    textarea.value = '';
                }
            };

            const messageInput = UIManager.createElement('textarea', {
                flexGrow: '1',
                border: 'none',
                padding: '12px 15px 5px 15px',
                borderRadius: '20px',
                boxShadow: '0 1px 2px var(--primary-text-color)',
                background: 'transparent',
                color: 'var(--primary-text-color)',
                resize: 'none'
            }, { 
                id: 'message-textarea',
                rows: '1',
                placeholder: 'Type your message'
            });

            const sendButton = UIManager.createButton('Send', 'send_btn', {
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                border: 'none',
                boxShadow: '0 2px 4px var(--primary-text-color)'
            }, 'submit');

            messageForm.appendChild(messageInput);
            messageForm.appendChild(sendButton);
            inputArea.appendChild(messageForm);

            // Assemble the chat interface
            mainPage.appendChild(header);
            mainPage.appendChild(messagesArea);
            mainPage.appendChild(inputArea);
            container.appendChild(mainPage);

            // Load existing messages
            this.loadChatMessages(chatId, messagesContainer);
        }

        loadChatMessages(chatId, container) {
            const messages = this.chat.allChatsMessages[chatId];
            if (messages) {
                Object.values(messages).forEach(messageData => {
                    this.chat.showMessage(messageData, container);
                });
                
                // Scroll to bottom
                setTimeout(() => {
                    container.scrollTo({
                        top: container.scrollHeight,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }

        updateNavActiveState(activeId) {
            const navIds = ['chats_logo', 'settings_logo', 'users_logo'];
            navIds.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    if (id === activeId) {
                        element.style.backgroundColor = CSS_VARS.primary;
                    } else {
                        element.style.backgroundColor = 'transparent';
                    }
                }
            });
        }

        createHeader(title, subtitle) {
            const header = UIManager.createElement('fieldset', {
                marginLeft: 'auto',
                marginRight: 'auto',
                marginTop: '30px',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 0 10px',
                width: '80%'
            }, { id: 'hader' });

            const titleLegend = UIManager.createElement('legend', {
                marginLeft: 'auto',
                marginRight: 'auto',
                border: 'none',
                padding: '5px',
                boxShadow: '0 0 10px',
                borderRadius: '40%',
                textShadow: '0px 0px 3px',
                fontWeight: '400'
            }, {}, title);

            const subtitleElement = UIManager.createElement('p', {
                textAlign: 'center',
                letterSpacing: '8px',
                marginTop: '10px',
                marginBottom: '5px',
                fontWeight: '1000',
                textShadow: '0 0 10px',
                marginLeft: 'auto',
                marginRight: 'auto'
            }, {}, subtitle);

            header.appendChild(titleLegend);
            header.appendChild(subtitleElement);

            return header;
        }
    }

    // Main Plugin Class
    class MessengerPlugin {
        constructor() {
            this.sidebarContainerRef = null;
            this.customListener = new CustomListener();
            this.networkManager = new NetworkManager();
            this.settingsManager = new SettingsManager();
            this.authManager = new AuthManager(this.networkManager, this.settingsManager);
            this.socketManager = new WebSocketManager();
            this.chatManager = new ChatManager(this.networkManager, this.settingsManager, this.socketManager);
            this.uiRenderer = new UIRenderer(this.authManager, this.chatManager, this.settingsManager);
            this.baseUrl = '';
        }

        async install() {
            try {
                ConsoleManager.log('Initializing Messenger Plugin...');
                
                // Add plugin icon
                acode.addIcon('messanger', `${this.baseUrl}icon.png`);

               
               // Setup sidebar
            this.setupSidebar();

                ConsoleManager.log('Messenger Plugin initialized successfully');
            } catch (error) {
                ConsoleManager.error('Error initializing plugin:', error);
                NotificationManager.showToast('Failed to initialize plugin', 'error');
            }
        }
        
        setupSidebar() {
            sidebarApps.add(
                "messanger",
                PLUGIN_ID,
                "Messenger-Ax",
                this.initializeSidebarUI.bind(this),
                false,
                this.onSidebarSelected.bind(this)
            );
        }

        initializeSidebarUI(container) {
            const containerRef = UIManager.createElement('div', {
                height: '100%',
                width: '100%'
            });
            
            container.style.cssText = 'border: 0px solid; border-radius:10px; max-width:98%; background-color: var(--active-icon-color)';
            container.appendChild(containerRef);

            this.sidebarContainerRef = containerRef;
            this.runMain(containerRef);
        }

        onSidebarSelected(container) {
            ConsoleManager.log("Sidebar selected");
        }

        async runMain(containerRef) {
             // Connect to WebSocket
            this.socketManager.connect(`${SERVER_URL}/ws`);
            ConsoleManager.log('WebSocket connected successfully');
            
            ConsoleManager.log('Checking authentication status...');
            this.customListener.addEventListener('onLine', ()=>{this.runMain(containerRef)});
            if (!navigator.onLine) {
                NotificationManager.showToast("You're offline", 'warning', 2000);
                this.uiRenderer.showLoginPage(containerRef);
                this.setupNetworkListeners(containerRef);
                return;
            }

            try {
                const loginResult = await this.authManager.tryCookieLogin(containerRef);
                if (loginResult.success) {
                    this.uiRenderer.showMainPage(containerRef, loginResult.uid, loginResult.token);
                } else {
                    this.handleLoginFailure(loginResult.error, containerRef);
                }
            } catch (error) {
                ConsoleManager.error('Authentication error:', error);
                this.uiRenderer.showLoginPage(containerRef);
            }
        }

        setupNetworkListeners(containerRef) {
            const networkHandler = () => {
                ConsoleManager.log('Network status changed, re-authenticating...');
                this.runMain(containerRef);
            };
            
            window.addEventListener('online', networkHandler);
            window.addEventListener('offline', networkHandler);
        }

        handleLoginFailure(error, containerRef) {
            if (error && error.message === 'Verification pending') {
                NotificationManager.showToast('Please verify your email', 'warning');
                this.uiRenderer.showOtpPage(containerRef);
                SettingsManager.setCookie(error.COOKIE);
                SettingsManager.setUid(error.UID);
            } else {
                this.uiRenderer.showLoginPage(containerRef);
                if (error && error.message) {
                    const errorElement = containerRef.querySelector('#errP');
                    if (errorElement) {
                        errorElement.textContent = error.message;
                    }
                }
            }
        }

        async uninstall() {
            try {
                if (this.socketManager) {
                    this.socketManager.disconnect();
                }
                sidebarApps.remove(PLUGIN_ID);
                ConsoleManager.log('Messenger Plugin uninstalled successfully');
            } catch (error) {
                ConsoleManager.error('Error uninstalling plugin:', error);
            }
        }
    }

    // Plugin initialization
    if (window.acode) {
        const messengerPlugin = new MessengerPlugin();
        
        acode.setPluginInit(PLUGIN_ID, async (baseUrl, options, { cacheFileUrl, cacheFile }) => {
            if (!baseUrl.endsWith("/")) baseUrl += "/";
            messengerPlugin.baseUrl = baseUrl;
            await messengerPlugin.install(options, cacheFile, cacheFileUrl);
        });
        
        acode.setPluginUnmount(PLUGIN_ID, () => {
            messengerPlugin.uninstall();
        });
    } else {
        ConsoleManager.error('Acode not available - plugin cannot initialize');
    }
})();