/**
 * app.js - Client script bundle for Sakurairo, a WordPress theme.
 * @author bymoye 
 * @author KotoriK
 * @license GPL-v2
 * @date 2021.3.21
 * Github Repository:
 * @url https://github.com/Fuukei/Sakurairo_Scripts
 * @url https://github.com/mirai-mamori/Sakurairo/blob/f7db3c5c73d70a6a3f845844a44f279d540a7b6c/js/sakura-app.js
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
 * *** inherited from Xoin-Yang/Akina/js/global.js ***
 * @author Xoin-Yang
 * @date 2017.04.25
 * @url http://www.akina.pw/
 * *** END OF ACKNOWLEDGEMENT *** 
 * 
 * Press 'F' to pay respects.
 * 
 */

import { getCurrentBG, init_post_cover_as_bg} from './coverBackground'
import lazyload from "../common/lazyload"
import './global-func'
import { ready } from '../common/util'
import about_us from './about_us'
import preload_screen from './preload_screen'
import { isSupported } from './compatibility'
import hitokoto from './hitokoto'
import { XLS, post_list_show_animation } from './post_list'
import { initThemeColor, updateThemeSkin } from './theme-color'
import initEffect from './effect'
import { initIsMobileCache, isMobile } from './mobile'
import { initFontControl } from './font_control'
import scrollHandler from './scroll_handler'
import { checkDarkModeSetting, } from './darkmode'
import { addSkinMenuListener, auto_height, bgButtonAddListener, CE, checkBgImgSetting, checkCoverBackground, closeSkinMenu, MN, PE, timeSeriesReload, collapseMenu } from './func'
import initTypedJs from './typed'
import showcard from './showcard'
import add_copyright from './copyright'
import initFooter from './footer'
import init_medal_effects from './animations/medal_effects';
import { SearchDialog } from './search'


initIsMobileCache()
/**
 * 检查是否应当开启_iro.pjax
 * @seealso https://github.com/PaperStrike/Pjax#compatibility
 */
_iro.pjax = _iro.pjax && isSupported({ Firefox: 60, Edg: 79, Chrome: 66, OPR: 53, Version: 12/**Safari 12 */ });
_iro.pjax && import('./pjax').then(({ default: initPjax }) => initPjax())

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
    if (_iro.float_player_on) {
        if (!isMobile()) {
            import('./aplayer').then(({ aplayerInit }) => aplayerInit())
        }
    }
    if (_iro.land_at_home) initTypedJs()
    Promise.all([checkCoverBackground(), checkBgImgSetting()])
        .then(() => {
            if (_iro.extract_theme_skin || isSupported({ Version: 15/**Safari 15 */ })) {
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
    coverVideo();
    hitokoto()
    bgButtonAddListener()
    init_post_cover_as_bg();
    //#region has-dom-modify
    initFontControl()
    auto_height();
    PE();
    CE();
    //#endregion
    preload_screen()
    lazyload();
    showcard()
    powermode()
    //#region mashiro_global.ini.normalize();
    post_list_show_animation();
    coverVideoIni();
    //#endregion
    initEffect()
    about_us()
    initFooter();
    init_medal_effects();
    SearchDialog();
});
