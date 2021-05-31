import { createButterbar } from "./butterbar";

let btnSerif: HTMLButtonElement,
    btnSansSerif: HTMLButtonElement;
function Serif() {
    if (document.body.clientWidth <= 860) {
        createButterbar("将从网络加载字体，流量请注意");
    }
    document.body.classList.add("serif");
    btnSerif && btnSerif.classList.add("selected");
    btnSansSerif && btnSansSerif.classList.remove("selected");
    localStorage.setItem("font_family", "serif");
}
function SansSerif() {
    document.body.classList.remove("serif");
    btnSerif && btnSerif.classList.remove("selected");
    btnSansSerif && btnSansSerif.classList.add("selected");
    localStorage.setItem("font_family", "sans-serif");
}
function change_font_listener(btn: HTMLButtonElement) {
    return () => {
        const { name } = btn.dataset
        const nowFont = localStorage.getItem("font_family")
        if (name == nowFont) {
            return
        } else {
            if (name == 'serif') {
                Serif()
            } else {
                SansSerif()
            }
        }
    }
}

export function loadFontSetting() {
    const nowFont = localStorage.getItem("font_family")
    if (!nowFont || nowFont == "serif") { 
        document.body.classList.add("serif"); 
    }
    else if (nowFont == "sans-serif") {
        btnSerif.classList.remove("selected");
        btnSansSerif.classList.add("selected");
    }
}
function initListener() {
    btnSerif = document.getElementsByClassName("control-btn-serif")[0] as HTMLButtonElement
    btnSansSerif = document.getElementsByClassName("control-btn-sans-serif")[0] as HTMLButtonElement;
    btnSerif.addEventListener('click', change_font_listener(btnSerif))
    btnSansSerif.addEventListener('click', change_font_listener(btnSansSerif))
}
export function initFontControl() {
    initListener()
    loadFontSetting()
}