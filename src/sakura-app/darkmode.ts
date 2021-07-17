const mediaQuery = window.matchMedia('(prefers-color-scheme:dark)')
let inDarkMode = false
export const isInDarkMode = () => inDarkMode
function informDarkModeChange(nextValue: boolean) {
    if (nextValue !== inDarkMode) {
        document.dispatchEvent(new CustomEvent("darkmode", { detail: nextValue }))
        inDarkMode = nextValue
    }
}
function mediaQueryCallback() {
    const dark = localStorage.getItem("dark")
    //仅在深色模式不是用户主动设置时触发
    if (!dark) {
        if (mediaQuery.matches && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else {
            turnOffDarkMode()
        }
    }
}
if (mashiro_option.dm_strategy === 'client') {
    mediaQuery.removeEventListener?mediaQuery.removeEventListener('change', mediaQueryCallback):mediaQuery.removeListener(mediaQueryCallback)
    mediaQuery.addEventListener?mediaQuery.addEventListener('change', mediaQueryCallback):mediaQuery.addListener(mediaQueryCallback)
}
function saveUserSetting(value: boolean) {
    if (value == ifDarkmodeShouldOn()) {
        //用户设置与自动切换深色模式判断一致时，恢复自动切换
        localStorage.removeItem('dark');
    } else {
        if (value == true) {
            localStorage.setItem("dark", "1");
        } else {
            localStorage.setItem("dark", "0");
        }
    }
    //localStorage.setItem("bgImgSetting", "white-bg");
}
export function turnOnDarkMode(userTriggered?: boolean) {
    document.documentElement.style.backgroundColor = "#333";
    (document.getElementsByClassName("site-content")[0] as HTMLElement).style.backgroundColor = "#333";
    document.body.classList.add("dark");
    if (userTriggered) saveUserSetting(true)
    informDarkModeChange(true)
}
export function turnOffDarkMode(userTriggered?: boolean) {
    document.documentElement.style.backgroundColor = "";
    (document.getElementsByClassName("site-content")[0] as HTMLElement).style.backgroundColor = "rgba(255, 255, 255, .8)";
    document.body.classList.remove("dark");
    document.body.classList.remove("dynamic");
    informDarkModeChange(false)
    if (userTriggered) {
        saveUserSetting(false);
        //document.body.style.backgroundImage = `url(${mashiro_option.skin_bg0})`;
    }
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
        case 'client':
            return mediaQuery.matches
        case 'eien':
            return true
        default:/**case time */
            return checkTime()
    }
}
export function checkDarkModeSetting() {
    const dark = localStorage.getItem("dark")
    if (!dark) {
        //无用户设置时，自动切换深色模式
        if (ifDarkmodeShouldOn() && mashiro_option.darkmode) {
            turnOnDarkMode()
        } else {
            turnOffDarkMode()
        }
    } else {
        if (dark == '1') {
            turnOnDarkMode()
        } else {
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