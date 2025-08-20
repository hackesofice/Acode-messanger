"use-strict";
(() => {
    const editorManager = window.editorManager;
    const sidebarApps = acode.require('sidebarApps');
    const editorFile = acode.require('editorFile');
    const settings = acode.require('settings');
    const fs = acode.require('fs');
    const SERVER_URL = 'http://localhost:5000' 
   // const SERVER_URL = 'https://acode-chat-backend.onrender.com';
    //const SERVER_URL = 'https://acode-chat-backend-production.up.railway.app/';
    //const SERVER_URL = 'https://parental-kelci-nothinghjn-df173882.koyeb.app/';
    let container_login_content = false;
    var menifest = {
        "id": "hackesofice.messanger"
    }
    


    class messanger {
        constructor() { }
        async install() {
            const scriptURL = this.baseUrl + 'socket.js'; // not working
            //console.log(scriptURL);
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
            /////////////////////////////////////////////////////////////////////////
            async function resend_otp(otp_form){
                otp_form.querySelector('#sub_p').remove()
                otp_form.querySelector('#submit').disabled = true;
                otp_form.querySelector('#submit').innerText='';
                otp_form.querySelector('#submit').appendChild(show_loader());
                const response = await fetch(`${SERVER_URL}/resend_otp`, {
                    method: 'POST',
                    body: JSON.stringify({
                        "COOKIE": settings.get(menifest.id).COOKIE,
                        "UID": settings.get(menifest.id).UID
                    }),
                    headers:{
                        "Content-Type": "application/json"
                    }
                });
                
                let resData = await response.json()
                    //console.log(resData)
                if (response.status_code == 200){
                    otp_form.querySelector('#err_p').innerText = resData.message;
                    setTimeout(()=>{
                            otp_form.querySelector('#err_p').innerText = " ";
                            otp_form.querySelector('#submit').innerText = 'Sign-Up';
                            otp_form.querySelector('#submit').disabled = false;
                    }, 3000)
                }else {
                    if (response){
                        otp_form.querySelector('#err_p').innerText = resData.message;
                        setTimeout(()=>{
                            otp_form.querySelector('#err_p').innerText = " ";
                            otp_form.querySelector('#submit').innerText = 'Sign-Up';
                            otp_form.querySelector('#submit').disabled = false;
                        }, 3000)
                        // console.log(resData)
                    }
                }
            }
            
            async function try_sign_up(event, signup_form, container_refrence){
                signup_form.querySelector('#submit').disabled = true;
                signup_form.querySelector('#submit').innerText='';
                signup_form.querySelector('#submit').appendChild(show_loader());
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
                      //  console.log(container_refrence);
                        /////////////// pass the body and append otp ///////////
                        show_otp_page(container_refrence)
                    }
                    else{
                        signup_form.querySelector('#err_p').innerText = responseData.message;
                        //console.log(responseData.message)
                        setTimeout(()=>{
                            signup_form.querySelector('#err_p').innerText = '';
                            signup_form.querySelector('#submit').innerText = 'Sign-Up';
                            signup_form.querySelector('#submit').disabled = false;
                        },3000);
                        
                    }
                }
                else{
                    console.log(responseData)
                    signup_form.querySelector('#err_p').innerText = responseData.message;
                    setTimeout(()=>{
                        signup_form.querySelector('#err_p').innerText = '';
                        signup_form.querySelector('#submit').innerText = 'Sign-Up';
                        signup_form.querySelector('#submit').disabled = false;
                    },3000)
                }
                
            }
            async function submit_otp(event, otp_form, container_refrence){
                event.preventDefault();
                let ENTERD_OTP = "";
                let UID = settings.get(menifest.id).UID;
                let COOKIE = settings.get(menifest.id).COOKIE;
                otp_form.querySelector('#submit').disabled = true;
                otp_form.querySelector('#submit').innerText = " ";
                otp_form.querySelector('#submit').appendChild(show_loader())
                otp_form.querySelectorAll('input').forEach((element)=>{
                    ENTERD_OTP = ENTERD_OTP + element.value;
                });
                const data = {
                    "COOKIE": COOKIE,
                    "UID":UID,
                    "ENTERD_OTP":ENTERD_OTP
                }
               // console.log(data)
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
                           // console.log(responseData);
                            otp_form.querySelector('#err_p').innerText = responseData.message
                            setTimeout(()=>{
                                otp_form.querySelector('#err_p').innerText = " ";
                                otp_form.querySelector('#submit').disabled = false;
                                otp_form.querySelector('#submit').innerText = "Verify";
                                //otp_form.removeChild(otp_form.querySelector('#loader'))
                            },3000)
                          //  console.log(responseData.TOKEN)
                            container_refrence.style.cssText = `height:100%; width:100%;`;
                            show_main_page(container_refrence, UID, responseData.TOKEN)
                        } else {
                            const responseData = await response.json()
                            console.log(responseData);
                            otp_form.querySelector('#err_p').innerText = responseData.message;
                            setTimeout(()=>{
                                otp_form.querySelector('#submit').disabled = false;
                                otp_form.querySelector('#err_p').innerText = " ";
                                otp_form.querySelector('#submit').innerText = "Verify";
                               // otp_form.removeChild(otp_form.querySelector('#loader'));
                            },3000)
                        }
                    }
                } catch (err) {
                    console.log(err)
                }
                
            }
            
            
            
            async function try_login(event, login_form, container_refrence) {
                event.preventDefault();
                login_form.appendChild(show_loader())
                let btn = login_form.querySelector('#pass');
                btn.disabled = true;
                let data = {
                    "EMAIL": login_form.querySelector('#email').value,
                    "PASSWORD": login_form.querySelector('#pass').value
                }
               // console.log(data);
                // send the data to the server through POST method to appropriate endpoint
                try {
                    //console.log(`${SERVER_URL}/login`);
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
                        show_main_page(container_refrence, data.UID, data.TOKEN)
                       // console.log(data)
                        // fire_socket() //contaimer isnt accessible so its useless
                    } else {
                        const data = await response.json();
                        if (data.message ==='Access Denaid ! Verification pending'){
                            alert("Please Verify Your Email")
                            show_otp_page(container_refrence)
                        }else{
                            console.log(data)
                            container_refrence.querySelector('#errP').innerText = data.message
                        }
                    }
                } catch (err) {
                    console.log(`error while login ==>> ${err}`);
                }
                btn.disabled = false;
            }
            
            
            async function try_cookie_login(container_refrence){
                try{
                    container_refrence.appendChild(show_loader())
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
                                   // console.log(responseData)
                                    return responseData
                                } else {
                                    if (response){
                                        const data = await response.json();
                                        return data
                                    }
                                    // 
                                    // return false
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
            async function fetch_old_messages(){
                const response  = await fetch(`${SERVER_URL}/get_old_messages`, {
                    method: 'POST',
                    headers:{
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        UID: settings.get(menifest.id).UID,
                        COOKIE: settings.get(menifest.id).COOKIE
                    })
                })
                
                if (response && response.ok){
                    let data = await response.json();
                    console.log(data);
                    return data.groups_messages;
                }else{
                    console.log(response, await response.json())
                    return false
                }
            }
            
            
            
            function show_loader() {
                let loader_div = document.createElement('div');
                    loader_div.style.cssText = 'height:10px; width:10px; margin:auto;'
                    loader_div.id = 'loader'
                let loader_style = document.createElement('style');
                loader_style.textContent = `
                                            @keyframes rotate{
                                                0%{
                                                    transform: rotate(0deg);
                                                }
                                                100%{
                                                    transform: rotate(360deg);
                                                }
                                            }
                                            
                                            #loader{
                                                height:100%;
                                                width:100%;
                                                border:3px solid;
                                                border-radius:50%;
                                                border-top:5px solid skyblue;
                                                animation-name: rotate;
                                                animation-duration:500ms;
                                                animation-iteration-count:infinite;
                                            }
                                            `;
                let loader = document.createElement('div');
                loader.id = 'loader_spiner';
                loader_div.appendChild(loader_style)
                loader_div.appendChild(loader)
                return loader_div
            }
            
            
            
            function show_otp_page(container_refrence){
              //  body.removeChild(body.querySelector('#singup_form'));
              //  body.querySelector('#legend_p').innerText = 'Verification';
                while (container_refrence.firstChild){
                    container_refrence.removeChild(container_refrence.firstChild);
                }
                container_refrence.style.cssText = 'margin:auto;'
                let otp_form = document.createElement('form');
                    otp_form.id = 'otp_form';
                    otp_form.style.cssText = `box-shadow:0px 0px 4px 1px; border-radius:10px; display:flex; flex-direction:column; align-items:center; row-gap:10px; padding:20px 10px`;
                    otp_form.onsubmit = (event) => {submit_otp(event, otp_form, container_refrence)}
                    container_refrence.appendChild(otp_form)
                    
                    let p1 = document.createElement('p');
                        p1.style.cssText = 'font-weight:500; margin-top:35px;'
                        p1.innerText = 'Welcome To';
                    
                    let p2 = document.createElement('p');
                        p2.style.cssText = 'font-size:24px; margin-top:15px;'
                        p2.innerText = 'messenger Ax';
                        
                    let p3 = document.createElement('p');
                        p3.style.cssText = 'padding:5px 20px; box-shadow:1px 1px 2px -0px; border-radius:20px; margin-top:25px;'
                        p3.innerText = 'OTP Verification';
                        
                    let p4 = document.createElement('p');
                        p4.style.cssText = 'text-align:center; margin-top:15px; font-size:14px;';
                        p4.innerText = "Enter The 6-digit code sent to your email/phone";
                    
                    otp_form.appendChild(p1)
                    otp_form.appendChild(p2)
                    otp_form.appendChild(p3)
                    otp_form.appendChild(p4)
                    let otp_box = document.createElement('div');
                        otp_box.id = 'otp_box';
                        otp_box.style.cssText = `margin-left:auto; margin-right:auto; display:flex; flex-direction:row; column-gap:3px; margin-top:10px; `;
                        otp_form.appendChild(otp_box)
                        
                        let digit_1 = document.createElement('input');
                            digit_1.maxLength = 1;
                            digit_1.type = 'text';
                            digit_1.inputMode = 'numeric'
                            digit_1.required = true;
                            digit_1.autofocus = true;
                            
                            digit_1.style.cssText = 'height:35px; width:25px; padding:0 8px; box-shadow:inset 0 0 6px 0px; border:none;';
                            otp_box.appendChild(digit_1);
                        
                        let digit_2 = document.createElement('input');
                            digit_2.maxLength = 1;
                            digit_2.required = true;
                            digit_2.type = 'text';
                            digit_2.inputMode = 'numeric';
                            digit_2.style.cssText = 'height:35px; width:25px; padding:0 8px; box-shadow:inset 0 0 6px 0px; border:none;';
                            otp_box.appendChild(digit_2);
                        
                        let digit_3 = document.createElement('input');
                            digit_3.maxLength = 1;
                            digit_3.required = true;
                            digit_3.type = 'text';
                            digit_3.inputMode = 'numeric';
                            digit_3.style.cssText = 'height:35px; width:25px; padding:0 8px; box-shadow:inset 0 0 6px 0px; border:none;';
                            otp_box.appendChild(digit_3);
                            
                        let digit_4 = document.createElement('input');
                            digit_4.maxLength = 1;
                            digit_4.required = true;
                            digit_4.type = 'text';
                            digit_4.inputMode = 'numeric';
                            digit_4.style.cssText = 'height:35px; width:25px; padding:0 8px; box-shadow:inset 0 0 6px 0px; border:none;';
                            otp_box.appendChild(digit_4);
                            
                        let digit_5 = document.createElement('input');
                            digit_5.maxLength = 1;
                            digit_5.required = true;
                            digit_5.type = 'text';
                            digit_5.inputMode = 'numeric';
                            digit_5.style.cssText = 'height:35px; width:25px; padding:0 8px; box-shadow:inset 0 0 6px 0px; border:none;';
                            otp_box.appendChild(digit_5);
                        
                        let digit_6 = document.createElement('input');
                            digit_6.maxLength = 1;
                            digit_6.required = true;
                            digit_6.type = 'text';
                            digit_6.inputMode = 'numeric';
                            digit_6.style.cssText = 'height:35px; width:25px; padding:0 8px; box-shadow:inset 0 0 6px 0px; border:none;';
                            otp_box.appendChild(digit_6);
                    
                    let otp_submit = document.createElement('button');
                        otp_submit.type = 'submit';
                        otp_submit.id = 'submit';
                        otp_submit.innerText = 'Verify';
                        otp_submit.style.cssText = `width:50%; padding:8px 10px; margin-top:15%; border-radius:10px; border:none; background-color: transparent; box-shadow:inset 0px 0px 4px 0px;`;
                        otp_form.appendChild(otp_submit)
                        
                    let err_p = document.createElement('span');
                        err_p.id = 'err_p';
                        err_p.style.cssText = 'color:red;';
                        otp_form.appendChild(err_p);
                    
                    let number_count_down = document.createElement('p');
                        number_count_down.id = "count_down";
                        
                    let p5 = document.createElement('p');
                        p5.style.cssText = 'text-align:center;'
                        p5.innerHTML = "Don't recieved an code?";
                        let sub_p = document.createElement('p');
                            sub_p.id = 'sub_p';
                            sub_p.style.cssText = 'color:blue; text-align:center;';
                            sub_p.innerText = 'Resend OTP';
                            sub_p.addEventListener('click', ()=>{resend_otp(otp_form)})
                           p5.appendChild(sub_p);
                        otp_form.appendChild(p5);
                    // add move focus betwen otp bpxes
                    const inputs = otp_box.querySelectorAll("input");
                   // console.log(inputs.length)
                             inputs.forEach((input, index)=>{
                                 input.addEventListener('input', ()=>{
                                     if (input.value.length === 1 && index < inputs.length - 1){
                                         inputs[index+1].focus();
                                     }
                                 });
                                 input.addEventListener('keydown', (e)=>{
                                     if (e.key === 'Backspace' && input.value === "" && index > 0){
                                         inputs[index - 1].focus();
                                     }
                                 })
                             })
                container_refrence.appendChild(otp_form)
            }
            
            
            function sign_up_page(container_refrence) {
                let section = document.createElement('section');
                    section.id = 'section';
                    let hader = document.createElement('fieldset');
                        hader.id = 'hader';
                        hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:30px;border-radius: 10px; border: none; box-shadow:0 0 10px; width:80%;`;
                        let center_hader1 = document.createElement('legend');
                            center_hader1.innerText = 'Welcome to';
                            center_hader1.style.cssText = `margin-left:auto; margin-right: auto; border:none; padding:5px; box-shadow:0 0 10px; border-radius: 40%; padding:5px;  text-shadow: 0px 0px 3px; font-weight:400;`;
                            hader.appendChild(center_hader1);
                        let p1 = document.createElement('p');
                            p1.innerText = ' messanger Ax';
                            p1.style.cssText = `text-align:center; letter-spacing:8px; margin-top:10px; margin-bottom:5px; font-weight:1000; text-shadow:0 0 10px; margin-left:auto; margin-right:auto;`;
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
                            signup_form.style.cssText = `overflow-y:auto; height:100%; margin-left:auto; margin-right:auto; display:flex; flex-direction:column; align-items:center; padding-top:10%;`;
                            signup_form.onsubmit = (event) => {try_sign_up(event, signup_form,container_refrence);}
                            
                            let first_name = document.createElement('input');
                                first_name.name = 'first_name';
                                first_name.id = 'first_name';
                                first_name.placeholder = 'Enter Your first Name';
                                first_name.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                first_name.required = true;
                                signup_form.appendChild(first_name);
                            
                            let last_name = document.createElement('input')
                                last_name.name = 'last_name';
                                last_name.id = 'last_name';
                                last_name.placeholder = 'Enter your last name';
                                last_name.required = true;
                                last_name.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                signup_form.appendChild(last_name);
                            
                            let email = document.createElement('input');
                                email.type = 'email';
                                email.name = 'email';
                                email.id = 'email';
                                email.required = true;
                                email.placeholder = 'enter email';
                                email.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                signup_form.appendChild(email);
                            
                            let phone = document.createElement('input');
                                phone.type = 'number';
                                phone.name = 'phone';
                                phone.id = 'phone';
                                phone.required = true;
                                phone.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                phone.placeholder = 'enter phone with prefix';
                                signup_form.appendChild(phone);
                            
                            let dob = document.createElement('input')
                                dob.type = 'date'
                                dob.name = 'dob';
                                dob.required = true;
                                dob.placeholder = 'dd/mm/yy';
                                dob.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                signup_form.appendChild(dob)
                            
                            let pw = document.createElement('input');
                                pw.name = 'password';
                                pw.type = 'password';
                                pw.id = 'pass';
                                pw.required = true;
                                pw.placeholder = 'enter password';
                                pw.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                signup_form.appendChild(pw);
                                
                            let confirm_pw = document.createElement('input');
                                confirm_pw.type = 'text';
                                confirm_pw.id = 'confirm_pw';
                                confirm_pw.required = true;
                                confirm_pw.placeholder = 'Re Enter Your Password';
                                confirm_pw.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px;`;
                                signup_form.appendChild(confirm_pw);
                            
                            let err_p = document.createElement('p');
                                err_p.id = 'err_p';
                                err_p.style.cssText = 'color:red; text-align:center;';
                                signup_form.appendChild(err_p);
                            let submit = document.createElement('button');
                                submit.type = 'submit';
                                submit.id = 'submit';
                                submit.innerText = 'Sign-Up';
                                submit.style.cssText = `box-shadow:0 1px 2px; border:none; height:35px; width:60%; border-radius:10px; margin:10px auto;`;
                                signup_form.appendChild(submit);
                            
                            body.appendChild(signup_form);
                            
                //     let style = document.createElement('style');
                //         style.textContent = `
                //             #confirm_pw {
                //                 border:5px solid black;
                //             }
                //         `;
                                
                                
                // body.appendChild(style);
                section.appendChild(hader);
                section.appendChild(body);
                /// clar the container
                while (container_refrence.firstChild){
                   // console.log('clearing')
                    container_refrence.removeChild(container_refrence.firstChild);
                }
                //now updte thw container_refrence
                container_refrence.appendChild(section)
            }
            
            
            
            
            
            function show_login_page(container_refrence) {
                let section = document.createElement('section');
                section.id = 'section'

                let hader = document.createElement('fieldset');
                    hader.id = 'hader';
                    hader.style.cssText = `margin-left:auto; margin-right:auto; margin-top:30px;border-radius: 10px; border: none; box-shadow:0 0 10px; width:80%;`;
                    let center_hader1 = document.createElement('legend');
                        center_hader1.innerText = 'Welcome to';
                        center_hader1.style.cssText = `margin-left:auto; margin-right: auto; border:none; padding:5px; box-shadow:0 0 10px; border-radius: 40%; padding:5px;  text-shadow: 0px 0px 3px; font-weight:400; `;
                        hader.appendChild(center_hader1);
                    let p1 = document.createElement('p');
                        p1.innerText = 'messanger Ax';
                        p1.style.cssText = `text-align:center; letter-spacing:8px; margin-top:10px; margin-bottom:5px; font-weight:1000; text-shadow:0 0 10px; margin-left:auto; margin-right:auto;`;
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
                login_form.onsubmit = (event) => { try_login(event, login_form, container_refrence) }
                body.appendChild(login_form);

                let email_input = document.createElement('input');
                email_input.type = 'email';
                email_input.name = 'EMAIL';
                email_input.required = true;
                email_input.id = 'email';
                email_input.placeholder = 'Enter Email';
                email_input.style.cssText = `height:35px; display:block; margin-left:auto;margin-right:auto; margin-top:60px; border-top:none; border-left:none; border-right: none; box-shadow:0 2px 5px;`;
                login_form.appendChild(email_input);

                let pass = document.createElement('input');
                pass.name = 'PASSWORD';
                pass.type = 'password';
                pass.required = true;
                pass.id = 'pass';
                pass.placeholder = 'Enter Password';
                pass.style.cssText = `height:35px; display:block; margin-left:auto; margin-right:auto; margin-top:40px; border-top:none; border-left:none; border-right:none; box-shadow:0 2px 5px;`;
                login_form.appendChild(pass);

                let submit = document.createElement('button');
                submit.type = 'submit';
                submit.innerText = 'Login';
                //submit.onClick = submit_data
                submit.style.cssText = `display: block; margin-left:auto; margin-right:auto; margin-top:30px; margin-bottom:30px; background-color:transparent; padding:10px 20px; border-radius:30px; box-shadow:0 2px 5px; border:none; text-decoration:bold;`;
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
                
                //console.log('Showing Conyainer refrence', container_refrence)
                //clear contaoner
                while (container_refrence.firstChild){
                    //console.log('clearing')
                    container_refrence.removeChild(container_refrence.firstChild);
                }
                container_refrence.appendChild(section);
                return true
            }

            
            /////////////////////////////////////////////////////
            /////////////////////////////////////////////////////
            ////////////////// chats or all users page//////////////////
            /////////////////////////////////////////////////////
            /////////////////////////////////////////////////////
            async function show_main_page(container_refrence, UID, TOKEN) {
                // const PLUGIN_SETINGS = settings.get([menifest.id]);
                let socket = io.connect(SERVER_URL);
                let all_chats_messages_database = await fetch_old_messages();
                console.log('this is from ', all_chats_messages_database)
                try {
                    while (container_refrence.firstChild) {
                        container_refrence.removeChild(container_refrence.firstChild);
                    }
                    let style = document.createElement('style');
                    style.textContent = `aside::-webkit-scrollbar{display:none; color:blue;}`;

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
                    body.style.cssText = `border:none; margin-right:auto; margin-left:auto; box-shadow:0 4px 5px; margin-top:20%; border-radius:10px; height:87%; `;

                    let legend2 = document.createElement('legend');
                    legend2.style.cssText = `margin-left:auto; margin-right:auto; border:none; width:80%; `;

                    // div for applying better css which lgend not supprts
                    let legend2_div = document.createElement('div');
                    legend2_div.style.cssText = 'margin-left:auto; margin-right:auto; border-radius:20px; box-shadow:0 1px 3px; padding:5px; display:flex; flex-direction:row; column-gap:auto; justify-content:space-between;height:100%; width:100%;';

                    let chats_div = document.createElement('div')
                    chats_div.style.cssText = 'padding:3px 10px; border:none; border-radius:10px; box-shadow:0 1px 2px;'
                    chats_div.innerText = 'CHATS';
                    chats_div.onclick = ()=>{get_and_show_chats_or_users_list(UID, TOKEN,container_refrence,socket,body, list, 'chats', all_chats_messages_database)}
                    legend2_div.appendChild(chats_div);

                    let users_div = document.createElement('div');
                    users_div.innerText = 'USERS'
                    users_div.style.cssText = 'padding:3px 10px; border:none; border-radius:10px; box-shadow:0 1px 2px;'
                    users_div.onclick = ()=>{get_and_show_chats_or_users_list(UID, TOKEN,container_refrence,socket,body, list, 'users', all_chats_messages_database)}
                    legend2_div.appendChild(users_div);
                    legend2.appendChild(legend2_div);
                    body.appendChild(legend2);

                    /// now use the foreach loop to show the chats
                    let aside = document.createElement('aside');
                    aside.className = 'scroll';
                    aside.style.cssText = `margin-top:6%; overflow-y:auto; height:80%`;
                    let list = document.createElement('ul');
                    list.className = '';
                    list.style.cssText = `padding-bottom: 12px;`;
                    aside.appendChild(list);

                    section.appendChild(style);
                    section.appendChild(hader);
                    section.appendChild(body);
                    container_refrence.appendChild(section);
                    body.appendChild(aside);
                    chats_div.click()
                    start_listening_for_new_messages(container_refrence, socket);
                    
                } catch (err) {
                    console.log(err)
                }
            }
            
           async function get_and_show_chats_or_users_list(UID, TOKEN, container_refrence, socket, body,list, what_to_show, all_chats_messages_database) {

                let style = document.createElement('style')
                body.insertBefore(style, body.lastChild)
                style.textContent = ` 
                            .active {
                                background-color:skyblue;
                            }
                        `;
                // console.log(body)
                if (what_to_show == 'chats') {
                   // console.log(body.firstChild.firstChild.firstChild.classList)
                    if (body.firstChild.firstChild.firstChild.classList.contains('active')) {
                        return
                    }
                    body.firstChild.firstChild.firstChild.classList.add('active')
                    body.firstChild.firstChild.lastChild.classList.remove('active')
                    //console.log(body.firstChild.firstChild.firstChild)
                    //console.log('chats clicked')
                    try {
                        while (body.lastChild.firstChild.firstChild) {
                            body.lastChild.firstChild.firstChild.remove(body.lastChild.firstChild.firstChild)
                        }
                        body.appendChild(show_loader())
                        if (!socket.conncted) {
                           // socket.on('connect', () => {
                                socket.emit('get_all_chat_list', { "UID": UID, "TOKEN": TOKEN }, (response) => {
                                    if (response.status_code == 200) {
                                        body.removeChild(body.querySelector('#loader'));
                                        let data = response.chats;
                                        Object.keys(data).forEach(key => {
                                            let list_item = document.createElement('li');
                                            list_item.id = key;
                                            //list_item.innerText = CHATS_OBJECT[key]['name'];
                                            list_item.style.cssText = `height:35px; padding:5px 5px 5px 7px; box-shadow:0 1px 3px; width:90%; border:none; margin-left:auto; margin-right:auto; margin-top:10px; border-radius: 20px; display:flex; flex-direction:row; column-gap:10px`;
                                            list_item.addEventListener('click', () => {
                                                //list_item.style.cssText ="background-color:blue";
                                                if (editorManager.getFile('messanger_tab', 'id')) {
                                                    editorManager.getFile('messanger_tab', 'id').remove();
                                                }
                                                //console.log(key, CHATS_OBJECT[key]['NAME'])
                                                open_chat(key, data[key]['NAME'], all_chats_messages_database, socket, 'old_chat')
                                            });

                                            let chat_logo = document.createElement('div');
                                            chat_logo.style.backgroundImage = ``;
                                            chat_logo.style.cssText = `border:none; border-radius:50%; height:35px; width:35px; background-size:cover; background-image:url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s')`;
                                            list_item.appendChild(chat_logo);
                                            let name_text = document.createElement('p');
                                            name_text.style.cssText = `margin-top:auto; margin-bottom:auto; overflow-y:auto;`;
                                            name_text.innerText = data[key]['NAME'];
                                            list_item.appendChild(name_text);

                                            list.appendChild(list_item);
                                        });
                                    } else {
                                        alert(response.message);
                                        show_login_page(container_refrence);
                                    }
                                });
                          //  });
                        }
                        else {
                            socket.emit('get_all_chat_list', { "UID": UID, "TOKEN": TOKEN }, (response) => {
                                if (response.status_code == 200) {
                                    body.removeChild(body.querySelector('#loader'));
                                    let data = response.chats;
                                    Object.keys(data).forEach(key => {
                                        let list_item = document.createElement('li');
                                        list_item.id = key;
                                        //list_item.innerText = CHATS_OBJECT[key]['name'];
                                        list_item.style.cssText = `height:35px; padding:5px 5px 5px 7px; box-shadow:0 1px 3px; width:90%; border:none; margin-left:auto; margin-right:auto; margin-top:10px; border-radius: 20px; display:flex; flex-direction:row; column-gap:10px`;
                                        list_item.addEventListener('click', () => {
                                            //list_item.style.cssText ="background-color:blue";
                                            if (editorManager.getFile('messanger_tab', 'id')) {
                                                editorManager.getFile('messanger_tab', 'id').remove();
                                            }
                                            //console.log(key, CHATS_OBJECT[key]['NAME'])
                                            open_chat(key, data[key]['NAME'], all_chats_messages_database, socket, 'old_chat')
                                        });

                                        let chat_logo = document.createElement('div');
                                        chat_logo.style.backgroundImage = ``;
                                        chat_logo.style.cssText = `border:none; border-radius:50%; height:35px; width:35px; background-size:cover; background-image:url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s')`;
                                        list_item.appendChild(chat_logo);
                                        let name_text = document.createElement('p');
                                        name_text.style.cssText = `margin-top:auto; margin-bottom:auto; overflow-y:auto;`;
                                        name_text.innerText = data[key]['NAME'];
                                        list_item.appendChild(name_text);

                                        list.appendChild(list_item);
                                    });
                                } else {
                                    alert(response.message);
                                    show_login_page(container_refrence);
                                }
                            });
                        }
                    } catch (err) {
                        console.log(err)
                    }
                } else if (what_to_show == 'users') {
                    if (body.firstChild.firstChild.lastChild.classList.contains('active')) {
                        return
                    }
                    // console.log('users clicked')
                    body.firstChild.firstChild.firstChild.classList.remove('active');
                    body.firstChild.firstChild.lastChild.classList.add('active');
                    //console.log(body.lastChild.firstChild.firstChild)
                    while (body.lastChild.firstChild.firstChild) {
                        body.lastChild.firstChild.firstChild.remove(body.lastChild.firstChild.firstChild)
                    }
                    body.appendChild(show_loader())
                    try {
                        const response = await fetch(`${SERVER_URL}/get_all_users`, {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "UID": UID,
                                "TOKEN": TOKEN
                            })

                        });
                        if (response.ok) {
                            const data = await response.json();
                            body.removeChild(body.querySelector('#loader'))
                            Object.keys(data).forEach(key => {
                                let list_item = document.createElement('li');
                                list_item.id = UID + '0000000000000000' + key;
                                //list_item.innerText = CHATS_OBJECT[key]['name'];
                                list_item.style.cssText = `height:35px; padding:5px 5px 5px 7px; box-shadow:0 1px 3px; width:90%; border:none; margin-left:auto; margin-right:auto; margin-top:10px; border-radius: 20px; display:flex; flex-direction:row; column-gap:10px`;

                                list_item.addEventListener('click', () => {
                                    //list_item.style.cssText ="background-color:blue";
                                    if (editorManager.getFile('messanger_tab', 'id')) {
                                        editorManager.getFile('messanger_tab', 'id').remove();
                                    }
                                    //console.log(key, CHATS_OBJECT[key]['NAME'])
                                    open_chat(UID + '0000000000000000' + key, data[key]['NAME'], all_chats_messages_database, socket, 'new_chat')
                                });

                                let chat_logo = document.createElement('div');
                                chat_logo.style.backgroundImage = ``;
                                chat_logo.style.cssText = `border:none; border-radius:50%; height:35px; width:35px; background-size:cover; background-image:url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s')`;
                                list_item.appendChild(chat_logo);
                                let name_text = document.createElement('p');
                                name_text.style.cssText = `margin-top:auto; margin-bottom:auto; overflow-y:auto;`;
                                name_text.innerText = data[key]['NAME'];
                                list_item.appendChild(name_text);

                                list.appendChild(list_item);
                            });
                        } else {
                            console.log(await response.json())
                        }
                    } catch (err) {
                        console.log(err)
                    }
                }
            }
            function show_message(message_data, tab_messages_container) {
                let others_message = document.createElement('fieldset');
                //console.log(settings.get(menifest.id));
                console.log(message_data, 'this is showing')
                const me = message_data.sender_id == settings.get(menifest.id)['UID'];
                if (!me) {
                    others_message.style.cssText = "max-width:70%; min-width:30%; display:flex; flex-direction:row; column-gap:20px; border:none; border-radius:10px; box-shadow:0 1px 2px; padding:10px; margin-right:auto;";
                    let sender_legend = document.createElement('legend');
                    sender_legend.style.cssText = 'margin-left:-20px; display:flex; flex-direction:row; column-gap:3px;border-radius: 5px;';

                    let sender_profile_pic = document.createElement('div');
                    sender_profile_pic.style.cssText = "height:15px; width:15px; border-radius:5px; margin-top:2px;";
                    sender_profile_pic.style.backgroundImage = `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s')`;
                    sender_profile_pic.style.backgroundSize = 'cover';
                    sender_legend.appendChild(sender_profile_pic);

                    let sender_name = document.createElement('p');
                    sender_name.innerText = message_data.sender_name;
                    sender_legend.appendChild(sender_name);

                    others_message.appendChild(sender_legend);
                    let message = document.createElement('p');
                    message.style.cssText = 'font-weight:500; overflow-x:auto; margin-right:auto;';
                    message.innerText = message_data.message
                    others_message.appendChild(message);
                } else {
                    others_message.style.cssText = "max-width:70%; min-width:20%; display:flex; flex-direction:row; column-gap:20px; border:none; border-radius:10px; box-shadow:0 1px 2px; padding:10px; margin-left:auto;";
                    let message = document.createElement('p');
                    message.style.cssText = 'font-weight:500; overflow-x:auto; margin-left:auto;';
                    message.innerText = message_data.message
                    others_message.appendChild(message);
                }

                tab_messages_container.appendChild(others_message);
                setTimeout(()=>{
                tab_messages_container.scrollTo({
                                            top: tab_messages_container.scrollHeight,
                                            behavior: 'smooth'
                            });
                })
            }
            
            
            function start_listening_for_new_messages(container_refrence, socket){
                    /// now ill get the chat id of each message new
                    /// then ill grab the all avilable tabs ids
                    /// if the new mesaage id in any tabs id
                    /// then ill append the new message on that tabs middle content which is scrollable
                    /// at last ill add that message to local Dictionary database
                // trigger new message evwnt on mew message
                socket.on('new_message', (data) => {
                    console.log(data)
                  //  console.log(window.editorManager.files)
                    //window.toast(data.message);
                    
                    if (window.editorManager.files) {
                        window.editorManager.files.forEach((file) => {
                            if (file.id) {
                            //    console.log(file.id)
                                if (file.id.includes(data.group_id)) {
                                  //  console.log('yess same group is opend on big screen append message');
                                    let tab = editorManager.getFile(`messanger_tab_${data.group_id}`, 'id');
                                    let tab_messages_container = tab.content.shadowRoot.querySelector(`#chats_elemnt_${data.group_id}`);
                                        
                                    show_message(data, tab_messages_container)
                                    // auto scrall tp last message
                                        tab_messages_container.scrollTo({
                                            top: tab_messages_container.scrollHeight,
                                            behavior: 'smooth'
                                        });
                                    
                                    //console.log(tab.tab);
                                    //console.log(tab);
                                    //console.log(tab_messages_container);
                                    //console.log('now add to local json database');
                                } else {
                                    console.log('nope write message to json');
                                }
                            } else {
                                console.log('opend file doienst have any id')
                            }
                        });
                    } else {
                        console.log('no opend files found')
                    }

                });
            }







            async function run_main(container_refrence){
               // console.log('youre online now')
                if (!settings.get(menifest.id)){
                   show_login_page(container_refrence); 
                }else{
                    const UID = settings.get(menifest.id).UID;
                    if (UID) {
                        if(!navigator.onLine){
                            alert('youre offline')
                            window.addEventListener('online', ()=> {
                                console.log('re runnig ')
                                run_main(container_refrence)
                                
                            });
                            window.addEventListener('offline', ()=>{
                                console.log('re runnig you gone offline')
                                run_main(container_refrence)
                            })
                        }else{
                        const data = await try_cookie_login(container_refrence);
                        if (data.TOKEN) {
                            console.log('showing chats')
                            show_main_page(container_refrence, UID, data.TOKEN)
                        } else {
                            console.log('login please');
                            show_login_page(container_refrence);
                            if (data.message) {
                                if (data.message === 'Verification pending') {
                                    alert("Please Verify Your Email");
                                    show_otp_page(container_refrence);
                                } else {
                                    if (data.message == 'Access Denaid ! Login needed') {
                                        container_refrence.querySelector('#errP').innerText = 'Seassion Expired please login again '
                                    } else {
                                        console.log(data)
                                        container_refrence.querySelector('#errP').innerText = data.message
                                    }
                                }
                            }
                        }
                    }
                    } else {
                        // means we have no uid or cookie stored
                        show_login_page(container_refrence);
                    }
                }
            }
            
            function send_message(event, container, send_message_form, socket, GUID, new_or_old_chat){
                event.preventDefault();
                let PLUGIN_SETINGS = settings.get([menifest.id]);
                if (PLUGIN_SETINGS) {
                    event.preventDefault();
                    let socket_route = (new_or_old_chat == 'new_chat') ? 'send_message_new_chat':'send_message';
                    //console.log(socket_route);
                    socket.emit(socket_route, { "sender_id": PLUGIN_SETINGS.UID, "group_id": GUID, "message": send_message_form.querySelector('#message-textarea').value }, (response) => {
                        if (response) {
                           // console.log(response)
                            if (response.status_code == 200) {
                                window.toast(response.message)
                            } else {
                                window.toast(response.message)
                            }
                        }else{
                            console.log('no response')
                        }
                    });
                }else{
                    window.toast('PLUGIN_SETINGS not found')
                }
                
                
                
                
                
                
                send_message_form.querySelector('#message-textarea').value = '';
                send_message_form.querySelector('#message-textarea').focus();
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
                //                                 container.appendChild(show_main_page(response.chats));
                                                
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
            function open_this_chat_on_new_tab(id, name, all_chats_messages_database, container, socket, new_or_old_chat){
                let main_page = document.createElement('div');
                    main_page.id = 'idds';
                    main_page.style.cssText = 'min-height:99%; max-height:99%; min-width:99%;  max-width:99%; display:flex; flex-direction:column; border:1px dotted black; margin-left:auto; margin-right:auto;';
                    
                    let top_container_or_heder_strip = document.createElement('div');
                        top_container_or_heder_strip.style.cssText = 'positon:sticky; box-shadow:0 1px 2px; margin-top: 2%; width:92%; margin-left:auto; margin-right:auto; border:none; border-radius:20px; display:flex; flex-direction:row; padding:5px 7px;';
                        
                            let logo_div = document.createElement('div');
                                logo_div.id = "logo_div";
                                logo_div.style.cssText = `height:30px; width:30px; border-radius:50%; border:none; margin-top:auto; margin-bottom:auto; background-size:cover; background-image:url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBmFKzyL1zd267I4OYwckhj8-VDM1030AU2w&s');`;
                                top_container_or_heder_strip.appendChild(logo_div);
                                
                                // let logo_img = document.createElement('img');
                                //     logo_img.src = '';
                                //     logo_img.style.cssText = 'height:30px; width:30px; border-radius:50%;';
                                //     logo_div.appendChild(logo_img);
                                
                            let name_p = document.createElement('p');
                                name_p.style.cssText = 'flex-grow:1; margin:auto 0 auto 20px; overflow-y:auto;';
                                name_p.innerText = name;
                                top_container_or_heder_strip.appendChild(name_p);
                            
                           // top_container_or_heder_strip.appendChild(logo_and_title_div);
                                
                    ///// ///////////////////////////////////
                    /////// center or chats container whenre message are going to display///////
                    ////////////////////////////////////////
                    let centre_container_or_message_area = document.createElement('div');
                        centre_container_or_message_area.style.cssText = "min-width:95%; max-width:95%; min-height:100%; max-height:100%; flex-grow: 1; display:flex; margin-left:auto; margin-right:auto; ";
                        
                        let actual_message_container = document.createElement('section');
                            actual_message_container.id = `chats_elemnt_${id}`;
                            actual_message_container.className = 'scroll';
                            actual_message_container.style.cssText = 'flex-grow:1; overflow-y:auto; min-height:90%; max-height:90%; display:flex; flex-direction:column; row-gap:10px; padding:20px; ';
                            centre_container_or_message_area.appendChild(actual_message_container);
                            

                                //actual_message_container.appendChild(others_message)
                                    
                                    
                                
                        
                    
                    let bottom_container_or_message_writing_area = document.createElement('div');
                        bottom_container_or_message_writing_area.style.cssText = 'width:96%; min-height:55px; max-height:100px; positon:fixed; margin:0 2% 9px 2%; overflow:hidden; border:none;';
                        
                        let send_message_form = document.createElement('form');
                            send_message_form.id = 'message-form';
                            send_message_form.onsubmit = (event)=>{send_message(event, container, send_message_form, socket, id, new_or_old_chat)}
                            send_message_form.style.cssText = 'display:flex; flex-direction:row; column-gap:10px; border:1px solid; padding:6px 6px; max-height:100%; max-width:100%; border-radius:30px; ';
                            
                            let message_text_area = document.createElement('textarea');
                                message_text_area.autofocus = true;
                                message_text_area.focus();
                                message_text_area.id = 'message-textarea';
                                message_text_area.rows = 1;
                                message_text_area.style.cssText = 'flex-grow:1; border:none; padding:12px 15px 5px 15px; border-radius:20px; box-shadow:0 1px 2px; background-color:transparent;';
                                message_text_area.placeholder = "Type your message";
                                send_message_form.appendChild(message_text_area);
                        
                            let send_btn = document.createElement('button');
                                send_btn.innerHTML = '<p style="margin:auto;">Send</p>';
                                send_btn.style.cssText = 'width:40px; height:40px; border-radius:20px; border:none; box-shadow:0 2px 4px; background:transparent;';
                                send_btn.type = 'submit';
                                send_message_form.appendChild(send_btn);
                            
                            bottom_container_or_message_writing_area.appendChild(send_message_form);
                    
                    
                
                main_page.appendChild(top_container_or_heder_strip);
                main_page.appendChild(centre_container_or_message_area);
                main_page.appendChild(bottom_container_or_message_writing_area);
                container.appendChild(main_page);
                //console.log(container)
                
                // now ill call show_message() function to append each message if avilable
                console.log('checking ', all_chats_messages_database)
                if (all_chats_messages_database && all_chats_messages_database[id]){
                    let this_group_messages = all_chats_messages_database[id]
                    console.log(this_group_messages, ' this is from chays databasr')
                    if (this_group_messages){
                        Object.keys(this_group_messages).forEach((message)=>{
                            show_message(this_group_messages[message],actual_message_container)
                        })
                    }
                }
                return true
            }










            function runfunctionWhenSelected(container) {
               // console.log("FIRED FUNCTION 2");
               // console.log(container)
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
            
            function open_chat(id, name, all_chats_messages_database, socket, new_or_old_chat){
                let container = document.createElement("div");
                    container.style.cssText = 'margin-bottom:0; width:100%; height:99%;';
                    
                    // let section = document.createElement('section');
                    //     container.appendChild(section);
                    // pass the container and appned the ui of chat
                    open_this_chat_on_new_tab(id, name, all_chats_messages_database, container, socket, new_or_old_chat)
                
                // pass the container tó enable edits
                const tab = new editorFile(name, {
                    type: 'page',
                    uri: 'By Messanger - AX',
                    id: `messanger_tab_${id}`,
                    tabIcon: 'icon messanger',
                    content: container,
                    stylesheets: '/static/css/tab.css',
                    hideQuickTools: true,
                    render: true
                    
                });
                // setTimeout(()=>{
                //     console.log(editorManager.getFile('messanger_tab', 'id').remove())
                // //   const tab = editorFile.getFile('messanger_tab', 'id');
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