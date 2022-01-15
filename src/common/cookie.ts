/**
 * Cookie
 * from github.com/mirai-mamori/Sakurairo ./js/sakura-app.js ,commit 71f5a0c
 * @license GPL-v2
 * @date 2021.03
 */
let _version_ctrl = mashiro_option.cookie_version_control || ''
export function setCookie(key: string, value: string, days?: number) {
    const expires = days ? "; expires=" + new Date(Date.now() + (days * 24 * 60 * 60 * 1000)).toUTCString() : "";
    document.cookie = key + _version_ctrl + "=" + (value || "") + expires + "; path=/";
}

export function getCookie(key: string) {
    const nameEQ = key + _version_ctrl + "=",
        ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function removeCookie(key: string) {
    document.cookie = key + _version_ctrl + '=; Max-Age=-99999999;';
}