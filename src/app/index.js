/**
 * app.js - Client script bundle for Sakurairo, a WordPress theme.
 * @author bymoye 
 * @author KotoriK
 * @license GPL-v2
 * @date 2021.3.21
 * Github Repository:
 * @url https://github.com/Fuukei/Sakurairo_Scripts
 * @url https://github.com/mirai-mamori/Sakurairo commit f7db3c5
 * 
 * *** ACKNOWLEDGEMENT *** 
 * 
 * *** modified on mashirozx/Sakura/js/sakura-app.js ***
 * Sakura theme application bundle
 * @author Mashiro
 * @url https://2heng.xin
 * @date 2019.8.3
 * *** ***
 * 
 * *** inherited from louie-senpai/Siren/js/app.js ***
 * Siren application js
 * @author Louie
 * @url http://i94.me
 * @date 2016.11.19
 * *** ***
 * 
 * inherited from Xoin-Yang/Akina/js/global.js
 * @author Xoin-Yang
 * @date 2017.04.25
 * @url http://www.akina.pw/
 * *** END OF ACKNOWLEDGEMENT *** 
 * 
 * Press 'F' to pay respects.
 * 
 */

import { nextBG, preBG, getCoverPath, getCurrentBG, changeCoverBG } from './coverBackground'
import add_copyright from './copyright'
import { createButterbar } from '../common/butterbar'
import { loadCSS } from 'fg-loadcss'
import { lazyload } from 'lazyload'
import './global-func'
import { ready, slideToggle } from '../common/util'
import about_us from './about_us'
import preload_screen from './preload_screen'
import { _$ } from '../common/sakurairo_global'
import { isSupported } from './compatibility'
import hitokoto from './hitokoto'
import { web_audio } from './web_audio'
import { open, close } from './mobile_nav'
import { XLS, post_list_show_animation } from './posts'
import { initThemeColor, updateThemeSkin } from './theme-color'
import initEffect from './effect'

/**
 * 检查是否应当开启Poi.pjax
 * @seealso https://github.com/PaperStrike/Pjax#compatibility
 */
Poi.pjax = Poi.pjax && isSupported({ Firefox: 60, Edg: 79, Chrome: 66, OPR: 53, Version: 12/**Safari 12 */ });
Poi.pjax && import('@sliphua/pjax').then(({ default: Pjax }) =>
    new Pjax({
        selectors: ["#page", "title", ".footer-device", "#app-js-before", "#login-link"],
        scripts: "#app-js-before",
        timeout: 8000,
        defaultTrigger: {
            exclude: 'a[data-no-pjax]',
        }
    })
)
loadCSS(mashiro_option.jsdelivr_css_src);
loadCSS(mashiro_option.entry_content_style_src);
loadCSS("https://at.alicdn.com/t/font_679578_qyt5qzzavdo39pb9.css");

var _mashiro_global_skin_secter = true
import { initFontControl, loadFontSetting } from './font_control'

function scrollBar() {
    if (document.body.clientWidth > 860) {
        window.addEventListener("scroll", () => {
            let s = document.documentElement.scrollTop || document.body.scrollTop,
                a = document.documentElement.scrollHeight || document.body.scrollHeight,
                b = window.innerHeight, c,
                result = parseInt(s / (a - b) * 100),
                cached = document.getElementById('bar');
            cached.style.width = result + "%";
            /* switch (true) {
                case (result <= 19): c = '#cccccc'; break;
                case (result <= 39): c = '#50bcb6'; break;
                case (result <= 59): c = '#85c440'; break;
                case (result <= 79): c = '#f2b63c'; break;
                case (result <= 99): c = '#FF0000'; break;
                case (result == 100): c = '#5aaadb'; break;
                default: c = "orange";
            }
            cached.style.background = c; */
            //炫彩scrollbar好像不是很好看，又被php那边的样式强制覆盖了，就先注释掉
            const skinMenu = document.querySelector(".skin-menu");
            skinMenu && skinMenu.classList.remove("show");
        })
    }
}

function checkSkinSecter() {
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
import { checkDarkModeSetting, turnOnDarkMode, turnOffDarkMode, } from './darkmode'
function no_right_click() {
    const pri = document.getElementById("primary");
    if (pri) pri.addEventListener("contextmenu", function (e) {
        if (e.target.nodeName.toLowerCase() == "img") {
            e.preventDefault();
            e.stopPropagation();
        }
    })
}
no_right_click();

/**
 * 设置前台背景
 * @param {string} tagId 前台背景ID
 * @returns 
 */
async function changeSkin(tagId) {
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

function bgButtonAddListener() {
    const next = document.getElementById("bg-next"),
        pre = document.getElementById("bg-pre");
    if (next) { next.onclick = nextBG };
    if (pre) { pre.onclick = preBG };
}

function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function timeSeriesReload(flag) {
    let archives = document.getElementById('archives');
    if (archives == null) return;
    let al_li = archives.getElementsByClassName('al_mon');
    if (flag == true) {
        archives.addEventListener("click", function (e) {
            if (e.target.classList.contains("al_mon")) {
                slideToggle(e.target.nextElementSibling, 500);
                e.preventDefault();
            }
        })
        lazyload();
    } else {
        (function () {
            let al_expand_collapse = document.getElementById('al_expand_collapse');
            al_expand_collapse.style.cursor = "s-resize";
            for (let i = 0; i < al_li.length; i++) {
                let a = al_li[i],
                    num = a.nextElementSibling.getElementsByTagName('li').length;
                a.style.cursor = "s-resize";
                a.querySelector('#post-num').textContent = num;
            }
            let al_post_list = archives.getElementsByClassName("al_post_list"),
                al_post_list_f = al_post_list[0];
            for (let i = 0; i < al_post_list.length; i++) {
                slideToggle(al_post_list[i], 500, 'hide', function () {
                    slideToggle(al_post_list_f, 500, 'show');
                })
            }
            archives.addEventListener("click", function (e) {
                if (e.target.classList.contains("al_mon")) {
                    slideToggle(e.target.nextElementSibling, 500);
                    e.preventDefault();
                }
            })
            if (document.body.clientWidth > 860) {
                for (let i = 0; i < al_post_list.length; i++) {
                    let el = al_post_list[i];
                    el.parentNode.addEventListener('mouseover', function () {
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
                al_expand_collapse.addEventListener('click', function () {
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
        })();
    }
}

timeSeriesReload();

add_copyright()

if (mashiro_option.float_player_on) {
    if (document.body.clientWidth > 860) {
        import('./aplayer').then(({ aplayerInit }) => aplayerInit())
    }
}

function activate_widget() {
    let secondary = document.getElementById("secondary");
    if (document.body.clientWidth > 860) {
        let show_hide = document.querySelector(".show-hide");
        show_hide && show_hide.addEventListener("click", function () {
            secondary && secondary.classList.toggle("active");
        });
    } else {
        secondary && secondary.remove();
    }
}
setTimeout(function () {
    activate_widget();
}, 100);

//#region Siren
import { liveplay, livepause, coverVideo, coverVideoIni } from './video'
function MN() {
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

function MNH() {
    if (document.body.classList.contains("navOpen")) {
        close()
    }
}
function auto_height() {
    if (Poi.windowheight == 'auto') {
        if (document.querySelector("h1.main-title")) {
            //let _height = document.documentElement.clientHeight + "px";
            const centerbg = document.getElementById("centerbg")
            const bgvideo = document.getElementById("bgvideo")
            if (centerbg) centerbg.style.height = "100vh";
            if (bgvideo) bgvideo.style.minHeight = "100vh";
        }
    } else {
        document.querySelector(".headertop") && document.querySelector(".headertop").classList.add("headertop-bar");
    }
}
function PE() {
    if (document.querySelector(".headertop")) {
        let headertop = document.querySelector(".headertop"),
            blank = document.querySelector(".blank");
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
function CE() {
    let comments_fold = document.querySelector(".comments-fold");
    let comments_main = document.querySelector(".comments-main");
    if (comments_fold != null) {
        comments_fold.style.display = "block";
        comments_main.style.display = "none";
        comments_fold.addEventListener("click", function () {
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
    sc && sc.addEventListener("click", function () {
        let js_search = document.getElementsByClassName("js-search")[0];
        if (js_search.classList.contains("is-visible")) {
            document.getElementsByClassName("js-toggle-search")[0].classList.toggle("is-active");
            js_search.classList.toggle("is-visible");
            document.documentElement.style.overflowY = "unset";
        }
    });
    try {
        let show_Nav = document.getElementById("show-nav");
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
        document.getElementById("loading").addEventListener("click", function () {
            let loading = document.getElementById("loading");
            loading.classList.add("hide");
            loading.classList.remove("show");
        });
    } catch (e) { }
}
function NH() {
    const thresold = 0,
        siteHeader = document.querySelector(".site-header")
    window.addEventListener("scroll", () => {
        const scrollTop = document.documentElement.scrollTop || window.pageYOffset;
        if (scrollTop > thresold) {
            siteHeader.classList.add("yya");
        } else {
            siteHeader.classList.remove("yya");
        }
    })
    //     $(window).scroll(function () {
    //         var s = $(document).scrollTop(),
    //             cached = $('.site-header');
    //         if (s == h1) {
    //             cached.removeClass('yya');
    //         }
    //         if (s > h1) {
    //             cached.addClass('yya');
    //         }
    // });
}
function GT() {
    let mb_to_top = document.querySelector("#moblieGoTop"),
        changskin = document.querySelector("#changskin");
    window.addEventListener("scroll", () => {
        const scroll = document.documentElement.scrollTop || document.body.scrollTop;
        const cssText = scroll > 20 ? "scale(1)" : "scale(0)"
        mb_to_top.style.transform = cssText;
        changskin.style.transform = cssText;
    })
    mb_to_top.onclick = topFunction
}

//#endregion Siren
if (Poi.pjax) {
    document.addEventListener("pjax:send", () => {
        for (const element of document.getElementsByClassName("normal-cover-video")) {
            element.pause();
            element.src = '';
            element.load = '';
        }
        document.getElementById("bar").style.width = "0%";
        if (mashiro_option.NProgressON) import('nprogress').then(({ default: NProgress }) => { NProgress.start() })
        MNH();
    });
    document.addEventListener("pjax:complete", function () {
        auto_height();
        PE();
        CE();
        if (mashiro_option.land_at_home) XLS();
        if (mashiro_option.NProgressON) import('nprogress').then(({ default: NProgress }) => { NProgress.done() })
        //#region mashiro_global.ini.pjax();
        //#region pjaxInit
        no_right_click();
        loadFontSetting()
        let _p = document.getElementsByTagName("p");
        for (let i = 0; i < _p.length; i++) {
            _p[i].classList.remove("head-copyright");
        }
        let _div = document.getElementsByTagName("div"),
            tla = document.getElementById("to-load-aplayer");
        tla && tla.addEventListener("click", () => {
            /* try {
                reloadHermit();
            } catch (e) { }; */
            for (let i = 0; i < _div.length; i++) {
                _div[i].classList.remove("load-aplayer");
            }
        });
        /* for (let i = 0; i < _div.length; i++) {
            if (_div[i].classList.contains("aplayer")) {
                try {
                    reloadHermit();
                } catch { };
            }
        } */
        let iconflat = document.getElementsByClassName("iconflat");
        if (iconflat.length != 0) {
            iconflat[0].style.width = '50px';
            iconflat[0].style.height = '50px';
        }
        let openNav = document.getElementsByClassName("openNav");
        if (openNav.length != 0) {
            openNav[0].style.height = '50px';
        }
        bgButtonAddListener()
        timeSeriesReload();
        add_copyright();
        //#endregion pjaxInit
        post_list_show_animation();
        web_audio();
        coverVideoIni();
        checkSkinSecter();
        NH();
        //#endregion
        checkCoverBackground()//pjax不需要刷新前台背景
        let loading = document.getElementById("loading");
        if (loading) {
            loading.classList.add("hide");
            loading.classList.remove("show");
        }
        //未实际使用的选项
        /* if (Poi.codelamp == 'open') {
            self.Prism.highlightAll(event)
        }; */
        if (document.querySelector(".js-search.is-visible")) {
            document.getElementsByClassName("js-toggle-search")[0].classList.toggle("is-active");
            document.getElementsByClassName("js-search")[0].classList.toggle("is-visible");
            document.documentElement.style.overflowY = "unset";
        }
        hitokoto()
        lazyload();
    });
    document.addEventListener("pjax:success", function () {
        //pjax加载时自动拉取page.js
        if (!mashiro_option.land_at_home && !document.getElementById('app-page-js')) {
            // id需要与php侧同步
            const script_app = document.getElementById('app-js')
            const script_app_page = document.createElement('script')
            script_app_page.src = script_app.src.replace('/app.js', '/page.js')
            script_app_page.id = 'app-page-js'
            document.body.appendChild(script_app_page)
        }
        //发送页面浏览事件

        /**
         * Google Analytics
         * @seealso https://developers.google.com/analytics/devguides/collection/gtagjs/pages
         */
        if (window.gtag) {
            gtag('config', Poi.google_analytics_id, {
                'page_path': window.location.pathname
            });
        }
        /**
         * 百度统计
         * @seealso https://tongji.baidu.com/web/help/article?id=235
         */
        if (window._hmt) {
            _hmt.push(['_trackPageview', pageURL]);
        }
    });
    document.addEventListener("pjax:error", (e) => {
        createButterbar(_$('页面加载出错了 HTTP {0}', e.request.status))
    })
    window.addEventListener('popstate', function (e) {
        auto_height();
        hitokoto()
        PE();
        CE();
        timeSeriesReload(true);
        post_list_show_animation();
    }, false);
}

/* let isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
    isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
    isIe = navigator.userAgent.toLowerCase().indexOf('msie') > -1;
if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) { */
window.addEventListener('hashchange', function () {
    const id = location.hash.substring(1)
    if (!(/^[A-z0-9_-]+$/.test(id))) {
        return;
    }
    const element = document.getElementById(id);
    if (element) {
        if (!(/^(?:a|select|input|button|textarea)$/i.test(element.tagName))) {
            element.tabIndex = -1;
        }
        element.focus();
    }
}, false);
/* } */

function addSkinMenuListener() {
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
function checkBgImgSetting() {
    return changeSkin(localStorage.getItem("bgImgSetting") || 'white-bg');
}
async function checkCoverBackground() {
    if (mashiro_option.site_bg_as_cover) {
        return //交给checkBgImgSetting处理
    }
    if (!mashiro_option.land_at_home) return//进入非主页  
    if (getCurrentBG()) {//进入主页且已经加载了封面背景
        return
    }
    changeCoverBG(await getCoverPath())
}

checkDarkModeSetting();

function closeSkinMenu() {
    document.querySelector(".skin-menu").classList.remove("show");
    setTimeout(function () {
        if (document.querySelector(".changeSkin-gear") != null) {
            document.querySelector(".changeSkin-gear").style.visibility = "visible";
        }
    }, 300);
}
import POWERMODE from 'activate-power-mode'

function powermode() {
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
}
//afterDOMContentLoaded

ready(function () {
    Promise.all([checkCoverBackground(), checkBgImgSetting()])
        .then(() => {
            if (isSupported({ Version: 15/**Safari 15 */ })) {
                initThemeColor()
                const bgUrl = getCurrentBG()
                if (bgUrl) updateThemeSkin(bgUrl)
            }
        })
    addSkinMenuListener();
    //let checkskin_bg = (a) => a == "none" ? "" : a;
    let changskin = document.querySelector("#changskin"),
        close_SkinMenu = document.querySelector(".skin-menu #close-skinMenu");
    changskin && changskin.addEventListener("click", function () {
        document.querySelector(".skin-menu").classList.toggle("show");
    })
    close_SkinMenu && close_SkinMenu.addEventListener("click", function () {
        closeSkinMenu();
    })

    auto_height();
    PE();
    NH();
    GT();
    XLS();
    CE();
    MN();
    coverVideo();
    hitokoto()
    bgButtonAddListener()
    initFontControl()
    web_audio()
    preload_screen()
    lazyload();
    powermode()
    initEffect()
    about_us()
});
//#region mashiro_global.ini.normalize();
post_list_show_animation();
coverVideoIni();
checkSkinSecter();
scrollBar();
//#endregion