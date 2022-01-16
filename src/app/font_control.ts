import { createButterbar } from "../common/butterbar";
import { __ } from "../common/sakurairo_global";
import { isMobile } from "./mobile";

let btnSerif: HTMLButtonElement,
    btnSansSerif: HTMLButtonElement;
function Serif() {
    if (isMobile()) {
        createButterbar(__("将从网络加载字体，流量请注意"));
    }
    document.body.classList.add("serif");
    setButtonState('serif')
    localStorage.setItem("font_family", "serif");
}
function SansSerif() {
    document.body.classList.remove("serif");
    setButtonState('sans-serif')
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
}
function setButtonState(font_name?: string) {
    if (font_name || localStorage.getItem("font_family") == 'sans-serif') {
        btnSerif.classList.remove("selected");
        btnSansSerif.classList.add("selected");
    } else {
        btnSansSerif.classList.remove("selected");
        btnSerif.classList.add("selected");
    }
}
function initDOMCache() {
    btnSerif = document.getElementsByClassName("control-btn-serif")[0] as HTMLButtonElement
    btnSansSerif = document.getElementsByClassName("control-btn-sans-serif")[0] as HTMLButtonElement;
    return btnSansSerif && btnSerif
}
function initListener() {
    btnSerif.addEventListener('click', change_font_listener(btnSerif))
    btnSansSerif.addEventListener('click', change_font_listener(btnSansSerif))
}
export function initFontControl() {
    const result = initDOMCache()
    if (!result) localStorage.removeItem('font_family') //样式菜单“简单”时，使用默认字体 “A”
    loadFontSetting()
    if (result) {
        setButtonState()
        initListener()
    }
}