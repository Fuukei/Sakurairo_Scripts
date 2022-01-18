import { lazyload } from 'lazyload'
import { slideToggle } from "../common/util";
import { changeCoverBG, getCoverPath, getCurrentBG, nextBG, preBG } from "./coverBackground";
import { isMobile } from "./mobile";
import { open, close } from './mobile_nav'

var _mashiro_global_skin_secter = true

export function checkSkinSecter() {
    if (_mashiro_global_skin_secter === false) {
        const pattern = document.querySelector(".pattern-center"),
            headertop = document.querySelector(".headertop-bar");
        if (pattern) {
            pattern.classList.remove("pattern-center");
            pattern.classList.add("pattern-center-sakura");
        }
        if (headertop) {
            headertop.classList.remove("headertop-bar");
            headertop.classList.add("headertop-bar-sakura");
        }
    } else {
        const pattern = document.querySelector(".pattern-center-sakura"),
            headertop = document.querySelector(".headertop-bar-sakura");
        if (pattern) {
            pattern.classList.remove("pattern-center-sakura");
            pattern.classList.add("pattern-center");
        }
        if (headertop) {
            headertop.classList.remove("headertop-bar-sakura");
            headertop.classList.add("headertop-bar");
        }
    }
}
export function no_right_click() {
    const pri = document.getElementById("primary");
    if (pri) pri.addEventListener("contextmenu", (e) => {
        if (e.target.nodeName.toLowerCase() == "img") {
            e.preventDefault();
            e.stopPropagation();
        }
    })
}
/**
 * 设置前台背景
 * @param {string} tagId 前台背景ID
 * @returns 
 */
export async function changeSkin(tagId) {
    //@sideeffect
    _mashiro_global_skin_secter = tagId == "white-bg" || tagId == "dark-bg";
    checkSkinSecter();
    let bg_url;
    switch (tagId) {
        case "white-bg":
            if (mashiro_option.site_bg_as_cover) {
                changeCoverBG(await getCoverPath())//为触发封面背景相关事件 调用函数而不是走下方流程
                return
            } else {
                bg_url = mashiro_option.skin_bg0;
            }
            break;
        case "diy1-bg":
            bg_url = mashiro_option.skin_bg1;
            break;
        case "diy2-bg":
            bg_url = mashiro_option.skin_bg2;
            break;
        case "diy3-bg":
            bg_url = mashiro_option.skin_bg3;
            break;
        case "diy4-bg":
            bg_url = mashiro_option.skin_bg4;
            break;
    }
    document.body.style.backgroundImage = bg_url ? `url(${bg_url})` : '';
}

export function bgButtonAddListener() {
    const next = document.getElementById("bg-next"),
        pre = document.getElementById("bg-pre");
    if (next) { next.onclick = nextBG };
    if (pre) { pre.onclick = preBG };
}

export function timeSeriesReload(flag) {
    let archives = document.getElementById('archives');
    if (archives == null) return;
    let al_li = archives.getElementsByClassName('al_mon');
    if (flag == true) {
        archives.addEventListener("click", (e) => {
            if (e.target.classList.contains("al_mon")) {
                e.preventDefault();
                slideToggle(e.target.nextElementSibling, 500);
            }
        })
        lazyload();
    } else {
        let al_expand_collapse = document.getElementById('al_expand_collapse');
        al_expand_collapse.style.cursor = "s-resize";
        for (let i = 0; i < al_li.length; i++) {
            let a = al_li[i],
                num = a.nextElementSibling.getElementsByTagName('li').length;
            a.style.cursor = "s-resize";
            a.querySelector('#post-num').textContent = num;
        }
        const al_post_list = archives.getElementsByClassName("al_post_list")
        const al_post_list_first = al_post_list[0];
        const cb = () => {
            slideToggle(al_post_list_first, 500, 'show');
        }
        for (const child of al_post_list) {
            slideToggle(child, 500, 'hide', cb)
        }
        archives.addEventListener("click", (e) => {
            if (e.target.classList.contains("al_mon")) {
                slideToggle(e.target.nextElementSibling, 500);
                e.preventDefault();
            }
        })
        if (!isMobile()) {
            for (let i = 0; i < al_post_list.length; i++) {
                let el = al_post_list[i];
                el.parentNode.addEventListener('mouseover', () => {
                    slideToggle(el, 500, 'show');
                    return false;
                })
            }
            if (false) {
                for (let i = 0; i < al_post_list.length; i++) {
                    let el = al_post_list[i];
                    el.parentNode.addEventListener('mouseover', function () {
                        slideToggle(el, 500, 'hide');
                        return false;
                    })
                }
            }
            let al_expand_collapse_click = 0;
            al_expand_collapse.addEventListener('click', () => {
                if (al_expand_collapse_click == 0) {
                    for (let i = 0; i < al_post_list.length; i++) {
                        let el = al_post_list[i];
                        slideToggle(el, 500, 'show');
                    };
                    al_expand_collapse_click++;
                } else if (al_expand_collapse_click == 1) {
                    for (let i = 0; i < al_post_list.length; i++) {
                        let el = al_post_list[i];
                        slideToggle(el, 500, 'hide');
                    };
                    al_expand_collapse_click--;
                }
            });
        }
    }
}
//#region Siren
import { liveplay, livepause, } from './video'
export function MN() {
    const iconflat = document.querySelector(".iconflat");
    iconflat && iconflat.addEventListener("click", (e) => {
        e.stopPropagation()
        if (document.body.classList.contains("navOpen")) {
            close()
        } else {
            open()
        }
    });
}

export function MNH() {
    if (document.body.classList.contains("navOpen")) {
        close()
    }
}
/**
 * @has-dom-modify
 */
export function auto_height() {
    if (Poi.windowheight == 'auto') {
        if (document.querySelector("h1.main-title")) {
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
        if (document.querySelector(".main-title")) {
            try {
                blank.style.paddingTop = "0px";
            } catch (e) { }
            headertop.style.height = "auto";
            headertop.style.display = "";
            if (Poi.movies.live) liveplay();
        } else {
            try {
                blank.style.paddingTop = "75px";
            } catch (e) { }
            headertop.style.height = "0px";
            headertop.style.display = "none";
            livepause();
        }
    }
}
import { jsSearchCallback } from './search'
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
        for (let i = 0; i < archives.length; i++) {
            archives[i].style.display = "none";
        }
        archives[0].style.display = "";
        let h3 = document.getElementById("archives-temp").getElementsByTagName("h3");
        for (let i = 0; i < h3.length; i++) {
            h3[i].addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                slideToggle(e.target.nextElementSibling, 300);
            })
        }
    }
    // $('.comments-hidden').show();
    // $('.comments-main').hide();
    // $('.comments-hidden').click(function () {
    //     $('.comments-main').slideDown(500);
    //     $('.comments-hidden').hide();
    // });
    // $('.archives').hide();
    // $('.archives:first').show();
    // $('#archives-temp h3').click(function () {
    //     $(this).next().slideToggle('fast');
    //     return false;
    // });
    /*if (mashiro_option.baguetteBoxON) {
        baguetteBox.run('.entry-content', {
            captions: function (element) {
                return element.getElementsByTagName('img')[0].alt;
            },
            ignoreClass: 'fancybox',
        });
    }*/

    for (const ele of document.getElementsByClassName('js-toggle-search')) {
        ele.addEventListener('click', jsSearchCallback);
    }

    const sc = document.querySelector(".search_close");
    sc && sc.addEventListener("click", () => {
        let js_search = document.getElementsByClassName("js-search")[0];
        if (js_search.classList.contains("is-visible")) {
            document.getElementsByClassName("js-toggle-search")[0].classList.toggle("is-active");
            js_search.classList.toggle("is-visible");
            document.documentElement.style.overflowY = "unset";
        }
    });
    try {
        const show_Nav = document.getElementById("show-nav");
        const loading = document.getElementById("loading");

        show_Nav.addEventListener("click", function () {
            if (show_Nav.classList.contains("showNav")) {
                show_Nav.classList.remove("showNav");
                show_Nav.classList.add("hideNav");
                let sln = document.querySelector(".site-top .lower nav");
                sln && sln.classList.add("navbar");
            } else {
                show_Nav.classList.remove("hideNav");
                show_Nav.classList.add("showNav");
                let sln = document.querySelector(".site-top .lower nav");
                sln && sln.classList.remove("navbar");
            }
        });
        loading.addEventListener("click", () => {
            loading.classList.add("hide");
            loading.classList.remove("show");
        });
    } catch (e) { }
}

//#endregion Siren
export function addSkinMenuListener() {
    const cached = document.querySelectorAll(".menu-list li");
    cached.forEach(e => {
        e.addEventListener("click", function () {
            const tagid = this.id;
            if (tagid == "dark-bg") {
                turnOnDarkMode(true)
            } else {
                turnOffDarkMode(true)
                changeSkin(tagid)
                localStorage.setItem("bgImgSetting", tagid)
            }
            closeSkinMenu();
        });
    });
}
/**
 * 根据设置初始化前台背景。启用前台背景与站点封面背景一体化以后封面背景在此设置
 * @returns 一个Promise。Promise resolved 时封面背景应当已经加载完毕
 */
export function checkBgImgSetting() {
    return changeSkin(localStorage.getItem("bgImgSetting") || 'white-bg');
}
export async function checkCoverBackground() {
    if (mashiro_option.site_bg_as_cover) {
        return //交给checkBgImgSetting处理
    }
    if (!mashiro_option.land_at_home) return//进入非主页  
    if (getCurrentBG()) {//进入主页且已经加载了封面背景
        return
    }
    changeCoverBG(await getCoverPath())
}
export function closeSkinMenu() {
    document.querySelector(".skin-menu").classList.remove("show");
    setTimeout(() => {
        if (document.querySelector(".changeSkin-gear") != null) {
            document.querySelector(".changeSkin-gear").style.visibility = "visible";
        }
    }, 300);
}