export default function init_comment_captcha() {

    document.addEventListener("pjax:complete",init);
    function init(){
        iroCaptcha();
        cfts();
    }
    init();

    function iroCaptcha() {
        let captchaHideTimeout = null;
        let captchaField = document.querySelector('.comment-captcha .input');
        let captchaImg = document.querySelector('.comment-captcha img');
    
        if (captchaField && captchaImg) {
            captchaImg.addEventListener('click',refreshCaptcha);
            captchaField.addEventListener('focus',showCaptcha);
            captchaField.addEventListener('blur',hideCaptcha);
        }
    
        function showCaptcha() {
            captchaField.setAttribute("placeholder", "");
            if (captchaHideTimeout) {
                clearTimeout(captchaHideTimeout);
                captchaHideTimeout = null;
            }
            captchaImg.style.width = "120px";
            captchaImg.style.marginRight = "10px";
        }
    
        function hideCaptcha() {
            let placeholder = captchaField.dataset.placeholder || '点击此处验证';
            captchaHideTimeout = setTimeout(function() {
                captchaImg.style.width = "0";
                captchaImg.style.marginRight = "0";
                captchaField.setAttribute("placeholder",placeholder);
            }, 5000);
        }
            
        function refreshCaptcha() {
            fetch(_iro.captcha_endpoint)
                .then(resp => resp.json())
                .then(json => {
                    captchaImg.src = json["data"];
                    document.querySelector("input[name=\'timestamp\']").value = json["time"];
                    document.querySelector("input[name=\'id\']").value = json["id"];
                })
                .catch(error => console.error("获取验证码失败:", error));
        };
    }

    function cfts(){
        let cfturnstile = document.querySelector('.comment-form .cfturnstile');
        if (cfturnstile) {
            let theme = "light";
            let response = document.querySelector(".comment-form .cf-turnstile-response");
            function loadTurnstile() {
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            loadTurnstile().then(()=>{
                theme = document.querySelector('body.dark') ? "dark" : "light";
                turnstile.render(cfturnstile, {
                        sitekey: `${cfturnstile.dataset.key}`,
                        theme: `${theme}`,
                        callback: function(token) {
                            response.value = token;
                        },
                    });
                }
            )
        }
    }
}