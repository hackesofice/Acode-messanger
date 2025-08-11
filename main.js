"use-strict";
(() => {
    const sidebarApps = acode.require('sidebarApps');
    const tab_view = acode.require('editorFile');
    const settings = acode.require('settings');
    const fs = acode.require('fs');
    const SERVER_URL = 'http://localhost:5000';//'https://acode-chat-backend.onrender.com/';
    let container_login_content = false;

    var menifest = {
        "id": "hackesofice.messanger"
    }
    

    class messanger {
        constructor() { }
        async install() {
            const scriptURL = this.baseUrl + 'socket.js'; // not working
            console.log(scriptURL);
            let dynamicScript = document.createElement('script');
            dynamicScript.src = 'https://cdn.jsdelivr.net/npm/socket.io-client@4/dist/socket.io.js';
            document.head.appendChild(dynamicScript);
            await new Promise((resolve) => {
                dynamicScript.onload = resolve;
            });
            
             acode.addIcon('messanger', `${this.baseUrl}icon.png`);
            // await new Promise((resolve) => {
            //     icon.onload = resolve;
            // });
            

            // when app starts or plugin is installed then 
            // now start and connect websocket if navigator.on is == true (means connected to internet)
            // if navigator.on == false then set the event listner for It and start websocket when net avilable
            // after sucessfull connction ask for any new messages
            // show new mesaages list on sidebar 
            // if user clicks on any chat then open on mew tab and at the same time close the sidebar
            // also set a local database with encryption key ( dont know whats this encryption key )
            //////////////////////
            /// All communication traffic goes through websocket
            ///////////////////////////////////////////////
            ////lets start the journey

            /////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////
            /////////////////// LETS DESIGN THE LOGIN UI PAGE ///////////////////////
            /////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////
            async function try_sign_up(event, signup_form, container_refrence){
                event.preventDefault();
                const location = await fetch('https://ipinfo.io/json', {
                    method: 'GET',
                });
                let location_data = await location.json();// ill extract data like city and ip from this response 
                const data = {
                    "FIRST_NAME": signup_form.querySelector('#first_name').value,
                    "LAST_NAME": signup_form.querySelector('#last_name').value,
                    "EMAIL": signup_form.querySelector('#email').value,
                    "PHONE_NO": signup_form.querySelector('#phone').value,
                    "PASSWORD": signup_form.querySelector('#pass').value,
                    "IP_INFO": location_data
                }
                
                const response = await fetch(`${SERVER_URL}/sign_up`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const responseData = await response.json()
                if (response.ok){
                    if (responseData.message.includes('verification pendding')){
                        settings.value[menifest.id] = {
                            COOKIE: "",
                            UID: ""
                        }
                        settings.update({
                            [menifest.id]:{
                                COOKIE: responseData.COOKIE,
                                UID: responseData.UID
                            }
                        });
                        console.log(container_refrence);
                        /////////////// pass the body and append otp ///////////
                        show_otp_page(container_refrence)
                    }
                    else{
                        console.log(responseData.message)
                    }
                }
                else{
                    console.log(responseData)
                }
                
            }
            async function submit_otp(event, otp_form, container_refrence){
                event.preventDefault();
                let ENTERD_OTP = otp_form.querySelector('#otp_input').value;
                let UID = settings.get(menifest.id).UID
                let COOKIE = settings.get(menifest.id).COOKIE
                
                const data = {
                    "COOKIE": COOKIE,
                    "UID":UID,
                    "ENTERD_OTP":ENTERD_OTP
                }
                console.log(data)
                try {
                    const response = await fetch(`${SERVER_URL}/account_verification`, {
                        method: "POST",
                        body: JSON.stringify(data),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response) {
                        if (response.ok) {
                            const responseData = await response.json()
                            console.log(responseData);
                            otp_form.querySelector('#err_p').innerText = responseData.message
                            console.log(responseData.TOKEN)
                            show_chats(container_refrence, UID, responseData.TOKEN)
                        } else {
                            const responseData = await response.json()
                            console.log(responseData);
                            otp_form.querySelector('#err_p').innerText = responseData.message;
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
                
            }
            
            
            
            async function try_login(event, login_form) {
                event.preventDefault();
                let btn = login_form.querySelector('#pass');
                btn.disabled = true;
                let data = {
                    "EMAIL": login_form.querySelector('#email').value,
                    "PASSWORD": login_form.querySelector('#pass').value
                }
                console.log(data);
                // send the data to the server through POST method to appropriate endpoint
                try {
                    console.log(`${SERVER_URL}/login`);
                    const response = await fetch(`${SERVER_URL}/login`, {
                        method: 'POST',
                        body: JSON.stringify(data),
                        headers: {
                            "Content-Type": 'application/json'
                        }
                    });
                    if (response.ok) {
                        let data = await response.json();
                        // settings.value[menifest.id] = {
                        //     COOKIE: data.COOKIE,
                        //     UID: data.UID
                        // }
                        settings.update({
                            [menifest.id]: {
                                UID: data.UID,
                                COOKIE: data.COOKIE
                            }
                        });
                        console.log(data)
                        // fire_socket() //contaimer isnt accessible so its useless
                    } else {
                        console.log(await response.json())
                    }
                } catch (err) {
                    console.log(`error while login ==>> ${err}`);
                }
                btn.disabled = false;
            }
            
            
            async function try_cookie_login(){
                try{
                    const plugin_settings = settings.get(menifest.id);
                        if (plugin_settings){
                            const UID = plugin_settings.UID;
                            const COOKIE = plugin_settings.COOKIE;
                            if (UID && COOKIE){
                                let response = await fetch(`${SERVER_URL}/get_token`, {
                                    method: 'POST',
                                    body: JSON.stringify({
                                        "UID": UID,
                                        "COOKIE": COOKIE
                                    }),
                                    headers:{
                                        "Content-Type": "application/json"
                                    }
                                });
                                if (response.ok){
                                    const responseData = await response.json();
                                    console.log(responseData)
                                    return responseData.TOKEN
                                }else{
                                    //console.log(response);
                                    return false
                                }
                            }else{
                               // uid or cookie are empty
                               return false
                           }
                        }else{
                            // no plugin sertings avilable 
                            // means login required
                            return false
                        }
                }catch(err){
                    console.log(err)
                    return false
                }
            }

            function show_otp_page(container_refrence){
              //  body.removeChild(body.querySelector('#singup_form'));
              //  body.querySelector('#legend_p').innerText = 'Verification';
                while (container_refrence.firstChild){
                    container_refrence.removeChild(container_refrence.firstChild);
                }
                let otp_form = document.createElement('form');
                    otp_form.id = 'otp_form';
                    otp_form.style.cssText = `margin:auto; margin-top: 30%; `;
                    otp_form.onsubmit = (event) => {submit_otp(event, otp_form, container_refrence)}
                    container_refrence.appendChild(otp_form)
                    
                    let otp_box = document.createElement('input');
                        otp_box.id = 'otp_input';
                        otp_box.name = 'otp';
                        otp_box.placeholder = 'Enter OTP'
                        otp_box.style.cssText = `margin-left:auto; margin-right:auto;`;
                        otp_form.appendChild(otp_box)
                    
                    let otp_submit = document.createElement('button');
                        otp_submit.type = 'submit';
                        otp_submit.innerText = 'Verify';
                        otp_submit.style.cssText = `padding:10px; margin-top:20%; border-radius:10px; border:none; background-color: grey;`;
                        otp_form.appendChild(otp_submit)
                    
                    let err_p = document.createElement('span');
                        err_p.id = 'err_p';
                        otp_form.appendChild(err_p);
                        
                container_refrence.appendChild(otp_form)
            }
            
            
            function sign_up_page(container_refrence) {
                let section = document.createElement('section');
                    section.id = 'section';

                    let hader = document.createElement('fieldset');
                        hader.id = 'hader';
                        hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:30px;border-radius: 10px; height: 60px; border: none; box-shadow:0 0 10px; width:80%;`;
                        let center_hader1 = document.createElement('legend');
                            center_hader1.innerText = 'Welcome to';
                            center_hader1.style.cssText = `margin-left:auto; margin-right: auto; border:none; padding:5px; box-shadow:0 0 10px; border-radius: 40%; padding:5px;`;
                            hader.appendChild(center_hader1);
                        let p1 = document.createElement('p');
                            p1.innerText = ' J U P I T E R ';
                            p1.style.cssText = `text-align:center; latter-spacing:8px;`
                            hader.appendChild(p1);
                            
                    let body = document.createElement('fieldset');
                        body.style.cssText = `max-width:90%; height:70%;border:none; box-shadow:0 0 10px;margin-left:auto; margin-right:auto; margin-top: 20%; padding:5%; border-radius:10px;`;
                        
                        let legend = document.createElement('legend');
                            legend.style.cssText = `margin-left:auto; margin-right:auto; padding:5px; box-shadow:0 0 10px; border-radius:10px`;
                            
                            let legend_p = document.createElement('p');
                                legend_p.id = 'legend_p';
                                legend_p.style.cssText = ``;
                                legend_p.innerText = ' Sign-up ';
                                legend.appendChild(legend_p);
                            body.appendChild(legend);
                        
                        let signup_form = document.createElement('form');
                            signup_form.id = 'singup_form';
                            signup_form.classList = 'scroll';
                            signup_form.style.cssText = `overflow-y:auto; height:100%; margin-left:auto; margin-right:auto;`;
                            signup_form.onsubmit = (event) => {try_sign_up(event, signup_form,container_refrence);}
                            
                            let first_name = document.createElement('input');
                                first_name.name = 'first_name';
                                first_name.id = 'first_name';
                                first_name.placeholder = 'Enter Your first Name';
                                first_name.style.cssText = `height:70px;`;
                                first_name.className = 'input';
                                signup_form.appendChild(first_name);
                            
                            let last_name = document.createElement('input')
                                last_name.name = 'last_name';
                                last_name.id = 'last_name';
                                last_name.placeholder = 'Enter your last name';
                                last_name.className  = 'input';
                                signup_form.appendChild(last_name);
                            
                            let email = document.createElement('input');
                                email.type = 'email';
                                email.name = 'email';
                                email.id = 'email';
                                email.className = 'input';
                                email.placeholder = 'enter email';
                                signup_form.appendChild(email);
                            
                            let phone = document.createElement('input');
                                phone.type = 'number';
                                phone.name = 'phone';
                                phone.id = 'phone';
                                phone.className = 'input';
                                phone.placeholder = 'enter phone';
                                signup_form.appendChild(phone);
                            
                            let dob = document.createElement('input')
                                dob.type = 'date'
                                dob.name = 'dob';
                                dob.placeholder = 'dd/mm/yy';
                                signup_form.appendChild(dob)
                            
                            let pw = document.createElement('input');
                                pw.name = 'password';
                                pw.type = 'password';
                                pw.id = 'pass';
                                pw.className = 'input';
                                pw.placeholder = 'enter password';
                                signup_form.appendChild(pw);
                                
                            let confirm_pw = document.createElement('input');
                                confirm_pw.type = 'text';
                                confirm_pw.id = 'confirm_pw';
                                confirm_pw.className = 'input';
                                confirm_pw.placeholder = 'Re Enter Your Password';
                                signup_form.appendChild(confirm_pw);
                            
                            let submit = document.createElement('button');
                                submit.type = 'submit';
                                submit.innerText = 'Sign-Up';
                                signup_form.appendChild(submit);
                            
                            body.appendChild(signup_form);
                            
                    let style = document.createElement('style');
                        style.textContent = `
                            .input{
                                background-color:red;
                            }
                        `;
                                
                                

                section.appendChild(hader);
                section.appendChild(body);
                section.appendChild(style);
                
                /// clar the container
                while (container_refrence.firstChild){
                    console.log('clearing')
                    container_refrence.removeChild(container_refrence.firstChild);
                }
                container_refrence.appendChild(section)
            }
            
            
            
            
            
            function show_login_page(container_refrence) {
                let section = document.createElement('section');
                section.id = 'section'

                let hader = document.createElement('fieldset');
                    hader.id = 'hader';
                    hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:30px;border-radius: 10px; height: 60px; border: none; box-shadow:0 0 10px; width:80%;`;
                    let center_hader1 = document.createElement('legend');
                        center_hader1.innerText = 'Welcome to';
                        center_hader1.style.cssText = `margin-left:auto; margin-right: auto; border:none; padding:5px; box-shadow:0 0 10px; border-radius: 40%; padding:5px;`;
                        hader.appendChild(center_hader1);
                    let p1 = document.createElement('p');
                        p1.innerText = ' J U P I T E R ';
                        p1.style.cssText = `text-align:center; latter-spacing:8px;`
                        hader.appendChild(p1);
                //container.appendChild(hader);

                let body = document.createElement('fieldset');
                body.id = 'body';
                body.style.cssText = `border: none; margin-top: 20px; border-radius: 10px; box-shadow:0 0 10px; max-width:92%; margin-left:auto; margin-right:auto;`;
                let center_hader = document.createElement('legend');
                center_hader.innerText = ' Login ';
                center_hader.style.cssText = `margin:auto;padding:5px 12px; border-radius:40%; text-shadow: 0px 0px 3px; font-weight:900; font-size: 20px; letter-spacing:6px; box-shadow: 0 0 10px;`;
                body.appendChild(center_hader);

                let login_form = document.createElement('form');
                // login_form.id = 'login_form';
                // login_form.action = 'https://google.com/';
                login_form.onsubmit = (event) => { try_login(event, login_form) }
                body.appendChild(login_form);

                let email_input = document.createElement('input');
                email_input.type = 'email';
                email_input.name = 'EMAIL';
                email_input.required = true;
                email_input.id = 'email';
                email_input.placeholder = 'Enter Email';
                email_input.style.cssText = `height:35px; display:block; margin-left:auto;margin-right:auto; margin-top:60px; border-top:none; border-left:none; border-right: none; box-shadow: 0 5px 10px;`;
                login_form.appendChild(email_input);

                let pass = document.createElement('input');
                pass.name = 'PASSWORD';
                pass.type = 'password';
                pass.required = true;
                pass.id = 'pass';
                pass.placeholder = 'Enter Password';
                pass.style.cssText = `height:35px; display:block; margin-left:auto; margin-right:auto; margin-top:40px; border-top:none; border-left:none; border-right:none; box-shadow: 0 5px 10px;`;
                login_form.appendChild(pass);

                let submit = document.createElement('button');
                submit.type = 'submit';
                submit.innerText = 'SUBMIT';
                //submit.onClick = submit_data
                submit.style.cssText = `display: block; margin-left:auto; margin-right:auto; margin-top:30px; margin-bottom:30px; background-color:transperent; padding:10px 20px; border-radius:30px;`;
                login_form.appendChild(submit);

                let errP = document.createElement('p');
                errP.id = 'errP';
                errP.style.cssText = `text-align:center; color:red; margin-bottom:8px;`;
                login_form.appendChild(errP);

                let p = document.createElement('p');
                p.style.cssText = `text-align: center; margin-bottom:50px`;
                p.innerHTML = "Don't have an account ? <u id='signup_page_gate'> Create Account </u> hear ";
                p.addEventListener('click', ()=>{sign_up_page(container_refrence)})
                login_form.appendChild(p);

                let style = document.createElement('style');
                style.textContent = `
                            #signup_page_gate {
                                color:blue;
                            }
                            #signup_page_gate:hover {
                                color:grey;
                            }
                        `;

                section.appendChild(style);
                section.appendChild(hader);
                section.appendChild(body);
                
                console.log('Showing Conyainer refrence', container_refrence)
                //clear contaoner
                while (container_refrence.firstChild){
                    console.log('clearing')
                    container_refrence.removeChild(container_refrence.firstChild);
                }
                container_refrence.appendChild(section);
                return true
            }


            function show_chats(container_refrence, UID, TOKEN) {
                let socket = io.connect(SERVER_URL);
                // const PLUGIN_SETINGS = settings.get([menifest.id]);
                try {
                    socket.on('connect', () => {
                        socket.emit('get_all_chat_list', { "UID": UID, "TOKEN": TOKEN }, (response) => {
                            console.log('get all message socket endpoint respomse', response)
                            if (response.status_code == 200) {
                                while(container_refrence.firstChild){
                                    container_refrence.removeChild(firstChild);
                                }
                                let section = document.createElement('section');
                                section.style.cssText = 'height:96%;';
                                section.id = 'main_screen';

                                let hader = document.createElement('fieldset');
                                hader.id = 'chats_hader';
                                hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:15%; height:5%; width:70%; box-shadow:0 5px 10px; border-radius:10px; border:none;`;

                                let legend = document.createElement('legend');
                                legend.innerText = 'Welcome M.R';
                                legend.style.cssText = `border:none; margin-left:auto; margin-right:auto; box-shadow:0 5 10px; padding:5px;`;
                                hader.appendChild(legend);

                                let body = document.createElement('fieldset');
                                // body.className = 'scroll';
                                body.style.cssText = `border:none; margin-right:auto; margin-left:auto; box-shadow:0 0 10px; margin-top:20%; border-radius:10px; height:87%; `;

                                let legend2 = document.createElement('legend');
                                legend2.innerText = ' CHATS ';
                                legend2.style.cssText = `margin-left:auto; margin-right:auto; padding:5px;`;
                                body.appendChild(legend2);

                                /// now use the foreach loop to show the chats
                                let aside = document.createElement('aside');
                                aside.className = 'scroll';
                                aside.style.cssText = `overflow-y:auto; height:100%`;
                                let list = document.createElement('ul');
                                list.className = '';
                                list.style.cssText = `padding-bottom: 12px;`;
                                aside.appendChild(list);
                                Object.keys(response.chats).forEach(key => {
                                    let list_item = document.createElement('li');
                                    list_item.id = key;
                                    //list_item.innerText = CHATS_OBJECT[key]['name'];
                                    list_item.style.cssText = `height:40px; box-shadow:0 2px 5px; width:90%; border:none; margin-left:auto; margin-right:auto; margin-top:10px; border-radius: 10px;`;
                                    list_item.addEventListener('click', () => {
                                        //list_item.style.cssText ="background-color:blue";

                                        if (window.editorManager.getFile('messanger_tab', 'id')) {
                                            window.editorManager.getFile('messanger_tab', 'id').remove();
                                        }
                                        console.log(key, CHATS_OBJECT[key]['name'])
                                        open_chat(key, CHATS_OBJECT[key]['name'])
                                    })
                                    let name_text = document.createElement('p');
                                    name_text.style.cssText = `margin-top:auto; margin-bottom:auto;`;
                                    name_text.innerText = CHATS_OBJECT[key]['name'];
                                    list_item.appendChild(name_text);

                                    list.appendChild(list_item);
                                });

                                body.appendChild(aside);
                                let style = document.createElement('style');
                                style.textContent = `aside::-webkit-scrollbar{display:none; color:blue;}`;

                                section.appendChild(style);
                                section.appendChild(hader);
                                section.appendChild(body);

                                console.log(section);
                                container_refrence.appendChild(section);
                            } else {
                                alert(response.message);
                                show_login_page(container_refrence);
                            }
                        });
                    });
                } catch (err) {
                    console.log(err)
                }
            }









            async function run_main(container_refrence){
                console.log('youre online now')
                const TOKEN = await try_cookie_login();
                const UID = settings.get(menifest.id).UID;
             //   console.log(TOKEN)
                    if(TOKEN && UID){
                        console.log('showing chats')
                        //console.log(UID, TOKEN)
                        // means we have token
                       show_chats(container_refrence, UID, TOKEN)
                    }else{
                        console.log('login please');
                        // means auto login not completed
                        // pass container_refrence on show_login_page function
                        show_login_page(container_refrence);
                    }
            }
            //////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            /////// LETS SETUP THE WEBSOCKET CONNECTION AND GATHER THE ALL CHATS
            /////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            function fire_socket(container) {
                // document.addEventListener('online', () => { console.log('im online') })
                container.style.cssText = `border: 0px solid;box-shadow: 0 0 10px; border-radius:10px;height:96%; max-width:98%;margin-top:3.5%;`;
                let container_refrence = document.createElement('div');
                    container_refrence.style.cssText = `height:100%; width:100%;`;
                    container.appendChild(container_refrence);
                    /// now ill able to access this container elemnt from any where
                    function run_main_healper(){
                        run_main(container_refrence)
                    }
                    run_main_healper()
                    window.addEventListener('online', run_main_healper);
                    
                    
                    
                    
                    
                    
                    
                    
                    
                    
                // //container.className = 'scroll';
                // let socket = io.connect(SERVER_URL);
                // socket.on('connect', () => {
                //     console.log("connected ✓✓✓  gatherring  chats");
                //     let accessToken = null;
                //     let PLUGIN_SETINGS = settings.get('hackesofice.messanger');
                //     //console.log(PLUGIN_SETINGS)
                //     if (PLUGIN_SETINGS) {
                //         if (navigator.onLine) {
                //             let UID = PLUGIN_SETINGS.UID;
                //             let COOKIE = PLUGIN_SETINGS.COOKIE;
                //             /// fetch the accessToken to use it 
                //             ////////socket io endpoint //////// json data for server /////////////////////////////////////////////////////////////////////////////////////////// callback function fired when response
                //             if (UID && COOKIE) { // means user logged in already
                //                 socket.emit("get_token", { "COOKIE": COOKIE, "UID": UID }, (response) => {
                //                     console.log(response)
                //                     if (response && response.status_code == 200) {
                //                         /// means token gotten
                //                         let ACCESS_TOKEN = response.ACCESS_TOKEN;
                //                         response = null; // clear the variable for next request use
                //                         socket.emit("get_all_messages", { "ACCESS_TOKEN": ACCESS_TOKEN, "UID": UID }, (response) => {
                //                             if (response && response.status_code == 200) {
                //                                 // means now we have chats in jsoj fotmate
                //                                 console.log(response);
                //                                 // Object.keys(response.chats).forEach(key =>{
                //                                 //     console.log(key, ' ===> ', CHATS[key]['name'])
                //                                 // });
                //                                 //container.removeChild(container.innerHtml)
                //                                 // Array.from(container.innerHtml).forEach((element)=>{
                //                                 //     container.removeChild(element);
                //                                 // });
                //                                 // console.log(container.innerHtml);
                //                                 if (container.querySelector('#section')){
                //                                     container.removeChild(container.querySelector('#section'));
                //                                 }
                //                                 container.appendChild(show_chats(response.chats));
                                                
                //                                 // now ill call a functioj using forEach loop which will show the chats list om sidebar
                //                             } else {
                //                                 // means have token but not able to get the chats even we have token
                //                                 console.log(response)
                //                             }
                //                         });
                //                     } else {
                //                         // means faild to get the token
                //                         console.log('maybe  ookies has been expired login again ==> ', response)
                //                         if (container_login_content) {
                //                             container.querySelector('#errP').innerHTML = 'seasion expired login again';
                //                         }
                //                         if (!container_login_content) {
                //                             container_login_content = true;
                //                             container.appendChild(show_login_page());
                //                             container.querySelector('#errP').innerHTML = 'seasion expired login again';
                //                         }
                //                         const u = container.querySelector('#signup_page_gate');
                //                         u.addEventListener('click', () => {
                //                             // container.innerHtml = '';
                //                             let removing_section = container.querySelector('#section');
                //                             container.removeChild(removing_section);
                //                             container.appendChild(sign_up_page());
                //                         });
                //                     }
                //                 });
                //             } else {
                //                 console.log('LOGIN NEEDED');
                //                 if (!container_login_content) {
                //                     container_login_content = true;
                //                     container.appendChild(show_login_page());
                //                 }
                //                 const u = container.querySelector('#signup_page_gate');
                //                 u.addEventListener('click', () => {
                //                     // container.innerHtml = '';
                //                     let removing_section = container.querySelector('#section');
                //                     container.removeChild(removing_section);
                //                     container.appendChild(sign_up_page());
                //                 });
                //             }
                //         } else {
                //             if (!container_login_content) {
                //                 container.appendChild(show_login_page());
                //                 container.querySelector('#errP').innerText = 'youre offline';
                //             }
                //             const u = container.querySelector('#signup_page_gate');
                //             u.addEventListener('click', () => {
                //                 // container.innerHtml = '';
                //                 let removing_section = container.querySelector('#section');
                //                 container.removeChild(removing_section);
                //                 container.appendChild(sign_up_page());
                //             });
                //         }
                //     } else {
                //         console.log('PLUGIN_SETINGS not found in settings.json creating them');
                //         settings.value[menifest.id] = {
                //             COOKIE: "",
                //             UID: ""
                //         }
                //         /// lets fire socket again 
                //         fire_socket(container);
                //     }
                // });
                // /// socket not conncted mens 
                // /// user is offline
                // /// verify it
                // if (navigator.onLine) {
                //     if (!container_login_content) {
                //         container_login_content = true;
                //         container.appendChild(show_login_page());
                //         // container.querySelector('#errP').innerText = 'Uknnown err accured';
                //     }
                //     const u = container.querySelector('#signup_page_gate');
                //     u.addEventListener('click', () => {
                //         // container.innerHtml = '';
                //         let removing_section = container.querySelector('#section');
                //         container.removeChild(removing_section);
                //         container.appendChild(sign_up_page());
                //     });
                // } else {
                //     if (!container_login_content) {
                //         container_login_content = true;
                //         container.appendChild(show_login_page());
                //         container.querySelector('#errP').innerText = 'Youre offline';
                //     }
                //     const u = container.querySelector('#signup_page_gate');
                //     u.addEventListener('click', () => {
                //         // container.innerHtml = '';
                //         let removing_section = container.querySelector('#section');
                //         container.removeChild(removing_section);
                //         container.appendChild(sign_up_page());
                //     });
                // }
            }






            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////
            /////////// noe we have second step (design the sidebar ui)////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////////////
            /////////////
            // for now im calling without checking any conditions











            function runfunctionWhenSelected(container) {
                console.log("FIRED FUNCTION 2");
                console.log(container)
                //let sidebar_main_div = container.querySelector('#messanger-div');
            }
            // function show_on_sidebar(container) {
            //     console.log('FIRED FUNCTION 1')
            //     fire_socket(container)
            //     //.console.log(container);
            // }
            ////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////
            ///// lets imitilize the sidebar (last step)
            ////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////
            sidebarApps.add(
                "googlechrome", //icon class
                "chats",     // apps unique id
                "Chatting app", // apps name
                fire_socket.bind(this), //ui
                true, //first positon or mot
                runfunctionWhenSelected // run somethin in background
            );
            
            
            ///////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////
            ////////////////  function for appending new tab  /////////////
            ///////////////////////////////////////////////////////////////
            ///////////////////////////////////////////////////////////////
            function open_chat(id, name){
                const tab = new tab_view(name, {
                    type: 'custom',
                    id: 'messanger_tab',
                    tabIcon: 'icon messanger',
                    content: "dive content variable/ function",
                    stylesheets: '/static/style.css',
                    hideQuickTools: true,
                    render: true
                    
                });
                // setTimeout(()=>{
                //     console.log(window.editorManager.getFile('messanger_tab', 'id').remove())
                // //   const tab = tab_view.getFile('messanger_tab', 'id');
                // //         tab.remove();
                // }, 4000)
            }
        }
        async uninstall() { sidebarApps.remove('chats') }
    }

    if (window.acode) {
        const i = new messanger();
        acode.setPluginInit(menifest.id, async (n, o, {
            cacheFileUrl: s, cacheFile: d
        }) => {
            n.endsWith("/") || (n += "/");
            i.baseUrl = n;
            await i.install(o, d, s);
        });
        acode.setPluginUnmount(menifest.id, () => {
            i.uninstall();
        });
    }
})();