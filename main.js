"use-strict";
(() => {
    const sidebarApps = acode.require('sidebarApps');
    const settings = acode.require('settings')
    const fs = acode.require('fs');
    const SERVER_URL = 'https://1653616a-2346-44c4-9c4e-65317b7be6e9-00-qlzxlert3tu4.janeway.replit.dev';
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
            async function try_sign_up(event, signup_form){
                event.preventDefault();
                const data = {
                    "NAME": signup_form.querySelector('#name').value,
                    "EMAIL": signup_form.querySelector('#email').value,
                    "PHONE_NO": signup_form.querySelector('#phone').value,
                    "PASSWORD": signup_form.querySelector('#pass')
                }
                
                const response = await fetch(`${SERVER_URL}/sign_up`,{
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    
                    body: JSON.stringify(data)
                    
                });
                
                console.log(await response.json());
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
                        console.log(response)
                    }
                } catch (err) {
                    console.log(`error while login ==>> ${err}`);
                }
                btn.disabled = false;
            }


            function sign_up_page() {
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
                        body.style.cssText = `width:95%; border:none; box-shadow:0 0 10px; border:1px solid black; margin-left:auto; margin-right:auto; margin-top: 20%;`;
                        
                        let legend = document.createElement('legend');
                            legend.style.cssText = `margin-left:auto; margin-right:auto; padding:5px; box-shadow:0 0 10px; border-radius:10px`;
                            
                            let legend_p = document.createElement('p');
                                legend_p.id = 'legend_p';
                                legend_p.style.cssText = ``;
                                legend_p.innerText = ' Sign-up '
                                legend.appendChild(legend_p);
                            body.appendChild(legend);
                        
                        let signup_form = document.createElement('form');
                            signup_form.íd = 'singup_form';
                            signup_form.onsubmit = (event) => {try_sign_up(event, signup_form);}
                            
                            let name = document.createElement('input');
                                name.name = 'name';
                                name.id = 'name';
                                name.placeholder = 'Enter Your Name';
                                signup_form.appendChild(name);
                            
                            let email = document.createElement('input');
                                email.type = 'email';
                                email.name = 'email';
                                email.id = 'email';
                                email.placeholder = 'enter email'
                                signup_form.appendChild(email);
                            
                            let phone = document.createElement('input');
                                phone.type = 'Number';
                                phone.name = 'phone'
                                phone.id = 'phone';
                                phone.placeholder = 'enter phone'
                                signup_form.appendChild(phone);
                            
                            let pw = document.createElement('input');
                                pw.name = 'pass';
                                pw.type = 'password';
                                pw.id = 'pass'
                                pw.placeholder = 'enter password';
                                signup_form.appendChild(pw);
                            
                            
                            let submit = document.createElement('button');
                                submit.type = 'submit';
                                submit.innerText = 'Sign-Up';
                                signup_form.appendChild(submit);
                            
                            
                                
                                
                                
                                
                                
                                
                            body.appendChild(signup_form);
                
                section.appendChild(hader);
                section.appendChild(body)
                return section
            }
            
            
            
            
            
            function show_login_page() {
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
                body.style.cssText = `border: none; margin-top: 20px; border-radius: 10px; box-shadow:0 0 10px`;
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
                return section
            }


            function show_chats(CHATS_OBJECT) {
                let section = document.createElement('section');
                section.id = 'main_screen';

                let hader = document.createElement('fieldset');
                hader.id = 'chats_hader';
                hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:15%; height:5%; width:70%; box-shadow:0 5px 10px; border-radius:10px; border:none;`;

                let legend = document.createElement('legend');
                legend.innerText = 'Welcome M.R';
                legend.style.cssText = `border:none; margin-left:auto; margin-right:auto; box-shadow:0 5 10px; padding:5px;`;
                hader.appendChild(legend);

                let body = document.createElement('fieldset');
                body.className = 'scroll';
                body.style.cssText = `border:none; margin-right:auto; margin-left:auto; box-shadow:0 0 10px; margin-top:20%; border-radius:10px; max-height:62%; overflow-y:auto;`;

                let legend2 = document.createElement('legend');
                legend2.innerText = ' CHATS ';
                legend2.style.cssText = `margin-left:auto; margin-right:auto; padding:5px;`;
                body.appendChild(legend2);

                /// now use the foreach loop to show the chats
                let aside = document.createElement('aside');
                aside.style.cssText = ``;
                let list = document.createElement('ul');
                list.className = 'scroll';
                list.style.cssText = `overflow-y:auto;height:100%; padding-bottom: 15px;`;
                Object.keys(CHATS_OBJECT).forEach(key => {
                    let list_item = document.createElement('li');
                    list_item.id = key;
                    //list_item.innerText = CHATS_OBJECT[key]['name'];
                    list_item.style.cssText = `height:40px; box-shadow:0 2px 5px; width:90%; border:none; margin-left:auto; margin-right:auto; margin-top:10px; border-radius: 10px;`;

                    let name_text = document.createElement('p');
                    name_text.style.cssText = `margin-top:auto; margin-bottom:auto;`;
                    name_text.innerText = CHATS_OBJECT[key]['name'];
                    list_item.appendChild(name_text);

                    list.appendChild(list_item);
                });
                aside.appendChild(list);
                body.appendChild(aside);
                let style = document.createElement('style');
                style.textContent = `fieldset::-webkit-scrollbar{display:none; color:blue;}`;

                section.appendChild(style);
                section.appendChild(hader);
                section.appendChild(body);

                console.log(section);
                return section
            }










            //////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            /////// LETS SETUP THE WEBSOCKET CONNECTION AND GATHER THE ALL CHATS
            /////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            function fire_socket(container) {
                document.addEventListener('o', () => { console.log('im online') })

                container.style.cssText = `border: 0px solid;box-shadow: 0 0 10px; border-radius:10px;`;
                let socket = io.connect(SERVER_URL);
                socket.on('connect', () => {
                    console.log("connected ✓✓✓  gatherring  chats");
                    let accessToken = null;
                    let PLUGIN_SETINGS = settings.get('hackesofice.messanger');
                    //console.log(PLUGIN_SETINGS)
                    if (PLUGIN_SETINGS) {
                        if (navigator.onLine) {
                            let UID = PLUGIN_SETINGS.UID;
                            let COOKIE = PLUGIN_SETINGS.COOKIE;
                            /// fetch the accessToken to use it 
                            ////////socket io endpoint //////// json data for server /////////////////////////////////////////////////////////////////////////////////////////// callback function fired when response
                            if (UID && COOKIE) { // means user logged in already
                                socket.emit("get_token", { "COOKIE": COOKIE, "UID": UID }, (response) => {
                                    console.log(response)
                                    if (response && response.status_code == 200) {
                                        /// means token gotten
                                        let ACCESS_TOKEN = response.ACCESS_TOKEN;
                                        response = null; // clear the variable for next request use
                                        socket.emit("get_all_messages", { "ACCESS_TOKEN": ACCESS_TOKEN, "UID": UID }, (response) => {
                                            if (response && response.status_code == 200) {
                                                // means now we have chats in jsoj fotmate
                                                console.log(response);
                                                // Object.keys(response.chats).forEach(key =>{
                                                //     console.log(key, ' ===> ', CHATS[key]['name'])
                                                // });
                                                //container.innerHtml = '';
                                                container.appendChild(show_chats(response.chats));
                                                // now ill call a functioj using forEach loop which will show the chats list om sidebar
                                            } else {
                                                // means have token but not able to get the chats even we have token
                                                console.log(response)
                                            }
                                        });
                                    } else {
                                        // means faild to get the token
                                        console.log('maybe  ookies has been expired login again ==> ', response)
                                        if (container_login_content) {
                                            container.querySelector('#errP').innerHTML = 'seasion expired login again';
                                        }
                                        if (!container_login_content) {
                                            container_login_content = true;
                                            container.appendChild(show_login_page());
                                            container.querySelector('#errP').innerHTML = 'seasion expired login again';
                                        }
                                        const u = container.querySelector('#signup_page_gate');
                                        u.addEventListener('click', () => {
                                            container.innerHtml = '';
                                            let removing_section = container.querySelector('#section');
                                            container.removeChild(removing_section);
                                            container.appendChild(sign_up_page());
                                        });
                                    }
                                });
                            } else {
                                console.log('LOGIN NEEDED');
                                if (!container_login_content) {
                                    container_login_content = true;
                                    container.appendChild(show_login_page());
                                }
                                const u = container.querySelector('#signup_page_gate');
                                u.addEventListener('click', () => {
                                    container.innerHtml = '';
                                    let removing_section = container.querySelector('#section');
                                    container.removeChild(removing_section);
                                    container.appendChild(sign_up_page());
                                });
                            }
                        } else {
                            if (!container_login_content) {
                                container.appendChild(show_login_page());
                                container.querySelector('#errP').innerText = 'youre offline';
                            }
                            const u = container.querySelector('#signup_page_gate');
                            u.addEventListener('click', () => {
                                container.innerHtml = '';
                                let removing_section = container.querySelector('#section');
                                container.removeChild(removing_section);
                                container.appendChild(sign_up_page());
                            });
                        }
                    } else {
                        console.log('PLUGIN_SETINGS not found in settings.json creating them');
                        settings.value["hackesofice.messanger"] = {
                            COOKIE: "",
                            UID: ""
                        }
                        /// lets fire socket again 
                        fire_socket(container);
                    }
                });
                /// socket not conncted mens 
                /// user is offline
                /// verify it
                if (navigator.onLine) {
                    if (!container_login_content) {
                        container_login_content = true;
                        container.appendChild(show_login_page());
                        // container.querySelector('#errP').innerText = 'Uknnown err accured';
                    }
                    const u = container.querySelector('#signup_page_gate');
                    u.addEventListener('click', () => {
                        container.innerHtml = '';
                        let removing_section = container.querySelector('#section');
                        container.removeChild(removing_section);
                        container.appendChild(sign_up_page());
                    });
                } else {
                    if (!container_login_content) {
                        container_login_content = true;
                        container.appendChild(show_login_page());
                        container.querySelector('#errP').innerText = 'Youre offline';
                    }
                    const u = container.querySelector('#signup_page_gate');
                    u.addEventListener('click', () => {
                        container.innerHtml = '';
                        let removing_section = container.querySelector('#section');
                        container.removeChild(removing_section);
                        container.appendChild(sign_up_page());
                    });
                }
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
            // console.log(sidebarApps)

            //console.log(this)
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