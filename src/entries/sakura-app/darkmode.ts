import { getCookie, setCookie } from "../../module/cookie";

function checkBgImgCookie() {
    const bgurl = getCookie("bgImgSetting");
    if (!bgurl) {
        document.getElementById("white-bg").click();
    } else {
        document.getElementById(bgurl).click();
    }
}
export function checkDarkModeCookie() {
    const dark = getCookie("dark"),
        today = new Date()
    if (!dark) {
        if ((today.getHours() > 21 || today.getHours() < 7) && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else {
            turnOffDarkMode()
        }
    } else {
        if (dark == '1' && (today.getHours() >= 22 || today.getHours() <= 6) && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else if (dark == '0' || today.getHours() < 22 || today.getHours() > 6) {
            turnOffDarkMode()
        }
    }
}
function turnOnDarkMode(){
    setTimeout(function () {
        document.getElementById("dark-bg").click();
    }, 100);
    console.log('夜间模式开启');
}
function turnOffDarkMode(){
    if (document.body.clientWidth > 860) {
        setTimeout(function () {
            checkBgImgCookie();
        }, 100);
        console.log('夜间模式关闭');
    } else {
        document.documentElement.style.background = "unset";
        document.body.classList.remove("dark");
        const moblieDarkLight = document.getElementById("moblieDarkLight");
        if (moblieDarkLight) {
            moblieDarkLight.innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
        }else{
            console.warn('#moblieDarkLight not found')
        }
        setCookie("dark", "0", 0.33);
    }
}