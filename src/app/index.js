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

import { getCurrentBG, } from './coverBackground'
import add_copyright from './copyright'
import { loadCSS } from 'fg-loadcss'
import { lazyload } from 'lazyload'
import './global-func'
import { ready } from '../common/util'
import about_us from './about_us'
import preload_screen from './preload_screen'
import { isSupported } from './compatibility'
import hitokoto from './hitokoto'
import { web_audio } from './web_audio'
import { XLS, post_list_show_animation } from './post_list'
import { initThemeColor, updateThemeSkin } from './theme-color'
import initEffect from './effect'
import { initIsMobileCache, isMobile } from './mobile'
import { initFontControl } from './font_control'
import scrollHandler from './scroll_handler'
import { checkDarkModeSetting, } from './darkmode'
import { addSkinMenuListener, auto_height, bgButtonAddListener, CE, checkBgImgSetting, checkCoverBackground, checkSkinSecter, closeSkinMenu, MN, no_right_click, PE, timeSeriesReload } from './func'
import initTypedJs from './typed'
/**
 * 检查是否应当开启Poi.pjax
 * @seealso https://github.com/PaperStrike/Pjax#compatibility
 */
Poi.pjax = Poi.pjax && isSupported({ Firefox: 60, Edg: 79, Chrome: 66, OPR: 53, Version: 12/**Safari 12 */ });
Poi.pjax && import('./pjax').then(({ default: initPjax }) => initPjax())

no_right_click();
timeSeriesReload();
add_copyright()
function activate_widget() {
    let secondary = document.getElementById("secondary");
    if (!isMobile()) {
        let show_hide = document.querySelector(".show-hide");
        show_hide && show_hide.addEventListener("click", () => {
            secondary && secondary.classList.toggle("active");
        });
    } else {
        secondary && secondary.remove();
    }
}
setTimeout(function () {
    activate_widget();
}, 100);

/* let isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
    isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
    isIe = navigator.userAgent.toLowerCase().indexOf('msie') > -1;
if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) { */
window.addEventListener('hashchange', () => {
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

checkDarkModeSetting();

import POWERMODE from 'activate-power-mode'
import { coverVideoIni, coverVideo } from './video'

function powermode() {
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
}
//afterDOMContentLoaded

ready(function () {
    initIsMobileCache()
    if (mashiro_option.float_player_on) {
        if (!isMobile()) {
            import('./aplayer').then(({ aplayerInit }) => aplayerInit())
        }
    }
    if (mashiro_option.land_at_home) initTypedJs()
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
    close_SkinMenu && close_SkinMenu.addEventListener("click", closeSkinMenu)
    scrollHandler();
    /*GT()*/
    const mb_to_top = document.querySelector("#moblieGoTop")
    if (mb_to_top) {
        mb_to_top.onclick = () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        }
    }
    /*GT end;*/
    XLS();
    MN();
    coverVideo();
    hitokoto()
    bgButtonAddListener()
    //#region has-dom-modify
    initFontControl()
    auto_height();
    PE();
    CE();
    //#endregion
    web_audio()
    preload_screen()
    lazyload();
    powermode()
    about_us()
});
//#region mashiro_global.ini.normalize();
post_list_show_animation();
coverVideoIni();
checkSkinSecter();
//#endregion
initEffect()
loadCSS(mashiro_option.jsdelivr_css_src);
loadCSS("https://at.alicdn.com/t/font_679578_qyt5qzzavdo39pb9.css");