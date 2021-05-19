import { getCookie, setCookie } from "../../module/cookie";
const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)')
let inDarkMode = false
export const isInDarkMode = () => inDarkMode
function informDarkModeChange(nextValue: boolean) {
    console.log("夜间模式" + (nextValue ? "开启" : "关闭"))
    if (nextValue !== inDarkMode) {
        document.dispatchEvent(new CustomEvent("darkmode", { detail: nextValue }))
        inDarkMode = nextValue
    }
}
function mediaQueryCallback() {
    const dark = getCookie("dark")
    //仅在暗色模式不是用户主动设置时触发
    if (!dark) {
        if (mediaQuery.matches && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else {
            turnOffDarkMode()
        }
    }
}
if (mashiro_option.dm_strategy === 'client') {
    mediaQuery.removeEventListener('change', mediaQueryCallback)
    mediaQuery.addEventListener('change', mediaQueryCallback)
}
export function turnOnDarkMode(userTriggered?: boolean) {
    document.documentElement.style.background = "#333333";
    (document.getElementsByClassName("site-content")[0] as HTMLElement).style.backgroundColor = "#333333";
    document.body.classList.add("dark");
    if (userTriggered) {
        setCookie("dark", "1", 0.33);
        setCookie("bgImgSetting", "white-bg", 30);
    }
    informDarkModeChange(true)
}
export function turnOffDarkMode(userTriggered?: boolean) {
    document.documentElement.style.background = "unset";
    (document.getElementsByClassName("site-content")[0] as HTMLElement).style.backgroundColor = "rgba(255, 255, 255, .8)";
    document.body.classList.remove("dark");
    document.body.classList.remove("dynamic");
    informDarkModeChange(false)
    if (userTriggered) {
        saveUserSetting(false);
        document.body.style.backgroundImage = `url(${mashiro_option.skin_bg0})`;
    }
    if (userTriggered) setCookie("dark", "0", 0.33);
}
/**
 * 检查是否在深色模式时间
 * @returns {boolean}
 */
function checkTime() {
    const today = new Date()
    return (today.getHours() > 21 || today.getHours() < 7)
}
export function ifDarkmodeShouldOn() {
    switch (mashiro_option.dm_strategy) {
        case 'time':
            return checkTime()
        case 'client':
            return mediaQuery.matches
        case 'eien':
            return true
        default:
            return checkTime()
    }
}
export function checkDarkModeCookie() {
    const dark = getCookie("dark"),
        shouldDarkModeOn = ifDarkmodeShouldOn()
    if (!dark) {
        if (shouldDarkModeOn && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else {
            turnOffDarkMode()
        }
    } else {
        if (dark == '1' && shouldDarkModeOn && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else if (dark == '0' || !shouldDarkModeOn) {
            turnOffDarkMode()
        }
    }
}
/* function mobile_dark_light() {
    if (document.body.classList.contains("dark")) {
        document.documentElement.style.background = "unset";
        document.body.classList.remove("dark");
        document.getElementById("moblieDarkLight").innerHTML = '<i class="fa fa-moon-o" aria-hidden="true"></i>';
        setCookie("dark", "0", 0.33);
    } else {
        document.documentElement.style.background = "#333333";
        document.getElementById("moblieDarkLight").innerHTML = '<i class="fa fa-sun-o" aria-hidden="true"></i>';
        document.body.classList.add("dark");
        setCookie("dark", "1", 0.33);
    }
} */