/**
 * app.js - Client script bundle for Sakurairo, a WordPress theme.
 * @author bymoye
 * @author KotoriK
 * @license GPL-v2
 * Github Repository:
 * https://github.com/Fuukei/Sakurairo_Scripts
 * https://github.com/mirai-mamori/Sakurairo source from f7db3c5 
 * 
 * modified from Mashiro's work.
 * *** original header ***
 * Sakura theme application bundle
 * @author Mashiro
 * @url https://2heng.xin
 * @date 2019.8.3
 * *** ***
 */
import buildAPI from './api'
import { setCookie, getCookie, removeCookie, } from '../../module/cookie'
import add_copyright from './copyright'
import { loadCSS } from 'fg-loadcss'
import { lazyload } from 'lazyload'
(() => {
    const UA = navigator.userAgent,
        version_list = { Firefox: 84, Edg: 88, Chrome: 88, Opera: 74, Version: 9 };
    let reg;
    if (UA.indexOf('Chrome') != -1) {
        reg = /(Chrome)\/(\d+)/i;
    } else {
        reg = /(Firefox|Chrome|Version|Opera)\/(\d+)/i;
    }
    const version = UA.match(reg);
    Poi.pjax = version && (version[2] >= version_list[version[1]]) && Poi.pjax;
    if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0)
        document.cookie = "su_webp=1; expires=Fri, 31 Dec 9999 23:59:59 GMT; pach=/";
})();

mashiro_global.variables = new function () {
    this.has_hls = false;
    this.skinSecter = true;
}
mashiro_global.ini = new function () {
    this.normalize = function () { // initial functions when page first load (首次加载页面时的初始化函数)
        lazyload();
        post_list_show_animation();
        copy_code_block();
        web_audio();
        coverVideoIni();
        checkSkinSecter();
        scrollBar();
        load_bangumi();
        sm();
    }
    this.pjax = function () { // pjax reload functions (pjax 重载函数)
        pjaxInit();
        post_list_show_animation();
        copy_code_block();
        web_audio();
        coverVideoIni();
        checkSkinSecter();
        load_bangumi();
        sm();
    }
}

/**code highlight */

const code_highlight_style = (() => {
    function gen_top_bar(pre, code_a) {
        const attributes = {
            'autocomplete': 'off',
            'autocorrect': 'off',
            'autocapitalize': 'off',
            'spellcheck': 'false',
            'contenteditable': 'false',
            'design': 'by Mashiro'
        }
        if (!pre.children[0]) return
        const ele_name = pre.children[0].className
        let lang = ele_name.substr(0, ele_name.indexOf(" ")).replace('language-', '')
        if (lang.toLowerCase() == "hljs") lang = code_a.className.replace('hljs', '') ? code_a.className.replace('hljs', '') : "text";
        pre.classList.add("highlight-wrap");
        for (const t in attributes) {
            pre.setAttribute(t, attributes[t]);
        }
        code_a.setAttribute('data-rel', lang.toUpperCase());
    }
    async function importHighlightjs() {
        try {
            if (!window.hljs) {
                window.hljs = await import('highlight.js')
                await import('highlightjs-line-numbers.js')
            }
        } catch (e) { console.warn(e) }
    }
    async function hljs_process(pre, code) {
        try {
            await importHighlightjs()
            for (let i = 0; i < code.length; i++) {
                hljs.highlightBlock(code[i]);
            }
            for (let i = 0; i < pre.length; i++) {
                gen_top_bar(pre[i], code[i]);
            }
            hljs.initLineNumbersOnLoad();
            const ec = document.querySelector(".entry-content");
            ec && ec.addEventListener("click", function (e) {
                //类型问题
                //可以考虑换成 ec
                if (!e.target.classList.contains("highlight-wrap")) return;
                e.target.classList.toggle("code-block-fullscreen");
                document.documentElement.classList.toggle('code-block-fullscreen-html-scroll');
            })
        } catch (e) {
            console.warn(e)
        }
    }
    const PrismBaseUrl = mashiro_option.code_highlight_prism?.autoload_path ?? 'https://cdn.jsdelivr.net/npm/prismjs@1.23.0/'
    let current_prism_css = undefined
    const themeCSS = (() => {
        const { light, dark } = mashiro_option.code_highlight_prism?.theme ?? {}
        const theme = {
            light: light ?? 'themes/prism.min.css',
            dark: dark ?? 'themes/prism-tomorrow.min.css',
        }
        for (const theme_name in theme) {
            theme[theme_name] = new URL(theme[theme_name], PrismBaseUrl).toString()
        }
        return theme
    })()
    function loadPrismCSS(darkmodeOn) {
        const nextCSS = darkmodeOn ? themeCSS.dark : themeCSS.light
        if (current_prism_css) {
            if (current_prism_css.href !== nextCSS) {
                const nextCSSElement = loadCSS(nextCSS)
                nextCSSElement.addEventListener('load', () => {
                    current_prism_css.remove()
                    current_prism_css = nextCSSElement
                })
            }
        } else {
            current_prism_css = loadCSS(nextCSS)
        }
    }
    async function importPrismJS() {
        try {
            if (!window.Prism) {
                const { default: Prism } = await import('prismjs')
                window.Prism = Prism
            }
            //必备插件全家桶
            await Promise.all([
                import('prismjs/plugins/autoloader/prism-autoloader'),
                import('prismjs/plugins/previewers/prism-previewers'),
                import('prismjs/plugins/toolbar/prism-toolbar')
                    .then(() => import('prismjs/plugins/show-language/prism-show-language'))
            ])
            loadCSS(new URL('plugins/toolbar/prism-toolbar.min.css', PrismBaseUrl).toString())
            loadCSS(new URL('plugins/previewers/prism-previewers.min.css', PrismBaseUrl).toString())

            Prism.plugins.autoloader.languages_path = new URL('components/', PrismBaseUrl).toString()
            loadPrismCSS(isInDarkMode())
            document.addEventListener('darkmode', (e) => {
                loadPrismCSS(e.detail)
            })
        } catch (reason) {
            console.warn(reason)
        }
    }
    function loadPrismPluginLineNumbers() {
        loadCSS(new URL('plugins/line-numbers/prism-line-numbers.min.css', PrismBaseUrl).toString())
        return import('prismjs/plugins/line-numbers/prism-line-numbers')
    }
    /**
     * 
     * @param {NodeListOf<HTMLElement>} code document.querySelectorAll("pre code")
     */
    async function prism_process(code) {
        try {
            await importPrismJS()
            if (mashiro_option.code_highlight_prism.line_number_all) {
                document.querySelector('.entry-content').classList.add('line-numbers')
                await loadPrismPluginLineNumbers()
            }
            code.forEach(async ele => {
                if (ele.parentElement.classList.contains('line-numbers')) {
                    await loadPrismPluginLineNumbers()
                }
                if (ele.classList.contains('match-braces')) {
                    await import('prismjs/plugins/match-braces/prism-match-braces')
                    loadCSS(new URL('plugins/match-braces/prism-match-braces.min.css', PrismBaseUrl).toString())
                }
                Prism.highlightElement(ele)
            })
            Prism.plugins.fileHighlight && Prism.plugins.fileHighlight.highlight()
        } catch (error) {
            console.warn(error)
        }
    }

    return async function code_highlight_style() {
        //hljs.requireLanguage('javascript',await import('highlight.js/lib/languages/javascript'))
        const pre = document.getElementsByTagName("pre"),
            code = document.querySelectorAll("pre code");
        if (!pre.length) return;
        switch (mashiro_option.code_highlight) {
            case 'hljs':
                return hljs_process(pre, code)
            case 'prism':
                return prism_process(code)
            case 'custom': return
            default:
                console.warn(`mashiro_option.code_highlight这咋填的是个${mashiro_option.code_highlight}啊🤔`)
        }
    }
})()

function slideToogle(el, duration = 1000, mode = '', callback) {
    let dom = el;
    dom.status = dom.status || getComputedStyle(dom, null)['display'];
    const flag = dom.status != 'none';
    if ((flag == true && mode == "show") || (flag == false && mode == "hide")) return;
    dom.status = flag ? 'none' : 'block';
    dom.style.transition = 'height ' + duration / 1000 + 's';
    dom.style.overflow = 'hidden';
    clearTimeout(dom.tagTimer);
    dom.tagTimer = dom.tagTimer || null;
    dom.style.display = 'block';
    dom.tagHeight = dom.tagHeight || dom.clientHeight + 'px';
    dom.style.display = '';
    dom.style.height = flag ? dom.tagHeight : "0px";
    setTimeout(() => {
        dom.style.height = flag ? "0px" : dom.tagHeight
    }, 0);
    dom.tagTimer = setTimeout(() => {
        dom.style.display = flag ? 'none' : 'block';
        dom.style.transition = '';
        dom.style.overflow = '';
        dom.style.height = '';
        dom.status = dom.tagHeight = null;
    }, duration);
    if (callback) callback();
}

function post_list_show_animation() {
    if (document.querySelector('article') && document.querySelector('article').classList.contains("post-list-thumb")) {
        const options = {
            root: null,
            threshold: [0.66]
        },
            callback = (entries) => {
                entries.forEach((article) => {
                    if (!window.IntersectionObserver) {
                        article.target.style.willChange = 'auto';
                        if (article.target.classList.contains("post-list-show") === false) {
                            article.target.classList.add("post-list-show");
                        }
                    } else {
                        if (article.target.classList.contains("post-list-show")) {
                            article.target.style.willChange = 'auto';
                            io.unobserve(article.target)
                        } else {
                            if (article.isIntersecting) {
                                article.target.classList.add("post-list-show");
                                article.target.style.willChange = 'auto';
                                io.unobserve(article.target)
                            }
                        }
                    }
                })
            },
            io = new IntersectionObserver(callback, options),
            articles = document.getElementsByClassName('post-list-thumb');
        for (let a = 0; a < articles.length; a++) {
            io.observe(articles[a]);
        }
    }
}
mashiro_global.font_control = new function () {
    const cbs = document.getElementsByClassName("control-btn-serif")[0],
        cbss = document.getElementsByClassName("control-btn-sans-serif")[0];
    this.change_font = function () {
        if (document.body.classList.contains("serif")) {
            document.body.classList.remove("serif");
            cbs && cbs.classList.remove("selected");
            cbss && cbss.classList.remove("selected");
            setCookie("font_family", "sans-serif", 30);
        } else {
            document.body.classList.add("serif");
            cbs && cbs.classList.add("selected");
            cbss && cbss.classList.remove("selected");
            setCookie("font_family", "serif", 30);
            if (document.body.clientWidth <= 860) {
                addComment.createButterbar("将从网络加载字体，流量请注意");
            }
        }
    }
    this.ini = function () {
        if (document.body.clientWidth > 860) {
            if (!getCookie("font_family") || getCookie("font_family") == "serif")
                document.body.classList.add("serif");
        }
        if (getCookie("font_family") == "sans-serif") {
            document.body.classList.remove("sans-serif");
            cbs && cbs.classList.remove("selected");
            cbss && cbss.classList.add("selected");
        }
    }
}
mashiro_global.font_control.ini();

code_highlight_style();

const ready = function (fn) {
    if (document.readyState === 'complete') {
        return fn();
    }
    document.addEventListener('DOMContentLoaded', fn, false);
};
/**
 * 上传图片提示
 */
function attach_image() {
    let cached = document.getElementsByClassName("insert-image-tips")[0],
        upload_img = document.getElementById('upload-img-file');
    if (!upload_img) return;
    upload_img.addEventListener("change", (function () {
        if (this.files.length > 10) {
            addComment.createButterbar("每次上传上限为10张.<br>10 files max per request.");
            return 0;
        }
        for (let i = 0; i < this.files.length; i++) {
            if (this.files[i].size >= 5242880) {
                alert('图片上传大小限制为5 MB.\n5 MB max per file.\n\n「' + this.files[i].name + '」\n\n这张图太大啦~请重新上传噢！\nThis image is too large~Please reupload!');
                return;
            }
        }
        for (let i = 0; i < this.files.length; i++) {
            let f = this.files[i],
                formData = new FormData(),
                xhr = new XMLHttpRequest();
            formData.append('cmt_img_file', f);
            xhr.addEventListener('loadstart', function () {
                cached.innerHTML = '<i class="fa fa-spinner rotating" aria-hidden="true"></i>';
                addComment.createButterbar("上传中...<br>Uploading...");
            });
            xhr.open("POST", buildAPI(Poi.api + 'sakura/v1/image/upload'), true);
            xhr.send(formData);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                    cached.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
                    setTimeout(function () {
                        cached.innerHTML = '<i class="fa fa-picture-o" aria-hidden="true"></i>';
                    }, 1000);
                    let res = JSON.parse(xhr.responseText);
                    if (res.status == 200) {
                        let get_the_url = res.proxy;
                        document.getElementById("upload-img-show").insertAdjacentHTML('afterend', '<img class="lazyload upload-image-preview" src="https://cdn.jsdelivr.net/gh/Fuukei/Public_Repository@latest/vision/theme/colorful/load/inload.svg" data-src="' + get_the_url + '" onclick="window.open(\'' + get_the_url + '\')" onerror="imgError(this)" />');
                        lazyload();
                        addComment.createButterbar("图片上传成功~<br>Uploaded successfully~");
                        grin(get_the_url, type = 'Img');
                    } else {
                        addComment.createButterbar("上传失败！<br>Uploaded failed!<br> 文件名/Filename: " + f.name + "<br>code: " + res.status + "<br>" + res.message, 3000);
                    }
                } else if (xhr.readyState == 4) {
                    cached.innerHTML = '<i class="fa fa-times" aria-hidden="true" style="color:red"></i>';
                    alert("上传失败，请重试.\nUpload failed, please try again.");
                    setTimeout(function () {
                        cached.innerHTML = '<i class="fa fa-picture-o" aria-hidden="true"></i>';
                    }, 1000);
                }
            }
        };
    }));
}


function clean_upload_images() {
    document.getElementById("upload-img-show").innerHTML = '';
}
/**
 * 添加上传图片的提示
 */
function add_upload_tips() {
    const form_submit = document.querySelector('.form-submit #submit');
    if (!mashiro_option.comment_upload_img) {
        form_submit.style.width='100%'
        return
    }
    if (form_submit == null) return;
    form_submit.insertAdjacentHTML('afterend', '<div class="insert-image-tips popup"><i class="fa fa-picture-o" aria-hidden="true"></i><span class="insert-img-popuptext" id="uploadTipPopup">上传图片</span></div><input id="upload-img-file" type="file" accept="image/*" multiple="multiple" class="insert-image-button">');
    attach_image();

    const file_submit = document.getElementById('upload-img-file'),
        hover = document.getElementsByClassName('insert-image-tips')[0],
        Tip = document.getElementById('uploadTipPopup');
    if (!file_submit) return;
    file_submit.addEventListener("mouseenter", function () {
        hover.classList.toggle('insert-image-tips-hover');
        Tip.classList.toggle('show');
    });
    file_submit.addEventListener("mouseleave", function () {
        hover.classList.toggle('insert-image-tips-hover');
        Tip.classList.toggle('show');
    });
}

function click_to_view_image() {
    const comment_inline = document.getElementsByClassName('comment_inline_img');
    if (!comment_inline.length) return;
    document.getElementsByClassName("comments-main")[0].addEventListener("click", function (e) {
        if (e.target.classList.contains("comment_inline_img")) {
            window.open(e.target.src);
        }
    })
}
click_to_view_image();


function original_emoji_click() {
    const emoji = document.getElementsByClassName('emoji-item');
    if (!emoji.length) return;
    document.querySelector(".menhera-container").addEventListener("click", function (e) {
        if (e.target.classList.contains("emoji-item")) {
            grin(e.target.innerText, "custom", "`", "` ");
        }
    })
}
original_emoji_click();

function scrollBar() {
    if (document.body.clientWidth > 860) {
        window.addEventListener("scroll", () => {
            let s = document.documentElement.scrollTop || document.body.scrollTop,
                a = document.documentElement.scrollHeight || document.body.scrollHeight,
                b = window.innerHeight, c,
                result = parseInt(s / (a - b) * 100),
                cached = document.getElementById('bar');
            cached.style.width = result + "%";
            switch (true) {
                case (result <= 19): c = '#cccccc'; break;
                case (result <= 39): c = '#50bcb6'; break;
                case (result <= 59): c = '#85c440'; break;
                case (result <= 79): c = '#f2b63c'; break;
                case (result <= 99): c = '#FF0000'; break;
                case (result == 100): c = '#5aaadb'; break;
                default: c = "orange";
            }
            cached.style.background = c;
            let f = document.querySelector(".toc-container"),
                sc = document.querySelector(".site-content"),
                skinMenu = document.querySelector(".skin-menu");
            if (f && sc) {
                f.style.height = sc.getBoundingClientRect(outerHeight)["height"] + "px";
            }
            skinMenu && skinMenu.classList.remove("show");
        })
    }
}

function checkSkinSecter() {
    if (mashiro_global.variables.skinSecter === false) {
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
import { checkDarkModeCookie, ifDarkmodeShouldOn, turnOnDarkMode, turnOffDarkMode, isInDarkMode } from './darkmode'
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
function changeCoverBG() {
    const centerbg = document.querySelector(".centerbg")
    if (centerbg) {
        const type_mobile = document.body.clientWidth < 860 && mashiro_option.random_graphs_mts == true
        const cover_api = new URL(mashiro_option.cover_api)
        if (type_mobile) cover_api.searchParams.set('type', 'mobile')
        centerbg.style.backgroundImage = "url(" + cover_api.toString() + ")";
    }
}
ready(function () {
    changeCoverBG();
    let checkskin_bg = (a) => a == "none" ? "" : a;
    function changeBG() {
        const cached = document.querySelectorAll(".menu-list li");
        cached.forEach(e => {
            e.addEventListener("click", function () {
                const tagid = this.id;
                mashiro_global.variables.skinSecter = tagid == "white-bg" || tagid == "dark-bg";
                checkSkinSecter();
                if (tagid == "dark-bg") {
                    /* document.documentElement.style.background = "#333333";
                    document.getElementsByClassName("site-content")[0].style.backgroundColor = "#333333";
                    document.body.classList.add("dark");
                    setCookie("dark", "1", 0.33); */
                    turnOnDarkMode(true)
                } else if (tagid == "white-bg") {
                    turnOffDarkMode(true)
                } else {
                    document.documentElement.style.background = "unset";
                    document.getElementsByClassName("site-content")[0].style.backgroundColor = "rgba(255, 255, 255, .8)";
                    document.body.classList.remove("dark");
                    setCookie("dark", "0", 0.33);
                    setCookie("bgImgSetting", tagid, 30);
                    let temp;
                    switch (tagid) {
                        /* case "white-bg":
                            temp = mashiro_option.skin_bg0;
                            document.body.classList.remove("dynamic");
                            break; */
                        case "diy1-bg":
                            temp = mashiro_option.skin_bg1;
                            break;
                        case "diy2-bg":
                            temp = mashiro_option.skin_bg2;
                            break;
                        case "diy3-bg":
                            temp = mashiro_option.skin_bg3;
                            break;
                        case "diy4-bg":
                            temp = mashiro_option.skin_bg4;
                            break;
                    }
                    document.body.style.backgroundImage = `url(${temp})`;
                }
                closeSkinMenu();
            });
        });
    }
    changeBG();
    function checkBgImgCookie() {
        const bgurl = getCookie("bgImgSetting");
        if (!bgurl || bgurl === 'white-bg') {
            return
        } else {
            document.getElementById(bgurl).click();
        }
    }
    checkBgImgCookie()
    if (!getCookie("darkcache") && ifDarkmodeShouldOn) {
        removeCookie("dark");
        setCookie("darkcache", "cached", 0.4);
    }
    setTimeout(function () {
        checkDarkModeCookie();
    }, 100);

    function closeSkinMenu() {
        document.querySelector(".skin-menu").classList.remove("show");
        setTimeout(function () {
            if (document.querySelector(".changeSkin-gear") != null) {
                document.querySelector(".changeSkin-gear").style.visibility = "visible";
            }
        }, 300);
    }
    let changskin = document.querySelector("#changskin"),
        close_SkinMenu = document.querySelector(".skin-menu #close-skinMenu");
    changskin && changskin.addEventListener("click", function () {
        document.querySelector(".skin-menu").classList.toggle("show");
    })
    close_SkinMenu && close_SkinMenu.addEventListener("click", function () {
        closeSkinMenu();
    })
    add_upload_tips();
});
let bgn = 1;
function setBG() {
    const cover_api_url = new URL(mashiro_option.cover_api)
    if (document.body.clientWidth < 860 && mashiro_option.random_graphs_mts == true) {
        cover_api_url.searchParams.set('type', 'mobile')
        document.querySelector(".centerbg").style.backgroundImage = "url(" + cover_api_url.toString() + "&" + bgn + ")";
    } else {
        document.querySelector(".centerbg").style.backgroundImage = "url(" + cover_api_url.toString() + (cover_api_url.search === '' ? "?" + bgn : '&' + bgn) + ")";
    }
}
function nextBG() {
    setBG()
    bgn++;
}

function preBG() {
    bgn--;
    setBG()
}
function bgButtonAddListener() {
    const next = document.getElementById("bg-next"),
        pre = document.getElementById("bg-pre");
    if (next) { next.onclick = () => { nextBG() } };
    if (pre) { pre.onclick = () => { preBG() } };
}
ready(bgButtonAddListener);

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
                slideToogle(e.target.nextElementSibling, 500);
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
                slideToogle(al_post_list[i], 500, 'hide', function () {
                    slideToogle(al_post_list_f, 500, 'show');
                })
            }
            archives.addEventListener("click", function (e) {
                if (e.target.classList.contains("al_mon")) {
                    slideToogle(e.target.nextElementSibling, 500);
                    e.preventDefault();
                }
            })
            if (document.body.clientWidth > 860) {
                for (let i = 0; i < al_post_list.length; i++) {
                    let el = al_post_list[i];
                    el.parentNode.addEventListener('mouseover', function () {
                        slideToogle(el, 500, 'show');
                        return false;
                    })
                }
                if (false) {
                    for (let i = 0; i < al_post_list.length; i++) {
                        let el = al_post_list[i];
                        el.parentNode.addEventListener('mouseover', function () {
                            slideToogle(el, 500, 'hide');
                            return false;
                        })
                    }
                }
                let al_expand_collapse_click = 0;
                al_expand_collapse.addEventListener('click', function () {
                    if (al_expand_collapse_click == 0) {
                        for (let i = 0; i < al_post_list.length; i++) {
                            let el = al_post_list[i];
                            slideToogle(el, 500, 'show');
                        };
                        al_expand_collapse_click++;
                    } else if (al_expand_collapse_click == 1) {
                        for (let i = 0; i < al_post_list.length; i++) {
                            let el = al_post_list[i];
                            slideToogle(el, 500, 'hide');
                        };
                        al_expand_collapse_click--;
                    }
                });
            }
        })();
    }
}

timeSeriesReload();

function loadHls() {
    const video = document.getElementById('coverVideo'),
        video_src = document.getElementById("coverVideo").getAttribute("data-src");
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(video_src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = video_src;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    }
}
/* function loadJS(url, callback) {
    let script = document.createElement("script"),
        fn = callback || function () { };
    script.type = "text/javascript";
    script.onload = function () {
        fn();
    };
    script.src = url;
    document.head.appendChild(script);
} */

function coverVideoIni() {
    let video = document.getElementsByTagName('video')[0];
    if (video && video.classList.contains('hls')) {
        if (mashiro_global.variables.has_hls) {
            loadHls();
        } else {
            /*             //不保证可用 需测试
                        loadJS("https://cdn.jsdelivr.net/gh/mashirozx/Sakura@3.3.3/cdn/js/src/16.hls.js", function () {
                            loadHls();
                            mashiro_global.variables.has_hls = true;
                        }) */
            import('hls.js')
                .then(hls => {
                    //export to GLOBAL
                    window.Hls = hls.default
                    loadHls();
                    mashiro_global.variables.has_hls = true;
                })
                .catch(reason => console.warn('Hls load failed: ', reason))
        }
    }
}

function copy_code_block() {
    const ele = document.querySelectorAll("pre code");
    for (let j = 0; j < ele.length; j++) {
        ele[j].setAttribute('id', 'code-block-' + j);
        ele[j].insertAdjacentHTML('afterend', '<a class="copy-code" href="javascript:" data-clipboard-target="#code-block-' + j + '" title="拷贝代码"><i class="fa fa-clipboard" aria-hidden="true"></i>');
    };
    import('clipboard').then(({ default: ClipboardJS }) => {
        new ClipboardJS('.copy-code');
    })
}


function tableOfContentScroll(flag) {
    if (document.body.clientWidth <= 1200) {
        return;
    } else if (!document.querySelector("div.have-toc") && !document.querySelector("div.has-toc")) {
        let ele = document.getElementsByClassName("toc-container")[0];
        if (ele) {
            ele.remove();
            ele = null;
        }
    } else {
        if (flag) {
            let id = 1,
                heading_fix = mashiro_option.entry_content_theme == "sakura" ? (document.querySelector("article.type-post") ? (document.querySelector("div.pattern-attachment-img") ? -75 : 200) : 375) : window.innerHeight / 2;
            let _els = document.querySelectorAll('.entry-content,.links');
            for (let i = 0; i < _els.length; i++) {
                let _el = _els[i].querySelectorAll('h1,h2,h3,h4,h5');
                for (let j = 0; j < _el.length; j++) {
                    _el[j].id = "toc-head-" + id;
                    id++;
                }
            }
            import('tocbot').then(({ default: tocbot }) => {
                tocbot.init({
                    tocSelector: '.toc',
                    contentSelector: ['.entry-content', '.links'],
                    headingSelector: 'h1, h2, h3, h4, h5',
                    headingsOffset: heading_fix - window.innerHeight / 2,
                });
            })
        }
    }
}
tableOfContentScroll(true);
const pjaxInit = function () {
    add_upload_tips();
    no_right_click();
    click_to_view_image();
    original_emoji_click();
    mashiro_global.font_control.ini();
    let _p = document.getElementsByTagName("p");
    for (let i = 0; i < _p.length; i++) {
        _p[i].classList.remove("head-copyright");
    }
    try {
        code_highlight_style();
    } catch (e) {
        console.warn(e)
    };
    try {
        getqqinfo();
    } catch (e) {
        console.warn(e)
    };
    lazyload();
    let _div = document.getElementsByTagName("div"),
        tla = document.getElementById("to-load-aplayer");
    tla && tla.addEventListener("click", () => {
        try {
            reloadHermit();
        } catch (e) { };
        for (let i = 0; i < _div.length; i++) {
            _div[i].classList.remove("load-aplayer");
        }
    });
    for (let i = 0; i < _div.length; i++) {
        if (_div[i].classList.contains("aplayer")) {
            try {
                reloadHermit();
            } catch { };
        }
    }
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
    smileBoxToggle();
    timeSeriesReload();
    add_copyright();
    tableOfContentScroll(true);
}

function sm() {
    let sm = document.getElementsByClassName('sm'),
        cm = document.querySelector(".comments-main");
    if (!sm.length) return;
    if (Poi.reply_link_version == 'new') {
        if (cm) cm.addEventListener("click", function (e) {
            if (e.target.classList.contains("comment-reply-link")) {
                e.preventDefault();
                e.stopPropagation();
                let data_commentid = e.target.getAttribute("data-commentid");
                addComment.moveForm("comment-" + data_commentid, data_commentid, "respond", this.getAttribute("data-postid"));
            }
        })
    }
    cm && cm.addEventListener("click", (e) => {
        let list = e.target.parentNode;
        if (list.classList.contains("sm")) {
            let msg = "您真的要设为私密吗？";
            if (confirm(msg) == true) {
                if (list.classList.contains('private_now')) {
                    alert('您之前已设过私密评论');
                    return false;
                } else {
                    list.classList.add('private_now');
                    let idp = list.getAttribute("data-idp"),
                        actionp = list.getAttribute("data-actionp"),
                        rateHolderp = list.getElementsByClassName('has_set_private')[0];
                    let ajax_data = "action=siren_private&p_id=" + idp + "&p_action=" + actionp;
                    let request = new XMLHttpRequest();
                    request.onreadystatechange = function () {
                        if (this.readyState == 4 && this.status == 200) {
                            rateHolderp.innerHTML = request.responseText;
                        }
                    };
                    request.open('POST', '/wp-admin/admin-ajax.php', true);
                    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                    request.send(ajax_data);
                    return false;
                }
            } else {
                alert("已取消");
            }
        }
    })
}

let comt = document.getElementsByClassName("comt-addsmilies");
if (comt.length > 0) {
    Array.from(comt, (e) => {
        e.addEventListener("click", () => {
            if (e.stlye.display == "block") {
                e.style.display = "none";
            } else {
                e.style.display = "block";
            }
        })
    })
}
let comta = document.querySelectorAll(".comt-smilies a");
comta.forEach((e) => {
    e.addEventListener("click", () => {
        e.parentNode.style.display = "none";
    })
})
function smileBoxToggle() {
    let et = document.getElementById("emotion-toggle");
    et && et.addEventListener('click', function () {
        document.querySelector('.emotion-toggle-off').classList.toggle("emotion-hide");
        document.querySelector('.emotion-toggle-on').classList.toggle("emotion-show");
        document.querySelector('.emotion-box').classList.toggle("emotion-box-show");
    })
}
smileBoxToggle();

function grin(tag, type, before, after) {
    let myField;
    switch (type) {
        case "custom": tag = before + tag + after; break;
        case "Img": tag = '[img]' + tag + '[/img]'; break;
        case "Math": tag = ' {{' + tag + '}} '; break;
        case "tieba": tag = ' ::' + tag + ':: '; break;
        default: tag = ' :' + tag + ': ';
    }
    if (document.getElementById('comment') && document.getElementById('comment').type == 'textarea') {
        myField = document.getElementById('comment');
    } else {
        return false;
    }
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = tag;
        myField.focus();
    } else if (myField.selectionStart || myField.selectionStart == '0') {
        let startPos = myField.selectionStart,
            endPos = myField.selectionEnd,
            cursorPos = endPos;
        myField.value = myField.value.substring(0, startPos) + tag + myField.value.substring(endPos, myField.value.length);
        cursorPos += tag.length;
        myField.focus();
        myField.selectionStart = cursorPos;
        myField.selectionEnd = cursorPos;
    } else {
        myField.value += tag;
        myField.focus();
    }
}
add_copyright()
ready(() => {
    getqqinfo();
});

if (mashiro_option.float_player_on) {
    if (document.body.clientWidth > 860) {
        import('./AplayerInit').then(({ aplayerInit }) => aplayerInit())
        /* const { aplayerInit } = require('./AplayerInit')
        aplayerInit() */
    }
}

function getqqinfo() {
    let is_get_by_qq = false;
    const author = document.querySelector("input#author"),
        qq = document.querySelector("input#qq"),
        email = document.querySelector("input#email"),
        url = document.querySelector("input#url"),
        qq_check = document.querySelector(".qq-check"),
        gravatar_check = document.querySelector(".gravatar-check"),
        user_avatar_img = document.querySelector("div.comment-user-avatar img");
    if (author == null) return;
    if (!getCookie('user_qq') && !getCookie('user_qq_email') && !getCookie('user_author')) {
        qq.value = author.value = email.value = url.value = "";
    }
    if (getCookie('user_avatar') && getCookie('user_qq') && getCookie('user_qq_email')) {
        user_avatar_img.setAttribute('src', getCookie('user_avatar'));
        author.value = getCookie('user_author');
        email.value = getCookie('user_qq') + '@qq.com';
        qq.value = getCookie('user_qq');
        if (mashiro_option.qzone_autocomplete) {
            url.value = 'https://user.qzone.qq.com/' + getCookie('user_qq');
        }
        if (qq.value) {
            qq_check.style.display = "block";
            gravatar_check.style.display = "none";
        }
    }
    let emailAddressFlag = email.value;
    //var emailAddressFlag = cached.filter('#email').val();
    author.addEventListener('blur', () => {
        // })
        //cached.filter('#author').on('blur', function () {
        let qq = author.value,
            $reg = /^[1-9]\d{4,9}$/;
        if ($reg.test(qq)) {
            fetch(buildAPI(mashiro_option.qq_api_url, { qq }))
                .then(async resp => {
                    const whileFailed = () => {
                        qq.value = '';
                        qq_check.style.display = 'none';
                        gravatar_check.style.display = 'block';
                        user_avatar_img.setAttribute('src', get_gravatar(email.value, 80));
                        setCookie('user_qq', '', 30);
                        setCookie('user_email', email.value, 30);
                        setCookie('user_avatar', get_gravatar(email.value, 80), 30);
                        /***/
                        /*         qq.value = email.value = url.value = "";
                                if (!qq.value) {
                                    qq_check.style.display = 'none';
                                    gravatar_check.style.display = 'block';
                                    setCookie('user_qq', '', 30);
                                    user_avatar_img.setAttribute('src', get_gravatar(email.value, 80));
                                    setCookie('user_avatar', get_gravatar(email.value, 80), 30);
                                } */
                    }
                    if (resp.ok) {
                        //success
                        try {
                            const data = JSON.parse(await resp.json())
                            author.value = data.name;
                            email.value = qq.trim() + '@qq.com';
                            if (mashiro_option.qzone_autocomplete) {
                                url.value = 'https://user.qzone.qq.com/' + qq.trim();
                            }
                            user_avatar_img.setAttribute('src', 'https://q2.qlogo.cn/headimg_dl?dst_uin=' + qq + '&spec=100');
                            is_get_by_qq = true;
                            qq.value = qq.trim();
                            if (qq.value) {
                                qq_check.style.display = 'block';
                                gravatar_check.style.display = 'none';
                            }
                            setCookie('user_author', data.name, 30);
                            setCookie('user_qq', qq, 30);
                            setCookie('is_user_qq', 'yes', 30);
                            setCookie('user_qq_email', qq + '@qq.com', 30);
                            setCookie('user_email', qq + '@qq.com', 30);
                            emailAddressFlag = email.value();
                            /***/
                            user_avatar_img.setAttribute('src', data.avatar);
                            setCookie('user_avatar', data.avatar, 30);
                        } catch (e) {
                            console.warn(e)
                            whileFailed()
                        }
                    } else {
                        whileFailed()
                    }
                })
        }
    });
    if (getCookie('user_avatar') && getCookie('user_email') && getCookie('is_user_qq') == 'no' && !getCookie('user_qq_email')) {
        user_avatar_img.setAttribute("src", getCookie('user_avatar'));
        email.value = getCookie('user_mail');
        qq.value = '';
        if (!qq.value) {
            qq_check.style.display = "none";
            gravatar_check.style.display = "block";
        }
        // $('div.comment-user-avatar img').attr('src', getCookie('user_avatar'));
        // cached.filter('#email').val(getCookie('user_email'));
        // cached.filter('#qq').val('');
        // if (!cached.filter('#qq').val()) {
        //     $('.qq-check').css('display', 'none');
        //     $('.gravatar-check').css('display', 'block');
        // }
    }
    email.addEventListener("blur", function () {
        //cached.filter('#email').on('blur', function () {
        let emailAddress = email.value;
        // var emailAddress = cached.filter('#email').val();
        if ((is_get_by_qq == false || emailAddressFlag != emailAddress) && emailAddress != '') {
            user_avatar_img.setAttribute("src", get_gravatar(emailAddress, 80));
            //$('div.comment-user-avatar img').attr('src', get_gravatar(emailAddress, 80));
            setCookie('user_avatar', get_gravatar(emailAddress, 80), 30);
            setCookie('user_email', emailAddress, 30);
            setCookie('user_qq_email', '', 30);
            setCookie('is_user_qq', 'no', 30);
            qq.value = '';
            // cached.filter('#qq').val('');
            if (!qq.value) {
                qq_check.style.display = "none";
                gravatar_check.style.display = "block";
                // $('.qq-check').css('display', 'none');
                // $('.gravatar-check').css('display', 'block');
            }
        }
    });
    if (getCookie('user_url')) {
        url.value = getCookie("user_url");
        // cached.filter('#url').val(getCookie('user_url'));
    }
    url.addEventListener("blur", function () {
        //cached.filter('#url').on('blur', function () {
        let URL_Address = url.value;
        url.value = URL_Address;
        // var URL_Address = cached.filter('#url').val();
        // cached.filter('#url').val(URL_Address);
        setCookie('user_url', URL_Address, 30);
    });
    if (getCookie('user_author')) {
        author.value = getCookie('user_author');
        // cached.filter('#author').val(getCookie('user_author'));
    }
    author.addEventListener("blur", function () {
        // cached.filter('#author').on('blur', function () {
        let user_name = author.value;
        author.value = user_name;
        // var user_name = cached.filter('#author').val();
        // cached.filter('#author').val(user_name);
        setCookie('user_author', user_name, 30);
    });
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

function load_bangumi() {
    const sections = document.getElementsByTagName("section")
    let _flag = false;
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].classList.contains("bangumi")) {
            _flag = true;
            break
        }
    }
    if (_flag) {
        document.addEventListener('click', function (e) {
            const target = e.target;
            if (target === document.querySelector("#bangumi-pagination a")) {
                e.preventDefault();
                e.stopPropagation();
                target.classList.add("loading");
                target.textContent = "";
                const xhr = new XMLHttpRequest();
                xhr.open('POST', target.href + "&_wpnonce=" + Poi.nonce, true);
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4 && xhr.status == 200) {
                        let html = JSON.parse(xhr.responseText),
                            bfan = document.getElementById("bangumi-pagination"),
                            row = document.getElementsByClassName("row")[0];
                        bfan.remove();
                        row.insertAdjacentHTML('beforeend', html);
                    } else {
                        target.classList.remove("loading");
                        target.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ERROR ';
                    }
                };
                xhr.send();
            }
        });
    }
}


mashiro_global.ini.normalize();
loadCSS(mashiro_option.jsdelivr_css_src);
loadCSS(mashiro_option.entry_content_style_src);
loadCSS("https://at.alicdn.com/t/font_679578_qyt5qzzavdo39pb9.css");

import POWERMODE from 'activate-power-mode/src/index'
function article_attach() {
    //收缩、展开
    /* jQuery(document).ready(
    function(jQuery){
        jQuery('.collapseButton').click(function(){
        jQuery(this).parent().parent().find('.xContent').slideToggle('slow');
        });
        }) */
    const collapseButton = document.getElementsByClassName('collapseButton')
    if (collapseButton.length > 0) {
        for (const ele of collapseButton) {
            ele.addEventListener("click", (e) => {
                slideToogle(e.parentNode.parentNode.querySelector(".xContent"));
                // e.parentNode.parentNode.querySelector(".xContent")
            })
        }
        // import('jquery').then(({ default: jQuery }) => {
        //     jQuery('.collapseButton').on("click", function () {
        //         jQuery(this).parent().parent().find('.xContent').slideToggle('slow');
        //     })
        // })
    }
    //init lightbox
    if (mashiro_option.baguetteBoxON) {
        loadCSS('https://cdn.jsdelivr.net/npm/baguettebox.js@1.11.1/dist/baguetteBox.min.css')
        import('baguettebox.js').then(({ default: baguetteBox }) => {
            baguetteBox.run('.entry-content', {
                captions: function (element) {
                    return element.getElementsByTagName('img')[0].alt;
                },
                ignoreClass: 'fancybox',
            });
        })
    } else if (mashiro_option.fancybox) {
        loadCSS('https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css')
        import('jquery').then((jQuery) => {
            window.jQuery = jQuery.default
            window.$ = jQuery.default
            import('@fancyapps/fancybox')
        })
    }
}
var // s = $('#bgvideo')[0],
    s = document.getElementById("bgvideo"),
    Siren = {
        MN: function () {
            let iconflat = document.querySelector(".iconflat");
            iconflat && iconflat.addEventListener("click", function () {
                document.body.classList.toggle("navOpen");
                document.getElementById("main-container").classList.toggle("open");
                document.getElementById("mo-nav").classList.toggle("open");
                document.querySelector(".openNav").classList.toggle("open");
            });
        },
        MNH: function () {
            if (document.body.classList.contains("navOpen")) {
                document.body.classList.toggle("navOpen");
                document.getElementById("main-container").classList.toggle("open");
                document.getElementById("mo-nav").classList.toggle("open");
                document.querySelector(".openNav").classList.toggle("open");
            }
        },
        splay: function () {
            let video_btn = document.getElementById("video-btn");
            if (video_btn) {
                video_btn.classList.add("video-pause");
                video_btn.classList.remove("video-play");
            }
            try {
                video_btn.style.display = "";
                document.querySelector(".video-stu").style.bottom = "-100px";
                document.querySelector(".focusinfo").style.top = "-999px";
            } catch { }
            try {
                for (let i = 0; i < ap.length; i++) {
                    try {
                        ap[i].destroy()
                    } catch { }
                }
            } catch { }
            try {
                hermitInit()
            } catch { }
            s.play();
        },
        spause: function () {
            let video_btn = document.getElementById("video-btn");
            if (video_btn) {
                video_btn.classList.add("video-play");
                video_btn.classList.remove("video-pause");
            }
            try {
                document.querySelector(".focusinfo").style.top = "49.3%";
            } catch { }
            s.pause();
        },
        liveplay: function () {
            if (s.oncanplay != undefined && document.querySelector(".haslive")) {
                if (document.querySelector(".videolive")) {
                    Siren.splay();
                }
            }
        },
        livepause: function () {
            if (s.oncanplay != undefined && document.querySelector(".haslive")) {
                Siren.spause();
                let video_stu = document.getElementsByClassName("video-stu")[0];
                video_stu.style.bottom = "0px";
                video_stu.innerHTML = "已暂停 ...";
            }
        },
        addsource: function () {
            let video_stu = document.getElementsByClassName("video-stu")[0];
            video_stu.innerHTML = "正在载入视频 ...";
            video_stu.style.bottom = "0px";
            let t = Poi.movies.name.split(","),
                _t = t[Math.floor(Math.random() * t.length)],
                bgvideo = document.getElementById("bgvideo");
            bgvideo.setAttribute("src", Poi.movies.url + '/' + _t + '.mp4');
            bgvideo.setAttribute("video-name", _t);
        },
        LV: function () {
            let video_btn = document.getElementById("video-btn");
            if (video_btn) video_btn.addEventListener("click", function () {
                if (this.classList.contains("loadvideo")) {
                    this.classList.add("video-pause");
                    this.classList.remove("loadvideo");
                    Siren.addsource();
                    s.oncanplay = function () {
                        Siren.splay();
                        document.getElementById("video-add").style.display = "block";
                        video_btn.classList.add("videolive", "haslive");
                    }
                } else {
                    if (this.classList.contains("video-pause")) {
                        Siren.spause();
                        video_btn.classList.remove("videolive");
                        document.getElementsByClassName("video-stu")[0].style.bottom = "0px";
                        document.getElementsByClassName("video-stu")[0].innerHTML = "已暂停 ...";
                    } else {
                        Siren.splay();
                        video_btn.classList.add("videolive");
                    }
                }
                s.onended = function () {
                    s.setAttribute("src", "");
                    document.getElementById("video-add").style.display = "none";
                    video_btn && video_btn.classList.add("loadvideo");
                    video_btn && video_btn.classList.remove("video-pause", "videolive", "haslive");
                    document.querySelector(".focusinfo").style.top = "49.3%";
                }
            });
            const video_add = document.getElementById("video-add")
            if (video_add) video_add.addEventListener("click", function () {
                Siren.addsource();
            });
        },
        AH: function () {
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
        },
        PE: function () {
            if (document.querySelector(".headertop")) {
                let headertop = document.querySelector(".headertop"),
                    blank = document.querySelector(".blank");
                if (document.querySelector(".main-title")) {
                    try {
                        blank.style.paddingTop = "0px";
                    } catch (e) { }
                    headertop.style.height = "auto";
                    headertop.style.display = "";
                    if (Poi.movies.live == 'open') Siren.liveplay();
                } else {
                    try {
                        blank.style.paddingTop = "75px";
                    } catch (e) { }
                    headertop.style.height = "0px";
                    headertop.style.display = "none";
                    Siren.livepause();
                }
            }
        },
        CE: function () {
            let comments_hidden = document.querySelector(".comments-hidden");
            let comments_main = document.querySelector(".comments-main");
            if (comments_hidden != null) {
                comments_hidden.style.display = "block";
                comments_main.style.display = "none";
                comments_hidden.addEventListener("click", function () {
                    slideToogle(comments_main, 500, 'show');
                    comments_hidden.style.display = "none";
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
                        slideToogle(e.target.nextElementSibling, 300);
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
            article_attach()
            const callback = function () {
                //$('.js-toggle-search').toggleClass('is-active');
                document.getElementsByClassName('js-toggle-search')[0].classList.toggle('is-active')
                //$('.js-search').toggleClass('is-visible');
                document.getElementsByClassName('js-search')[0].classList.toggle('is-visible')
                //$('html').css('overflow-y', 'hidden');
                document.documentElement.style.overflowY = 'hidden'
                if (mashiro_option.live_search) {
                    var QueryStorage = [];
                    search_a(buildAPI(Poi.api + "sakura/v1/cache_search/json"));

                    var otxt = document.getElementById("search-input"),
                        list = document.getElementById("PostlistBox"),
                        Record = list.innerHTML,
                        searchFlag = null;
                    otxt.oninput = function () {
                        if (searchFlag == null) {
                            clearTimeout(searchFlag);
                        }
                        searchFlag = setTimeout(function () {
                            query(QueryStorage, otxt.value, Record);
                            div_href();
                        }, 250);
                    };

                    function search_a(val) {
                        if (sessionStorage.getItem('search') != null) {
                            QueryStorage = JSON.parse(sessionStorage.getItem('search'));
                            query(QueryStorage, document.getElementById("search-input").value, Record);
                            div_href();
                        } else {
                            var _xhr = new XMLHttpRequest();
                            _xhr.open("GET", val, true)
                            _xhr.send();
                            _xhr.onreadystatechange = function () {
                                if (_xhr.readyState == 4 && _xhr.status == 200) {
                                    json = _xhr.responseText;
                                    if (json != "") {
                                        sessionStorage.setItem('search', json);
                                        QueryStorage = JSON.parse(json);
                                        query(QueryStorage, otxt.value, Record);
                                        div_href();
                                    }
                                }
                            }
                        }
                    }
                    if (!Object.values) Object.values = function (obj) {
                        if (obj !== Object(obj))
                            throw new TypeError('Object.values called on a non-object');
                        var val = [],
                            key;
                        for (key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                                val.push(obj[key]);
                            }
                        }
                        return val;
                    }

                    function Cx(arr, q) {
                        q = q.replace(q, "^(?=.*?" + q + ").+$").replace(/\s/g, ")(?=.*?");
                        i = arr.filter(
                            v => Object.values(v).some(
                                v => new RegExp(q + '').test(v)
                            )
                        );
                        return i;
                    }

                    function div_href() {
                        const search_close = document.querySelector(".search_close")
                        const Ty = document.getElementById('Ty')
                        for (const ele of document.getElementsByClassName('ins-selectable')) {
                            ele.addEventListener("click", () => {
                                Ty.href = ele.getAttribute('href')
                                Ty.click()
                                search_close.click()
                            });
                        }
                        /* $(".ins-selectable").each(function () {
                            $(this).click(function () {
                                $("#Ty").attr('href', $(this).attr('href'));
                                $("#Ty").click();
                                $(".search_close").click();
                            });
                        }); */
                    }

                    function search_result(keyword, link, fa, title, iconfont, comments, text) {
                        if (keyword) {
                            var s = keyword.trim().split(" "),
                                a = title.indexOf(s[s.length - 1]),
                                b = text.indexOf(s[s.length - 1]);
                            title = a < 60 ? title.slice(0, 80) : title.slice(a - 30, a + 30);
                            title = title.replace(s[s.length - 1], '<mark class="search-keyword"> ' + s[s.length - 1].toUpperCase() + ' </mark>');
                            text = b < 60 ? text.slice(0, 80) : text.slice(b - 30, b + 30);
                            text = text.replace(s[s.length - 1], '<mark class="search-keyword"> ' + s[s.length - 1].toUpperCase() + ' </mark>');
                        }
                        return '<div class="ins-selectable ins-search-item" href="' + link + '"><header><i class="fa fa-' + fa + '" aria-hidden="true"></i>' + title + '<i class="iconfont icon-' + iconfont + '"> ' + comments + '</i>' + '</header><p class="ins-search-preview">' + text + '</p></div>';
                    }

                    function query(B, A, z) {
                        var x, v, s, y = "",
                            w = "",
                            u = "",
                            r = "",
                            p = "",
                            F = "",
                            H = "",
                            G = '<section class="ins-section"><header class="ins-section-header">',
                            D = "</section>",
                            E = "</header>",
                            C = Cx(B, A.trim());
                        for (x = 0; x < Object.keys(C).length; x++) {
                            H = C[x];
                            switch (v = H.type) {
                                case "post":
                                    w = w + search_result(A, H.link, "file", H.title, "mark", H.comments, H.text);
                                    break;
                                case "tag":
                                    p = p + search_result("", H.link, "tag", H.title, "none", "", "");
                                    break;
                                case "category":
                                    r = r + search_result("", H.link, "folder", H.title, "none", "", "");
                                    break;
                                case "page":
                                    u = u + search_result(A, H.link, "file", H.title, "mark", H.comments, H.text);
                                    break;
                                case "comment":
                                    F = F + search_result(A, H.link, "comment", H.title, "none", "", H.text);
                                    break
                            }
                        }
                        w && (y = y + G + "文章" + E + w + D), u && (y = y + G + "页面" + E + u + D), r && (y = y + G + "分类" + E + r + D), p && (y = y + G + "标签" + E + p + D), F && (y = y + G + "评论" + E + F + D), s = document.getElementById("PostlistBox"), s.innerHTML = y
                    }
                }
            }
            for (const ele of document.getElementsByClassName('js-toggle-search')) {
                ele.addEventListener('click', callback);
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
        },
        NH: function () {
            let h1 = 0;
            window.addEventListener("scroll", () => {
                let s = document.documentElement.scrollTop || window.pageYOffset,
                    cached = document.querySelector(".site-header");
                if (s == h1) {
                    cached.classList.remove("yya");
                }
                if (s > h1) {
                    cached.classList.add("yya");
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
        },
        XLS: function () {
            let load_post_timer;
            const intersectionObserver = new IntersectionObserver(function (entries) {
                if (entries[0].intersectionRatio <= 0) return;
                // var page_next = $('#pagination a').attr("href");
                const _page_next = document.querySelector('#pagination a')
                if (_page_next) {
                    const page_next = _page_next.getAttribute("href"),
                        load_key = document.getElementById("add_post_time");
                    if (page_next != undefined && load_key) {
                        const load_time = document.getElementById("add_post_time").title;
                        if (load_time != "233") {
                            console.log("%c 自动加载时倒计时 %c", "background:#9a9da2; color:#ffffff; border-radius:4px;", "", "", load_time);
                            load_post_timer = setTimeout(function () {
                                load_post();
                            }, load_time * 1000);
                        }
                    }
                }
            });
            intersectionObserver.observe(
                document.querySelector('.footer-device')
            );
            document.body.addEventListener("click", function (e) {
                if (e.target == document.querySelector("#pagination a")) {
                    e.preventDefault();
                    e.stopPropagation();
                    clearTimeout(load_post_timer);
                    load_post();
                }
            })

            function load_post() {
                const pagination_a = document.querySelector('#pagination a');
                pagination_a.classList.add("loading");
                pagination_a.innerText = "";
                // $('#pagination a').addClass("loading").text("");
                fetch(pagination_a.getAttribute("href") + "#main").then(resp => resp.text()).then(text => {
                    const parser = new DOMParser(),
                        DOM = parser.parseFromString(text, "text/html"),
                        result = DOM.querySelectorAll("#main .post"),
                        paga = DOM.querySelector("#pagination a"),
                        nextHref = paga && paga.getAttribute("href");
                    for (let i = 0; i < result.length; i++) {
                        let b = result[i];
                        document.getElementById("main").insertAdjacentHTML('beforeend', b.outerHTML);
                    }
                    if (Poi.pjax) Pjax.refresh(document.querySelector("#content"));
                    //if (resp.ok) {
                    // result = $(data).find("#main .post");
                    // nextHref = $(data).find("#pagination a").attr("href");
                    // $("#main").append(result.fadeIn(500));
                    const dpga = document.querySelector("#pagination a"),
                        addps = document.querySelector("#add_post span");
                    if (dpga) {
                        dpga.classList.remove("loading");
                        dpga.innerText = "Previous";
                    }
                    if (addps) {
                        addps.classList.remove("loading");
                        addps.innerText = "";
                    }
                    // $("#pagination a").removeClass("loading").text("Previous");
                    // $('#add_post span').removeClass("loading").text("");
                    lazyload();
                    post_list_show_animation();
                    if (nextHref != undefined) {
                        pagination_a.setAttribute("href", nextHref);
                        // $("#pagination a").attr("href", nextHref);
                        //加载完成上滑
                        let tempScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;;
                        // window.scrollTo(tempScrollTop);
                        // $(window).scrollTop(tempScrollTop);
                        window.scrollTo({
                            top: tempScrollTop + 300,
                            behavior: 'smooth'
                        })
                        // $body.animate({
                        //     scrollTop: tempScrollTop + 300
                        //
                        // }, 666)
                    } else {
                        document.getElementById("pagination").innerHTML = "<span>很高兴你翻到这里，但是真的没有了...</span>";
                        // $("#pagination").html("<span>很高兴你翻到这里，但是真的没有了...</span>");
                    }
                    //}

                })
                /*  $.ajax({
                     type: "POST",
                     url: $('#pagination a').attr("href") + "#main",
                     success: function (data) {
                         result = $(data).find("#main .post");
                         nextHref = $(data).find("#pagination a").attr("href");
                         $("#main").append(result.fadeIn(500));
                         $("#pagination a").removeClass("loading").text("Previous");
                         $('#add_post span').removeClass("loading").text("");
                         lazyload();
                         post_list_show_animation();
                         if (nextHref != undefined) {
                             $("#pagination a").attr("href", nextHref);
                             //加载完成上滑
                             var tempScrollTop = $(window).scrollTop();
                             $(window).scrollTop(tempScrollTop);
                             $body.animate({
                                 scrollTop: tempScrollTop + 300
 
                             }, 666)
                         } else {
                             $("#pagination").html("<span>很高兴你翻到这里，但是真的没有了...</span>");
                         }
                     }
                 }); */
                return false;
            }
        },
        XCS: function () {
            const __list = 'commentwrap';
            const form = document.getElementById("commentform")
            if (form) form.addEventListener('submit', function () {
                addComment.createButterbar("提交中(Commiting)....")
                const form = new FormData(this)
                form.append('action', 'ajax_comment')
                fetch(Poi.ajaxurl, {
                    method: this.attributes.method.value,
                    body: form
                }).then(async resp => {
                    const data = await resp.text()
                    if (resp.ok) {
                        Array.from(document.getElementsByTagName('textarea'))
                            .forEach((e) => e.value = '')
                        const cancel = document.getElementById('cancel-comment-reply-link'),
                            temp = document.getElementById('wp-temp-form-div'),
                            respond = document.getElementById(addComment.respondId),
                            //post = document.getElementById('comment_post_ID').value,
                            parent = document.getElementById('comment_parent').value;
                        if (parent != '0') {
                            //jQuery('#respond').before('<ol class="children">' + data + '</ol>');
                            document.getElementById("respond").insertAdjacentHTML('beforebegin', '<ol class="children">' + data + '</ol>');
                        } else if (!document.getElementsByClassName(__list).length) {
                            if (Poi.formpostion == 'bottom') {
                                document.getElementById("respond").insertAdjacentHTML('beforebegin', '<ol class="' + __list + '">' + data + '</ol>');
                                //jQuery('#respond').before('<ol class="' + __list + '">' + data + '</ol>');
                            } else {
                                document.getElementById("respond").insertAdjacentHTML('afterend', '<ol class="' + __list + '">' + data + '</ol>');
                                //jQuery('#respond').after('<ol class="' + __list + '">' + data + '</ol>');
                            }
                        } else {
                            if (Poi.order == 'asc') {
                                document.getElementsByClassName("commentwrap")[1].insertAdjacentHTML('beforeend', data);
                                //jQuery('.' + __list).append(data);
                            } else {
                                document.getElementsByClassName("commentwrap")[1].insertAdjacentHTML('afterbegin', data);
                                //jQuery('.' + __list).prepend(data);
                            }
                        }
                        addComment.createButterbar("提交成功(Succeed)");
                        lazyload();
                        code_highlight_style();
                        click_to_view_image();
                        clean_upload_images();
                        cancel.style.display = 'none';
                        cancel.onclick = null;
                        document.getElementById('comment_parent').value = '0';
                        if (temp && respond) {
                            temp.parentNode.insertBefore(respond, temp);
                            temp.remove();
                            //temp.parentNode.removeChild(temp)
                        }
                    } else {
                        addComment.createButterbar(data ?? 'HTTP' + resp.status + ':' + resp.statusText);
                    }
                }).catch(reason => {
                    addComment.createButterbar(reason);
                })
                /* jQuery.ajax({
                    url: Poi.ajaxurl,
                    data: jQuery(this).serialize() + "&action=ajax_comment",
                    type: jQuery(this).attr('method'),
                    beforeSend: addComment.createButterbar("提交中(Commiting)...."),
                    error: function (request) {
                        var t = addComment;
                        t.createButterbar(request.responseText);
                    },
                    success: function (data) {
                        jQuery('textarea').each(function () {
                            this.value = ''
                        });
                        var t = addComment,
                            cancel = t.I('cancel-comment-reply-link'),
                            temp = t.I('wp-temp-form-div'),
                            respond = t.I(t.respondId),
                            post = t.I('comment_post_ID').value,
                            parent = t.I('comment_parent').value;
                        if (parent != '0') {
                            jQuery('#respond').before('<ol class="children">' + data + '</ol>');
                        } else if (!jQuery('.' + __list).length) {
                            if (Poi.formpostion == 'bottom') {
                                jQuery('#respond').before('<ol class="' + __list + '">' + data + '</ol>');
                            } else {
                                jQuery('#respond').after('<ol class="' + __list + '">' + data + '</ol>');
                            }
                        } else {
                            if (Poi.order == 'asc') {
                                jQuery('.' + __list).append(data);
                            } else {
                                jQuery('.' + __list).prepend(data);
                            }
                        }
                        t.createButterbar("提交成功(Succeed)");
                        lazyload();
                        code_highlight_style();
                        click_to_view_image();
                        clean_upload_images();
                        cancel.style.display = 'none';
                        cancel.onclick = null;
                        t.I('comment_parent').value = '0';
                        if (temp && respond) {
                            temp.parentNode.insertBefore(respond, temp);
                            temp.remove();
                            //temp.parentNode.removeChild(temp)
                        }
                    }
                }); */
                return false;
            })
            window.addComment = require('./AddComment').default
        },
        XCP: function () {
            document.body.addEventListener('click', function (e) {
                if (e.target.parentNode == document.getElementById("comments-navi") && e.target.nodeName.toLowerCase() == "a") {
                    e.preventDefault();
                    e.stopPropagation();
                    let _this = e.target,
                        path = _this.pathname,
                        _xhr = new XMLHttpRequest();
                    _xhr.open("GET", _this.getAttribute('href'), true);
                    _xhr.responseType = "document";
                    _xhr.onloadstart = () => {
                        let comments_navi = document.getElementById("comments-navi"),
                            commentwrap = document.querySelector("ul.commentwrap"),
                            loading_comments = document.getElementById("loading-comments"),
                            comments_list = document.getElementById("comments-list-title");
                        comments_navi.remove();
                        commentwrap.remove();
                        //comments_navi.parentNode.removeChild(comments_navi);
                        //commentwrap.parentNode.removeChild(commentwrap);
                        loading_comments.style.display = "block";
                        slideToogle(loading_comments, 500, "show");
                        window.scrollTo({
                            top: comments_list.getBoundingClientRect().top + window.pageYOffset - comments_list.clientTop - 65,
                            behavior: "smooth"
                        });
                    }
                    _xhr.onreadystatechange = function () {
                        if (_xhr.readyState == 4 && _xhr.status == 200) {
                            let json = _xhr.response,
                                result = json.querySelector("ul.commentwrap"),
                                nextlink = json.getElementById("comments-navi"),
                                loading_comments = document.getElementById("loading-comments");
                            slideToogle(loading_comments, 200, "hide");
                            document.getElementById("loading-comments").insertAdjacentHTML('afterend', result.outerHTML);
                            document.querySelector("ul.commentwrap").insertAdjacentHTML('afterend', nextlink.outerHTML);
                            lazyload();
                            if (window.gtag) {
                                gtag('config', Poi.google_analytics_id, {
                                    'page_path': path
                                });
                            }
                            code_highlight_style();
                            click_to_view_image();
                            let commentwrap = document.querySelector("ul.commentwrap");
                            window.scrollTo({
                                top: commentwrap && (commentwrap.getBoundingClientRect().top + window.pageYOffset - commentwrap.clientTop - 200),
                                behavior: "smooth"
                            });
                        }
                    }
                    _xhr.send();
                }
            });
        },
        IA: function () {
            POWERMODE.colorful = true;
            POWERMODE.shake = false;
            document.body.addEventListener('input', POWERMODE)
        },
        GT: function () {
            let mb_to_top = document.querySelector("#moblieGoTop"),
                changskin = document.querySelector("#changskin");
            window.addEventListener("scroll", () => {
                let scroll = document.documentElement.scrollTop || document.body.scrollTop;
                if (scroll > 20) {
                    mb_to_top.style.transform = "scale(1)";
                    changskin.style.transform = "scale(1)";
                } else {
                    mb_to_top.style.transform = "scale(0)";
                    changskin.style.transform = "scale(0)";
                }
            })
            mb_to_top.onclick = function () {
                topFunction();
            }
        }
    }
if (Poi.pjax) {
    //NProgess CSS?
    const NProgress = require('nprogress')
    const Pjax = require('pjax');
    new Pjax({
        selectors: ["#page", "title", ".footer-device"],
        elements: [
            "a:not([target='_top']):not(.comment-reply-link):not(#pagination a):not(#comments-navi a):not(.user-menu-option a):not(.header-user-avatar a):not(.emoji-item)",
            ".search-form",
            ".s-search",
        ],
        timeout: 8000,
        history: true,
        cacheBust: false,
    });
    document.addEventListener("pjax:send", () => {
        for (const element of document.getElementsByClassName("normal-cover-video")) {
            element.pause();
            element.src = '';
            element.load = '';
        }
        document.getElementById("bar").style.width = "0%";
        if (mashiro_option.NProgressON) NProgress.start();
        Siren.MNH();
    });
    document.addEventListener("pjax:complete", function () {
        Siren.AH();
        Siren.PE();
        Siren.CE();
        //Siren.XLS();
        if (mashiro_option.NProgressON) NProgress.done();
        mashiro_global.ini.pjax();
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
    });
    document.addEventListener("pjax:success", function () {
        if (window.gtag) {
            gtag('config', Poi.google_analytics_id, {
                'page_path': window.location.pathname
            });
        }
    });
    window.addEventListener('popstate', function (e) {
        Siren.AH();
        Siren.PE();
        Siren.CE();
        sm();
        timeSeriesReload(true);
        post_list_show_animation();
    }, false);
}
ready(function () {
    Siren.AH();
    Siren.PE();
    Siren.NH();
    Siren.GT();
    Siren.XLS();
    Siren.XCS();
    Siren.XCP();
    Siren.CE();
    Siren.MN();
    Siren.IA();
    Siren.LV();
    console.log("%c Mashiro %c", "background:#24272A; color:#ffffff", "", "https://2heng.xin/");
    console.log("%c Github %c", "background:#24272A; color:#ffffff", "", "https://github.com/mashirozx");
});
let isWebkit = navigator.userAgent.toLowerCase().indexOf('webkit') > -1,
    isOpera = navigator.userAgent.toLowerCase().indexOf('opera') > -1,
    isIe = navigator.userAgent.toLowerCase().indexOf('msie') > -1;
if ((isWebkit || isOpera || isIe) && document.getElementById && window.addEventListener) {
    window.addEventListener('hashchange', function () {
        let id = location.hash.substring(1),
            element;
        if (!(/^[A-z0-9_-]+$/.test(id))) {
            return;
        }
        element = document.getElementById(id);
        if (element) {
            if (!(/^(?:a|select|input|button|textarea)$/i.test(element.tagName))) {
                element.tabIndex = -1;
            }
            element.focus();
        }
    }, false);
}

window.addEventListener('load', () => {
    const preload = document.getElementById("preload");
    if (!preload) return;
    document.documentElement.style.overflowY = 'unset';
    if (mashiro_option.preload_blur == 0) {
        preload.classList.add('hide');
        preload.classList.remove('show');
        setTimeout(() => preload.remove(), 233);
    } else {
        preload.animate(
            [
                { filter: "blur(0px)", backdropFilter: "blur(10px)", opacity: 1 },
                { backdropFilter: "blur(0px)grayscale(0)", opacity: 0.1 },
                { opacity: 0, filter: "blur(100px)", }
            ],
            { duration: mashiro_option.preload_blur, fill: "forwards", easing: "ease" }
        ).onfinish = () => {
            preload.remove()
        }
    }
})


function web_audio() {
    if (mashiro_option.audio) {
        ready(() => {
            window.AudioContext = window.AudioContext || window.webkitAudioContext,
                function () {
                    if (window.AudioContext) {
                        let e = new AudioContext,
                            t = "880 987 1046 987 1046 1318 987 659 659 880 784 880 1046 784 659 659 698 659 698 1046 659 1046 1046 1046 987 698 698 987 987 880 987 1046 987 1046 1318 987 659 659 880 784 880 1046 784 659 698 1046 987 1046 1174 1174 1174 1046 1046 880 987 784 880 1046 1174 1318 1174 1318 1567 1046 987 1046 1318 1318 1174 784 784 880 1046 987 1174 1046 784 784 1396 1318 1174 659 1318 1046 1318 1760 1567 1567 1318 1174 1046 1046 1174 1046 1174 1567 1318 1318 1760 1567 1318 1174 1046 1046 1174 1046 1174 987 880 880 987 880".split(" "),//天空之城
                            /*t = "329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 329.628 293.665 293.665 329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 293.665 261.626 261.626 293.665 293.665 329.628 261.626 293.665 329.628 349.228 329.628 261.626 293.665 329.628 349.228 329.628 293.665 261.626 293.665 195.998 329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 293.665 261.626 261.626".split(" "),欢乐颂*/
                            i = 0,
                            o = 1, dom,
                            a = "♪ ♩ ♫ ♬ ♭ € § ¶ ♯".split(" "),
                            n = !1,
                            select = document.querySelectorAll(".site-title, #moblieGoTop, .site-branding, .searchbox, .changeSkin-gear, .menu-list li");
                        select.forEach((s) => {
                            s.addEventListener("mouseenter", (y) => {
                                if (dom) return;
                                let r = t[i]
                                r || (i = 0, r = t[i]), i += o
                                let c = e.createOscillator(),
                                    l = e.createGain();
                                if (c.connect(l), l.connect(e.destination), c.type = "sine", c.frequency.value = r, l.gain.setValueAtTime(0, e.currentTime), l.gain.linearRampToValueAtTime(1, e.currentTime + .01), c.start(e.currentTime), l.gain.exponentialRampToValueAtTime(.001, e.currentTime + 1), c.stop(e.currentTime + 1), n = !0) {
                                    let d = Math.round(7 * Math.random());
                                    dom = document.createElement("b");
                                    dom.textContent = a[d],
                                        h = y.pageX,
                                        p = y.pageY - 5;
                                    dom.style.zIndex = "99999";
                                    dom.style.top = p - 100 + "px";
                                    dom.style.left = h + "px";
                                    dom.style.position = "absolute";
                                    dom.style.color = "#FF6EB4";
                                    document.body.appendChild(dom);
                                    dom.animate([
                                        { top: p + "px" },
                                        { opacity: 0 }
                                    ], {
                                        duration: 500
                                    })
                                    setTimeout(() => {
                                        dom.remove();
                                        dom = null;
                                    }, 500)
                                    y.stopPropagation();
                                }
                                n = !1
                            })
                        })
                    }
                }()
        })
    }
}
import './global-func'