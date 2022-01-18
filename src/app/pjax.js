import { lazyload } from 'lazyload'
import { createButterbar } from '../common/butterbar';
import { _$ } from '../common/sakurairo_global';
import add_copyright from './copyright';
import { loadFontSetting } from './font_control';
import { MNH, auto_height, PE, CE, no_right_click, bgButtonAddListener, timeSeriesReload, checkSkinSecter, checkCoverBackground } from './func';
import hitokoto from './hitokoto';
import { coverVideoIni } from './video';
import { web_audio } from './web_audio';
import { XLS, post_list_show_animation } from './post_list'

import NProgress from 'nprogress'
import Pjax from '@sliphua/pjax'
import initTypedJs, { disableTypedJsIfExist } from './typed'

export default function initPjax() {
    new Pjax({
        selectors: ["#page", "title", ".footer-device", "#app-js-before", "#login-link", "#entry-content-css"],
        scripts: "#app-js-before",
        timeout: 8000,
        defaultTrigger: {
            exclude: 'a[data-no-pjax]',
        }
    })
    document.addEventListener("pjax:send", () => {
        for (const element of document.getElementsByClassName("normal-cover-video")) {
            element.pause();
            element.src = '';
            element.load = '';
        }
        document.getElementById("bar").style.width = "0%";
        if (mashiro_option.NProgressON) NProgress.start()
        MNH();
    });
    document.addEventListener("pjax:complete", () => {
        auto_height();
        PE();
        CE();
        if (mashiro_option.land_at_home) {
            XLS();
            initTypedJs()
        } else {
            disableTypedJsIfExist()
        }
        if (mashiro_option.NProgressON) NProgress.done()
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
    document.addEventListener("pjax:success", () => {
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
    window.addEventListener('popstate', (e) => {
        auto_height();
        hitokoto()
        PE();
        CE();
        timeSeriesReload(true);
        post_list_show_animation();
    }, false);
}