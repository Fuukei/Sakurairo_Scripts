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
import { nextBG, preBG, initCoverBG, getCoverPath } from './coverBackground'
import buildAPI from './api'
import { setCookie, } from '../../module/cookie'
import add_copyright from './copyright'
import addComment from './AddComment'
import { createButterbar } from './butterbar'
import { loadCSS } from 'fg-loadcss'
import { lazyload } from 'lazyload'
import './global-func'
import { onlyOnceATime, min } from '../../module/util'
import about_us from './about_us'
import { ready ,slideToggle} from '../../module/util'
import preload_screen from './preload_screen'
const pjax = (() => {
    //检查是否应当开启Poi.pjax
    const UA = navigator.userAgent
    const version_list = { Firefox: 84, Edg: 88, Chrome: 88, Opera: 74, Version: 9 };
    const reg = UA.indexOf('Chrome') != -1 ? /(Chrome)\/(\d+)/i : /(Firefox|Chrome|Version|Opera)\/(\d+)/i
    const version = UA.match(reg);
    Poi.pjax = version && (parseInt(version[2]) >= version_list[version[1]]) && Poi.pjax;
    if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0)
        setCookie('su_webp', '1', 114514)

    return Poi.pjax && import('pjax').then(({ default: Pjax }) =>
        new Pjax({
            selectors: ["#page", "title", ".footer-device",
                /**mashiro_option */
                "#_mashiro_"],
            elements: [
                "a:not([target='_top']):not(.comment-reply-link):not(#pagination a):not(#comments-navi a):not(.user-menu-option a):not(.header-user-avatar a):not(.emoji-item):not(.no-pjax)",
                ".search-form",
                ".s-search",
            ],
            timeout: 8000,
            history: true,
            cacheBust: false,
        })
    )
})()


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
            loadCSS(new URL('plugins/toolbar/prism-toolbar.min.css', PrismBaseUrl).toString())
            loadCSS(new URL('plugins/previewers/prism-previewers.min.css', PrismBaseUrl).toString())
            loadPrismCSS(isInDarkMode())
            document.addEventListener('darkmode', (e) => {
                loadPrismCSS(e.detail)
            })
            await Promise.all([
                import('prismjs/plugins/autoloader/prism-autoloader'),
                import('prismjs/plugins/previewers/prism-previewers'),
                import('prismjs/plugins/toolbar/prism-toolbar')
                    .then(() => import('prismjs/plugins/show-language/prism-show-language'))
            ])
            Prism.plugins.autoloader.languages_path = new URL('components/', PrismBaseUrl).toString()
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
import { initFontControl, loadFontSetting } from './font_control'

code_highlight_style();
/**
 * 上传图片提示
 */
function attach_image() {
    let cached = document.getElementsByClassName("insert-image-tips")[0],
        upload_img = document.getElementById('upload-img-file');
    if (!upload_img) return;
    upload_img.addEventListener("change", (function () {
        if (this.files.length > 10) {
            createButterbar("每次上传上限为10张.<br>10 files max per request.");
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
                createButterbar("上传中...<br>Uploading...");
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
                        createButterbar("图片上传成功~<br>Uploaded successfully~");
                        grin(get_the_url, type = 'Img');
                    } else {
                        createButterbar("上传失败！<br>Uploaded failed!<br> 文件名/Filename: " + f.name + "<br>code: " + res.status + "<br>" + res.message, 3000);
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
    if (form_submit == null) return;
    if (!mashiro_option.comment_upload_img) {
        form_submit.style.width = '100%'
        return
    }
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
            let toc_container = document.querySelector(".toc-container"),
                sc = document.querySelector(".site-content"),
                skinMenu = document.querySelector(".skin-menu");
            if (toc_container && sc) {
                toc_container.style.height = min(sc.getBoundingClientRect()["height"], document.documentElement.offsetHeight - toc_container.offsetTop) + "px";
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
import { checkDarkModeSetting, turnOnDarkMode, turnOffDarkMode, isInDarkMode } from './darkmode'
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

async function changeBG(bgid) {
    //@sideeffect
    mashiro_global.variables.skinSecter = bgid == "white-bg" || bgid == "dark-bg";
    checkSkinSecter();
    const now_bg_url = document.body.style.backgroundImage
    let bg_url;
    switch (bgid) {
        case "white-bg":
            if (mashiro_option.site_bg_as_cover) {
                //if(mashiro_option.cache_cover && now_bg_url.match(/^url\("blob:/)) return
                bg_url = await getCoverPath()
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
    if (now_bg_url != bg_url) {
        document.body.style.backgroundImage = bg_url ? `url(${bg_url})` : '';
    }
}

function bgButtonAddListener() {
    const next = document.getElementById("bg-next"),
        pre = document.getElementById("bg-pre");
    if (next) { next.onclick = () => { nextBG() } };
    if (pre) { pre.onclick = () => { preBG() } };
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
    if (ele.length > 0) {
        for (let j = 0; j < ele.length; j++) {
            ele[j].setAttribute('id', 'code-block-' + j);
            ele[j].insertAdjacentHTML('afterend', '<a class="copy-code" href="javascript:" data-clipboard-target="#code-block-' + j + '" title="拷贝代码"><i class="fa fa-clipboard" aria-hidden="true"></i>');
        };
        import('clipboard').then(({ default: ClipboardJS }) => {
            new ClipboardJS('.copy-code');
        })
    }
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
    loadFontSetting()
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

add_copyright()


if (mashiro_option.float_player_on) {
    if (document.body.clientWidth > 860) {
        import('./aplayer').then(({ aplayerInit }) => aplayerInit())
    }
}

function getqqinfo() {
    let is_get_by_qq = false;
    const i_author = document.querySelector("input#author"),
        i_qq = document.querySelector("input#qq"),
        i_email = document.querySelector("input#email"),
        i_url = document.querySelector("input#url"),
        qq_check = document.querySelector(".qq-check"),
        gravatar_check = document.querySelector(".gravatar-check"),
        user_avatar_img = document.querySelector("div.comment-user-avatar img");
    if (i_author == null) return;
    if (!localStorage.getItem('user_qq') && !localStorage.getItem('user_qq_email') && !localStorage.getItem('user_author')) {
        i_qq.value = i_author.value = i_email.value = i_url.value = "";
    }
    if (localStorage.getItem('user_avatar') && localStorage.getItem('user_qq') && localStorage.getItem('user_qq_email')) {
        user_avatar_img.setAttribute('src', localStorage.getItem('user_avatar'));
        i_author.value = localStorage.getItem('user_author');
        i_email.value = localStorage.getItem('user_qq') + '@qq.com';
        i_qq.value = localStorage.getItem('user_qq');
        if (mashiro_option.qzone_autocomplete) {
            i_url.value = 'https://user.qzone.qq.com/' + localStorage.getItem('user_qq');
        }
        if (i_qq.value) {
            qq_check.style.display = "block";
            gravatar_check.style.display = "none";
        }
    }
    let emailAddressFlag = i_email.value;
    //var emailAddressFlag = cached.filter('#email').val();
    i_author.addEventListener('blur', () => {
        // })
        //cached.filter('#author').on('blur', function () {
        const qq = i_author.value,
            reg_QQ = /^[1-9]\d{4,9}$/;
        if (reg_QQ.test(qq)) {
            const whileFailed = () => {
                i_qq.value = '';
                qq_check.style.display = 'none';
                gravatar_check.style.display = 'block';
                user_avatar_img.setAttribute('src', get_gravatar(i_email.value, 80));
                localStorage.setItem('user_qq', '');
                localStorage.setItem('user_email', i_email.value);
                localStorage.setItem('user_avatar', get_gravatar(i_email.value, 80));
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
            fetch(buildAPI(mashiro_option.qq_api_url, { qq: qq }))
                .then(async resp => {
                    if (resp.ok) {
                        //success
                        try {
                            const data = await resp.json()
                            i_author.value = data.name;
                            i_email.value = qq.trim() + '@qq.com';
                            if (mashiro_option.qzone_autocomplete) {
                                i_url.value = 'https://user.qzone.qq.com/' + qq.trim();
                            }
                            user_avatar_img.setAttribute('src', 'https://q2.qlogo.cn/headimg_dl?dst_uin=' + qq + '&spec=100');
                            is_get_by_qq = true;
                            i_qq.value = qq.trim();
                            if (i_qq.value) {
                                qq_check.style.display = 'block';
                                gravatar_check.style.display = 'none';
                            }
                            localStorage.setItem('user_author', data.name);
                            localStorage.setItem('user_qq', qq);
                            localStorage.setItem('is_user_qq', 'yes');
                            localStorage.setItem('user_qq_email', qq + '@qq.com');
                            localStorage.setItem('user_email', qq + '@qq.com');
                            emailAddressFlag = i_email.value;
                            /***/
                            user_avatar_img.setAttribute('src', data.avatar);
                            localStorage.setItem('user_avatar', data.avatar);
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
    if (localStorage.getItem('user_avatar') && localStorage.getItem('user_email') && localStorage.getItem('is_user_qq') == 'no' && !localStorage.getItem('user_qq_email')) {
        user_avatar_img.setAttribute("src", localStorage.getItem('user_avatar'));
        i_email.value = localStorage.getItem('user_mail');
        i_qq.value = '';
        if (!i_qq.value) {
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
    i_email.addEventListener("blur", function () {
        //cached.filter('#email').on('blur', function () {
        let emailAddress = i_email.value;
        // var emailAddress = cached.filter('#email').val();
        if ((is_get_by_qq == false || emailAddressFlag != emailAddress) && emailAddress != '') {
            user_avatar_img.setAttribute("src", get_gravatar(emailAddress, 80));
            //$('div.comment-user-avatar img').attr('src', get_gravatar(emailAddress, 80));
            localStorage.setItem('user_avatar', get_gravatar(emailAddress, 80));
            localStorage.setItem('user_email', emailAddress);
            localStorage.setItem('user_qq_email', '');
            localStorage.setItem('is_user_qq', 'no');
            i_qq.value = '';
            // cached.filter('#qq').val('');
            if (!i_qq.value) {
                qq_check.style.display = "none";
                gravatar_check.style.display = "block";
                // $('.qq-check').css('display', 'none');
                // $('.gravatar-check').css('display', 'block');
            }
        }
    });
    if (localStorage.getItem('user_url')) {
        i_url.value = localStorage.getItem("user_url");
        // cached.filter('#url').val(getCookie('user_url'));
    }
    i_url.addEventListener("blur", function () {
        //cached.filter('#url').on('blur', function () {
        let URL_Address = i_url.value;
        i_url.value = URL_Address;
        // var URL_Address = cached.filter('#url').val();
        // cached.filter('#url').val(URL_Address);
        localStorage.setItem('user_url', URL_Address);
    });
    if (localStorage.getItem('user_author')) {
        i_author.value = localStorage.getItem('user_author');
        // cached.filter('#author').val(getCookie('user_author'));
    }
    i_author.addEventListener("blur", function () {
        // cached.filter('#author').on('blur', function () {
        let user_name = i_author.value;
        i_author.value = user_name;
        // var user_name = cached.filter('#author').val();
        // cached.filter('#author').val(user_name);
        localStorage.setItem('user_author', user_name);
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
        const collapseListener = (e) => {
            slideToggle(e.target.parentNode.parentNode.parentNode.querySelector(".xContent"));
            // e.parentNode.parentNode.querySelector(".xContent")
        }
        for (const ele of collapseButton) {
            ele.addEventListener("click", collapseListener)
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
//#region Siren
const s = document.getElementById("bgvideo");
function MN() {
    let iconflat = document.querySelector(".iconflat");
    iconflat && iconflat.addEventListener("click", function () {
        document.body.classList.toggle("navOpen");
        document.getElementById("main-container").classList.toggle("open");
        document.getElementById("mo-nav").classList.toggle("open");
        document.querySelector(".openNav").classList.toggle("open");
    });
}
function MNH() {
    if (document.body.classList.contains("navOpen")) {
        document.body.classList.toggle("navOpen");
        document.getElementById("main-container").classList.toggle("open");
        document.getElementById("mo-nav").classList.toggle("open");
        document.querySelector(".openNav").classList.toggle("open");
    }
}
function splay() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) {
        video_btn.classList.add("video-pause");
        video_btn.classList.remove("video-play");
        video_btn.style.display = "";
    }
    try {
        document.querySelector(".video-stu").style.bottom = "-100px";
        document.querySelector(".focusinfo").style.top = "-999px";
        if (mashiro_option.float_player_on) {
            import('./aplayer').then(({ destroyAllAplayer }) => {
                destroyAllAplayer()
                s.play();
            })
            return
        }
    } catch (e) {
        console.warn(e)
    }
    s.play();
} function spause() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) {
        video_btn.classList.add("video-play");
        video_btn.classList.remove("video-pause");
    }
    try {
        document.querySelector(".focusinfo").style.top = "49.3%";
    } catch { }
    s.pause();
}
function liveplay() {
    if (s && s.oncanplay != undefined && document.querySelector(".haslive")) {
        if (document.querySelector(".videolive")) {
            splay();
        }
    }
}
function livepause() {
    if (s && s.oncanplay != undefined && document.querySelector(".haslive")) {
        spause();
        let video_stu = document.getElementsByClassName("video-stu")[0];
        video_stu.style.bottom = "0px";
        video_stu.innerHTML = "已暂停 ...";
    }
}
function addsource() {
    let video_stu = document.getElementsByClassName("video-stu")[0];
    video_stu.innerHTML = "正在载入视频 ...";
    video_stu.style.bottom = "0px";
    let t = Poi.movies.name.split(","),
        _t = t[Math.floor(Math.random() * t.length)],
        bgvideo = document.getElementById("bgvideo");
    bgvideo.setAttribute("src", Poi.movies.url + '/' + _t + '.mp4');
    bgvideo.setAttribute("video-name", _t);
}
function LV() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) video_btn.addEventListener("click", function () {
        if (this.classList.contains("loadvideo")) {
            this.classList.add("video-pause");
            this.classList.remove("loadvideo");
            addsource();
            s.oncanplay = function () {
                splay();
                document.getElementById("video-add").style.display = "block";
                video_btn.classList.add("videolive", "haslive");
            }
        } else {
            if (this.classList.contains("video-pause")) {
                spause();
                video_btn.classList.remove("videolive");
                document.getElementsByClassName("video-stu")[0].style.bottom = "0px";
                document.getElementsByClassName("video-stu")[0].innerHTML = "已暂停 ...";
            } else {
                splay();
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
        addsource();
    });
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
            if (Poi.movies.live == 'open') liveplay();
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
function CE() {
    let comments_hidden = document.querySelector(".comments-hidden");
    let comments_main = document.querySelector(".comments-main");
    if (comments_hidden != null) {
        comments_hidden.style.display = "block";
        comments_main.style.display = "none";
        comments_hidden.addEventListener("click", function () {
            slideToggle(comments_main, 500, 'show');
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
                    fetch(val)
                        .then(async resp => {
                            if (resp.ok) {
                                const json = await resp.text()
                                if (json != "") {
                                    sessionStorage.setItem('search', json);
                                    QueryStorage = JSON.parse(json);
                                    query(QueryStorage, otxt.value, Record);
                                    div_href();
                                }
                            } else {
                                console.warn('HTTP ' + resp.status)
                            }
                        })
                        .catch(reason => console.warn(reason))
                }
            }
            /*                     if (!Object.values) Object.values = function (obj) {
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
                                } */

            function Cx(array, query) {
                for (let s = 0; s < query.length; s++) {
                    if (['.', '?', '*'].indexOf(query[s]) != -1) {
                        query = query.slice(0, s) + "\\" + query.slice(s);
                        s++;
                    }
                }
                query = query.replace(query, "^(?=.*?" + query + ").+$").replace(/\s/g, ")(?=.*?");
                return array.filter(
                    v => Object.values(v).some(
                        v => new RegExp(query + '').test(v)
                    )
                );
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
const load_post = onlyOnceATime(function load_post() {
    const now_href = document.location.href
    const pagination_a = document.querySelector('#pagination a');
    pagination_a.classList.add("loading");
    pagination_a.innerText = "";

    // $('#pagination a').addClass("loading").text("");
    fetch(pagination_a.getAttribute("href") + "#main")
        .then(async resp => {
            const text = await resp.text()
            const parser = new DOMParser(),
                DOM = parser.parseFromString(text, "text/html"),
                result = DOM.querySelectorAll("#main .post"),
                paga = DOM.querySelector("#pagination a"),
                paga_innerText = paga && paga.innerText,
                nextHref = paga && paga.getAttribute("href"),
                main = document.getElementById("main")
            //在进行DOM操作前检查页面是否已经变化，防止错误加载到其他页面上
            if (now_href != document.location.href) return /**如果页面状态发生了变化，那么也应该不用理加载提示符 */
            for (let i = 0; i < result.length; i++) {
                main.append(result[i])
            }
            if (Poi.pjax) (await pjax).refresh(document.querySelector("#content"));
            //if (resp.ok) {
            // result = $(data).find("#main .post");
            // nextHref = $(data).find("#pagination a").attr("href");
            // $("#main").append(result.fadeIn(500));
            const dpga = document.querySelector("#pagination a"),
                addps = document.querySelector("#add_post span");
            if (dpga) {
                dpga.classList.remove("loading");
                dpga.innerText = paga_innerText;
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
})

function XLS() {
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
    //TODO:fix:监听器重复挂载
    document.body.addEventListener("click", function (e) {
        if (e.target == document.querySelector("#pagination a")) {
            e.preventDefault();
            e.stopPropagation();
            clearTimeout(load_post_timer);
            load_post();
        }
    })
}
function XCS() {
    const __list = 'commentwrap';
    const form = document.getElementById("commentform")
    if (form) {
        let statusSubmitting = false
        form.addEventListener('submit', function (event) {
            event.stopPropagation()
            event.preventDefault();
            if (statusSubmitting) return
            const butterBarRef = createButterbar("提交中(Commiting)....", true)
            const form = new FormData(this)
            form.append('action', 'ajax_comment')
            statusSubmitting = true
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
                    createButterbar("提交成功(Succeed)");
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
                    createButterbar(data ?? 'HTTP' + resp.status + ':' + resp.statusText);
                }
            }).catch(reason => {
                createButterbar(reason);
            }).finally(() => {
                butterBarRef.remove()
                statusSubmitting = false
            })
            /* jQuery.ajax({
                url: Poi.ajaxurl,
                data: jQuery(this).serialize() + "&action=ajax_comment",
                type: jQuery(this).attr('method'),
                beforeSend: createButterbar("提交中(Commiting)...."),
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
        })
    }
}
function XCP() {
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
                slideToggle(loading_comments, 500, "show");
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
                    slideToggle(loading_comments, 200, "hide");
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
}
async function IA() {
    const POWERMODE = (await import('activate-power-mode')).default
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
}
function GT() {
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

//#endregion Siren
function hitokoto() {
    if (mashiro_option.yiyan) {
        const yiyan = document.getElementById("footer_yiyan");
        if (yiyan) {
            fetch("https://api.maho.cc/yiyan/")
                .then(async res => {
                    const data = await res.json()
                    yiyan.innerText = data['hitokoto'] + "——" + data['from']
                })
        }
    }
}
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
        hitokoto()
        PE();
        CE();
        if (mashiro_option.land_at_home) XLS();
        if (mashiro_option.NProgressON) import('nprogress').then(({ default: NProgress }) => { NProgress.done() })
        //#region mashiro_global.ini.pjax();
        pjaxInit();
        post_list_show_animation();
        copy_code_block();
        web_audio();
        coverVideoIni();
        checkSkinSecter();
        load_bangumi();
        sm();
        NH();
        //#endregion
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
    document.addEventListener("pjax:error", (e) => {
        createButterbar('文章加载出错了 HTTP ' + e.request.status)
    })
    window.addEventListener('popstate', function (e) {
        auto_height();
        hitokoto()
        PE();
        CE();
        sm();
        timeSeriesReload(true);
        post_list_show_animation();
    }, false);
}

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

function web_audio() {
    if (mashiro_option.audio) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext
        if (window.AudioContext) {
            let ctx = new AudioContext,
                t = "880 987 1046 987 1046 1318 987 659 659 880 784 880 1046 784 659 659 698 659 698 1046 659 1046 1046 1046 987 698 698 987 987 880 987 1046 987 1046 1318 987 659 659 880 784 880 1046 784 659 698 1046 987 1046 1174 1174 1174 1046 1046 880 987 784 880 1046 1174 1318 1174 1318 1567 1046 987 1046 1318 1318 1174 784 784 880 1046 987 1174 1046 784 784 1396 1318 1174 659 1318 1046 1318 1760 1567 1567 1318 1174 1046 1046 1174 1046 1174 1567 1318 1318 1760 1567 1318 1174 1046 1046 1174 1046 1174 987 880 880 987 880".split(" "),//天空之城
                /*t = "329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 329.628 293.665 293.665 329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 293.665 261.626 261.626 293.665 293.665 329.628 261.626 293.665 329.628 349.228 329.628 261.626 293.665 329.628 349.228 329.628 293.665 261.626 293.665 195.998 329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 293.665 261.626 261.626".split(" "),欢乐颂*/
                i = 0,
                o = 1,
                dom,
                a = "♪ ♩ ♫ ♬ ♭ € § ¶ ♯".split(" "),
                selects = document.querySelectorAll(".site-title, #moblieGoTop, .site-branding, .searchbox, .changeSkin-gear, .menu-list li");
            selects.forEach((select) => {
                select.addEventListener("mouseenter", (e) => {
                    if (dom) return;
                    let r = t[i]
                    if (!r) {
                        (i = 0, r = t[i])
                    }
                    i += o
                    const c = ctx.createOscillator(),
                        l = ctx.createGain();
                    c.connect(l)
                    l.connect(ctx.destination)
                    c.type = "sine"
                    c.frequency.value = r
                    l.gain.setValueAtTime(0, ctx.currentTime)
                    l.gain.linearRampToValueAtTime(1, ctx.currentTime + .01)
                    c.start(ctx.currentTime)
                    l.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 1)
                    c.stop(ctx.currentTime + 1)
                    const d = Math.round(7 * Math.random());
                    const h = e.pageX
                    const p = e.pageY - 5
                    dom = document.createElement("b");
                    dom.textContent = a[d]
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
                    e.stopPropagation();

                })
            })
        }
    }
}

//afterDOMContentLoaded
function addChangeBackgroundListener() {
    const cached = document.querySelectorAll(".menu-list li");
    cached.forEach(e => {
        e.addEventListener("click", function () {
            const tagid = this.id;
            if (tagid == "dark-bg") {
                turnOnDarkMode(true)
            } else {
                turnOffDarkMode(true)
                changeBG(tagid)
                localStorage.setItem("bgImgSetting", tagid)
            }
            closeSkinMenu();
        });
    });
}
function checkBgImgSetting() {
    changeBG(localStorage.getItem("bgImgSetting") ?? 'white-bg');
}
function closeSkinMenu() {
    document.querySelector(".skin-menu").classList.remove("show");
    setTimeout(function () {
        if (document.querySelector(".changeSkin-gear") != null) {
            document.querySelector(".changeSkin-gear").style.visibility = "visible";
        }
    }, 300);
}
ready(function () {
    initCoverBG()
    //let checkskin_bg = (a) => a == "none" ? "" : a;
    addChangeBackgroundListener();
    checkBgImgSetting()
    checkDarkModeSetting();

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
ready(function () {
    auto_height();
    PE();
    NH();
    GT();
    XLS();
    XCS();
    XCP();
    CE();
    MN();
    IA();
    LV();
    hitokoto()
    initFontControl()
    getqqinfo()
    bgButtonAddListener()
    web_audio()
    preload_screen()
    about_us()
});