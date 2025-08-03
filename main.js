"use-strict";
(() => {
    const sidebarApps = acode.require('sidebarApps');
    const settings = acode.require('settings')
    const fs = acode.require('fs');
    const SERVER_URL = 'http://localhost:5000';

    var mainifest = {
        "id": "hackesofice.messanger"
    }

    class messanger {
        constructor() {
            this.sidebar_content = '<div id="messanger-div"> </div>'
        }
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
            
            async function try_login(event, login_form){
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
                    if (response.ok){
                        console.log(response)
                    }else{
                        console.log(response)
                    }
                }catch(err){
                    console.log(`error while login ==>> ${err}`);
                }
                btn.disabled = false;
            }
            
            function show_login_page() {
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
                        login_form.onsubmit = (event) => {try_login(event, login_form)}
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
                        
                        let p = document.createElement('p');
                            p.style.cssText = `text-align: center; margin-bottom:50px`;
                            p.innerHTML = "Don't have an account ? <a onClick='get' href='google.com'> Create Account </a> hear ";
                            login_form.appendChild(p);
                return body
            }










            //////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            /////// LETS SETUP THE WEBSOCKET CONNECTION AND GATHER THE ALL CHATS
            /////////////////////////////////////////////////////////////////////////////////
            /////////////////////////////////////////////////////////////////////////////////
            function fire_socket(container) {
                container.style.cssText = `border: 0px solid;box-shadow: 0 0 10px; border-radius:10px;`;
                let hader = document.createElement('fieldset');
                    hader.id = 'hader';
                    hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:30px;border-radius: 10px; height: 60px; border: none; box-shadow:0 0 10px; width:80%;`;
                    let center_hader = document.createElement('legend');
                        center_hader.innerText = 'Welcome to';
                        center_hader.style.cssText = `margin-left:auto; margin-right: auto; border:none; padding:5px; box-shadow:0 0 10px; border-radius: 40%; padding:5px;`;
                        hader.appendChild(center_hader);
                    let p = document.createElement('p');
                        p.innerText = ' J U P I T E R ';
                        p.style.cssText = `text-align:center; latter-spacing:8px;`
                        hader.appendChild(p);
    
                container.appendChild(hader);
                let socket = io.connect(SERVER_URL);
                socket.on('connect', () => {
                    console.log("connected ✓✓✓  gatherring  chats");
                    let accessToken = null;
                    let PLUGIN_SETINGS = settings.get('hackesofice.messanger');
                    //console.log(PLUGIN_SETINGS)
                    if (PLUGIN_SETINGS) {
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
                                            // now ill call a functioj using forEach loop which will show the chats list om sidebar
                                        } else {
                                            // means have token but not able to get the chats even we have token
                                            console.log(response)
                                        }
                                    });
                                } else {
                                    // means faild to get the token
                                    console.log(response)
                                }
                            });
                        } else {
                            console.log('LOGIN NEEDED');
                            container.appendChild(show_login_page());
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
        acode.setPluginInit(mainifest.id, async (n, o, {
            cacheFileUrl: s, cacheFile: d
        }) => {
            n.endsWith("/") || (n += "/");
            i.baseUrl = n;
            await i.install(o, d, s);
        });
        acode.setPluginUnmount(mainifest.id, () => {
            i.uninstall();
        });
    }
})();