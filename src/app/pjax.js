import lazyload from "../common/lazyload"
import { createButterbar } from '../common/butterbar';
import { _$ } from '../common/sakurairo_global';
import add_copyright from './copyright';
import { loadFontSetting } from './font_control';
import { MNH, auto_height, PE, CE, bgButtonAddListener, timeSeriesReload, checkSkinSecter, checkCoverBackground } from './func';
import hitokoto from './hitokoto';
import { coverVideoIni } from './video';
import { XLS, post_list_show_animation } from './post_list'
import { applyArticleHighlights } from './article-highlight'

import NProgress from 'nprogress'
import Pjax from '@sliphua/pjax'
import initTypedJs, { disableTypedJsIfExist } from './typed'

import showcard from './showcard';

export default function initPjax() {
    new Pjax({
        selectors: ["#page", "title", ".footer-content", "#app-js-before", "#entry-content-css"],
        scripts: "#app-js-before",
        timeout: 5000,
        defaultTrigger: {
            exclude: 'a[data-no-pjax]',
        }
    })

    // Pjax 开始时的处理
    document.addEventListener("pjax:send", () => {
        for (const element of document.getElementsByClassName("normal-cover-video")) {
            element.pause();
            element.src = '';
            element.load = '';
        }
        document.getElementById("bar").style.width = "0%";
        if (_iro.NProgressON) NProgress.start()
    });

    // Pjax 完成时的处理
    document.addEventListener("pjax:complete", () => {
        auto_height();
        PE();
        CE();
        if (_iro.land_at_home) {
            XLS();
            initTypedJs()
        } else {
            disableTypedJsIfExist()
        }
        if (_iro.NProgressON) NProgress.done()

        loadFontSetting()
        let _p = document.getElementsByTagName("p");
        for (let i = 0; i < _p.length; i++) {
            _p[i].classList.remove("head-copyright");
        }
        let _div = document.getElementsByTagName("div"),
            tla = document.getElementById("to-load-aplayer");
        tla && tla.addEventListener("click", () => {
            for (let i = 0; i < _div.length; i++) {
                _div[i].classList.remove("load-aplayer");
            }
        });
        let iconflat = document.getElementsByClassName("iconflat");
        if (iconflat.length != 0) {
            iconflat[0].style.width = '50px';
            iconflat[0].style.height = '50px';
        }
        bgButtonAddListener()
        timeSeriesReload();
        add_copyright();
        post_list_show_animation();
        coverVideoIni();
        checkSkinSecter();
        checkCoverBackground()
        let loading = document.getElementById("loading");
        if (loading) {
            loading.classList.add("hide");
            loading.classList.remove("show");
        }
        if (document.querySelector(".js-search.is-visible")) {
            document.getElementsByClassName("js-toggle-search")[0].classList.toggle("is-active");
            document.getElementsByClassName("js-search")[0].classList.toggle("is-visible");
            document.documentElement.style.overflowY = "unset";
        }
        hitokoto()
        showcard()
        lazyload();
        // 在页面切换完成后重新应用文章特色图片取色
        applyArticleHighlights();
    });

    // Pjax 成功时的处理
    document.addEventListener("pjax:success", () => {
        if (!_iro.land_at_home && !document.getElementById('app-page-js')) {
            const script_app = document.getElementById('app-js')
            const script_app_page = document.createElement('script')
            script_app_page.src = script_app.src.replace('/app.js', '/page.js')
            script_app_page.id = 'app-page-js'
            document.body.appendChild(script_app_page)
        }
        if (window.gtag) {
            gtag('config', _iro.google_analytics_id, {
                'page_path': window.location.pathname
            });
        }
        if (window._hmt) {
            _hmt.push(['_trackPageview', pageURL]);
        }
    });

    // Pjax 出错时的处理
    document.addEventListener("pjax:error", ({ detail }) => {
        const { status } = detail.request
        if (status) {
            createButterbar(_$('页面加载出错了 HTTP {0}', status))
        } else if (/aborterror/i.exec(detail.error)) {
            const { url } = detail.request
            if (url) {
                location = url
                return
            }
        }
        console.warn('pjax:error', detail)
    })

    // 浏览器历史记录导航时的处理
    window.addEventListener('popstate', (e) => {
        auto_height();
        hitokoto()
        PE();
        CE();
        timeSeriesReload(true);
        post_list_show_animation();
        // 在浏览器历史导航时确保应用文章特色图片取色
        applyArticleHighlights();
    }, false);
}