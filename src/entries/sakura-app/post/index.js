import article_attach from './article_attach.js'
import POWERMODE from 'activate-power-mode'
function powermode() {
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
}
const load_code_highlight_style = ()=>{

}
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
function click_to_view_image() {
    const comment_inline = document.getElementsByClassName('comment_inline_img');
    if (!comment_inline.length) return;
    document.getElementsByClassName("comments-main")[0].addEventListener("click", function (e) {
        if (e.target.classList.contains("comment_inline_img")) {
            window.open(e.target.src);
        }
    })
}
function clean_upload_images() {
    document.getElementById("upload-img-show").innerHTML = '';
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
function whilePopstate(){
    article_attach()
}
export function whileReady() {
    article_attach()
    XCS()
    XCP()
    powermode()
}
export function whilePjaxComplete() {
    try {
        article_attach()
        code_highlight_style()
        click_to_view_image()
    } catch (e) {
        console.warn(e)

    }
}
export function whileLoaded() {
    window.addEventListener('popstate',whilePopstate)
    click_to_view_image()
    code_highlight_style()

}