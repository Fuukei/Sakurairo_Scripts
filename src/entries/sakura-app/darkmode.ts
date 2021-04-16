import { getCookie, setCookie } from "../../module/cookie";

function checkBgImgCookie() {
    let bgurl = getCookie("bgImgSetting");
    if (!bgurl) {
        document.getElementById("white-bg").click();
    } else {
        document.getElementById(bgurl).click();
    }
}
export function checkDarkModeCookie() {
    let dark = getCookie("dark"),
        today = new Date(),
        cWidth = document.body.clientWidth;
    if (!dark) {
        if ((today.getHours() > 21 || today.getHours() < 7) && mashiro_option.darkmode) {
            setTimeout(function () {
                document.getElementById("dark-bg").click();
            }, 100);
            console.log('夜间模式开启');
        } else {
            if (cWidth > 860) {
                setTimeout(function () {
                    checkBgImgCookie();
                }, 100);
                console.log('夜间模式关闭');
            } else {
                document.documentElement.style.background = "unset";
                document.body.classList.remove("dark");
                let mbdl = document.getElementById("moblieDarkLight");
                if (mbdl) {
                    mbdl.innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
                }
                setCookie("dark", "0", 0.33);
            }
        }
    } else {
        if (dark == '1' && (today.getHours() >= 22 || today.getHours() <= 6) && mashiro_option.darkmode) {
            setTimeout(function () {
                document.getElementById("dark-bg").click();
            }, 100);
            console.log('夜间模式开启');
        } else if (dark == '0' || today.getHours() < 22 || today.getHours() > 6) {
            if (cWidth > 860) {
                setTimeout(function () {
                    checkBgImgCookie();
                }, 100);
                console.log('夜间模式关闭');
            } else {
                document.documentElement.style.background = "unset";
                document.body.classList.remove("dark");
                document.getElementById("moblieDarkLight").innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
                setCookie("dark", "0", 0.33);
            }
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
        let mbdl = document.getElementById("moblieDarkLight");
        if (mbdl) {
            mbdl.innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
        }
        setCookie("dark", "0", 0.33);
    }
}