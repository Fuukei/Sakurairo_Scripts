import lazyload from "../common/lazyload"
import { slideToggle } from "../common/util";
import { changeCoverBG, getCoverPath, getCurrentBG, nextBG, preBG } from "./coverBackground";
import { isMobile } from "./mobile";

var _mashiro_global_skin_secter = true
/**
 * 设置前台背景
 * @param {string} tagId 前台背景ID
 * @returns 
 */
export async function changeSkin(tagId) {
    //@sideeffect
    _mashiro_global_skin_secter = tagId == "white-bg" || tagId == "dark-bg";
    let bg_url;
    switch (tagId) {
        case "white-bg":
            if (_iro.site_bg_as_cover) {
                changeCoverBG(await getCoverPath())//为触发封面背景相关事件 调用函数而不是走下方流程
                return
            } else {
                bg_url = _iro.skin_bg0;
            }
            break;
        case "diy1-bg":
            bg_url = _iro.skin_bg1;
            break;
        case "diy2-bg":
            bg_url = _iro.skin_bg2;
            break;
        case "diy3-bg":
            bg_url = _iro.skin_bg3;
            break;
        case "diy4-bg":
            bg_url = _iro.skin_bg4;
            break;
    }
    document.body.style.backgroundImage = bg_url ? `url(${bg_url})` : '';
}

export function bgButtonAddListener() {
    const next = document.getElementById("bg-next"),
        pre = document.getElementById("bg-pre");
    if (next) { next.onclick = nextBG }
    if (pre) { pre.onclick = preBG }
}

import { liveplay, livepause, } from './video'

/**
 * @has-dom-modify
 */
export function auto_height() {
    if (_iro.windowheight == 'auto') {
        if (_iro.land_at_home) {
            //let _height = document.documentElement.clientHeight + "px";
            const centerbg = document.getElementById("centerbg")
            const bgvideo = document.getElementById("bgvideo")
            if (centerbg) centerbg.style.height = "100vh";
            if (bgvideo) bgvideo.style.minHeight = "100vh";
        }
    } else {
        const headertop = document.querySelector(".headertop")
        headertop && headertop.classList.add("headertop-bar");
    }
}
/**
 * @has-dom-modify
 */
export function PE() {
    const headertop = document.querySelector(".headertop")
    if (headertop) {
        let blank = document.querySelector(".blank");
        if (_iro.land_at_home) {
            try {
                blank.style.paddingTop = "0px";
            } catch (e) { }
            headertop.style.height = "auto";
            headertop.style.display = "";
            if (_iro.movies.live) liveplay();
        } else {
            try {
                blank.style.paddingTop = "75px";
            } catch (e) { }
            headertop.style.height = "0px";
            headertop.style.display = "none";
        }
    }
}

import { turnOnDarkMode, turnOffDarkMode } from './darkmode';
/**
 * @has-dom-modify
 */
export function CE() {
    let comments_fold = document.querySelector(".comments-fold");
    let comments_main = document.querySelector(".comments-main");
    if (comments_fold != null) {
        comments_fold.style.display = "block";
        comments_main.style.display = "none";
        comments_fold.addEventListener("click", () => {
            slideToggle(comments_main, 500, 'show');
            comments_fold.style.display = "none";
        });
    }
    let archives = document.getElementsByClassName("archives");
    if (archives.length > 0) {
        for (let i = 1; i < archives.length; i++) {
            archives[i].style.display = "none";
        }
        archives[0].style.display = "";
        let h3 = document.getElementById("archives-temp").getElementsByTagName("h3");
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            slideToggle(e.target.nextElementSibling, 300);
        }
        for (let i = 0; i < h3.length; i++) {
            h3[i].addEventListener("click", handler)
        }
    }

    try {
        const loading = document.getElementById("loading");
        loading.addEventListener("click", () => {
            loading.classList.add("hide");
            loading.classList.remove("show");
        });
    } catch (e) { }
}
//#endregion Siren
export function addSkinMenuListener() {
    const cached = document.querySelectorAll(".menu-list li");
    const handler = (e) => {
        const tagid = e.target.id || e.target.parentElement.id;
        if (tagid == "dark-bg") {
            turnOnDarkMode(true)
        } else {
            turnOffDarkMode(true)
            changeSkin(tagid)
            localStorage.setItem("bgImgSetting", tagid)
        }
        closeSkinMenu();
    }
    for (const e of cached) {
        e.addEventListener("click", handler);
    }
}
/**
 * 根据设置初始化前台背景。启用前台背景与站点封面背景一体化以后封面背景在此设置
 * @returns 一个Promise。Promise resolved 时封面背景应当已经加载完毕
 */
export function checkBgImgSetting() {
    return changeSkin(localStorage.getItem("bgImgSetting") || 'white-bg');
}
export async function checkCoverBackground() {
    if (_iro.site_bg_as_cover) {
        return //交给checkBgImgSetting处理
    }
    if (!_iro.land_at_home) return//进入非主页  
    if (getCurrentBG()) {//进入主页且已经加载了封面背景
        return
    }
    changeCoverBG(await getCoverPath())
}
export function closeSkinMenu() {
    document.querySelector(".skin-menu").classList.remove("show");
    setTimeout(() => {
        const changeSkin = document.querySelector(".changeSkin-gear")
        if (changeSkin != null) {
            changeSkin.style.visibility = "visible";
        }
    }, 300);
}