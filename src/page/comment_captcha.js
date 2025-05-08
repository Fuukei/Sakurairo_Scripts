export default function init_comment_captcha() {
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