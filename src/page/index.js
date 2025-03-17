import article_attach from './artile_attachment'
import { ready, slideToggle, buildAPI } from '../common/util'
import lazyload from "../common/lazyload"
import { createButterbar } from '../common/butterbar'
import './global-func'
import getqqinfo from './getqqinfo'
import addComment from './AddComment'
import { _$, __ } from '../common/sakurairo_global'
import LoadNextPage from './pagination'
import debounce from '@mui/utils/debounce'
import { code_highlight_style } from '../common/code-highlight'
import prepareEmoji from './emoji'
import initAnnotations from './annotation'
import initLinkSubmission from './link_form'

function apply_post_theme_color() {
    if (_iro.post_theme_color != false && _iro.post_theme_color != 'false') {
        let post_theme_color = _iro.post_theme_color;
        document.documentElement.style.setProperty('--article-theme-highlight', post_theme_color);
    } else {
        document.documentElement.style.removeProperty('--article-theme-highlight');
    }
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
function clean_upload_images() {
    document.getElementById("upload-img-show").innerHTML = '';
}
function original_emoji_click() {
    const emoji = document.getElementsByClassName('emoji-item');
    if (!emoji.length) return;
    document.querySelector(".menhera-container").addEventListener("click", function (e) {
        if (e.target.classList.contains("emoji-item")) {
            grin(e.target.innerText, "custom", "`", "` ");
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
            const butterBarRef = createButterbar(__("提交中...."), true)
            const form = new FormData(this)
            form.append('action', 'ajax_comment')
            statusSubmitting = true
            fetch(_iro.ajaxurl, {
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
                        if (_iro.formpostion == 'bottom') {
                            document.getElementById("respond").insertAdjacentHTML('beforebegin', '<ol class="' + __list + '">' + data + '</ol>');
                            //jQuery('#respond').before('<ol class="' + __list + '">' + data + '</ol>');
                        } else {
                            document.getElementById("respond").insertAdjacentHTML('afterend', '<ol class="' + __list + '">' + data + '</ol>');
                            //jQuery('#respond').after('<ol class="' + __list + '">' + data + '</ol>');
                        }
                    } else {
                        if (_iro.order == 'asc') {
                            document.getElementsByClassName("commentwrap")[1].insertAdjacentHTML('beforeend', data);
                            //jQuery('.' + __list).append(data);
                        } else {
                            document.getElementsByClassName("commentwrap")[1].insertAdjacentHTML('afterbegin', data);
                            //jQuery('.' + __list).prepend(data);
                        }
                    }
                    createButterbar(__("提交成功"));
                    document.dispatchEvent(new CustomEvent('ajax_comment_complete',))
                    cancel.style.display = 'none';
                    cancel.onclick = null;
                    document.getElementById('comment_parent').value = '0';
                    if (temp && respond) {
                        temp.parentNode.insertBefore(respond, temp);
                        temp.remove();
                        //temp.parentNode.removeChild(temp)
                    }
                } else {
                    createButterbar(data || 'HTTP' + resp.status + ':' + resp.statusText);
                }
            }).catch(reason => {
                createButterbar(reason);
            }).finally(() => {
                butterBarRef.remove()
                statusSubmitting = false
            })
            /* jQuery.ajax({
                url: _iro.ajaxurl,
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
                        if (_iro.formpostion == 'bottom') {
                            jQuery('#respond').before('<ol class="' + __list + '">' + data + '</ol>');
                        } else {
                            jQuery('#respond').after('<ol class="' + __list + '">' + data + '</ol>');
                        }
                    } else {
                        if (_iro.order == 'asc') {
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
                        gtag('config', _iro.google_analytics_id, {
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
function sm() {
    let sm = document.getElementsByClassName('sm'),
        cm = document.querySelector(".comments-main");
    if (!sm.length) return;
    if (cm) {
        cm.addEventListener("click", function (e) {
            if (e.target.classList.contains("comment-reply-link")) {
                e.preventDefault();
                e.stopPropagation();
                let data_commentid = e.target.getAttribute("data-commentid");
                addComment.moveForm("comment-" + data_commentid, data_commentid, "respond", this.getAttribute("data-postid"));
            }
        })
        cm.addEventListener("click", (e) => {
            let list = e.target.parentNode;
            if (list.classList.contains("sm")) {
                let msg = __("您真的要设为私密吗？");
                if (confirm(msg) == true) {
                    if (list.classList.contains('private_now')) {
                        alert(__('您之前已设过私密评论'));
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
                        request.open('POST', _iro.ajaxurl, true);
                        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                        request.send(ajax_data);
                        return false;
                    }
                }
            }
        })
    }
}
function throttling(fn, wait, maxTimelong) {
    let timeout = null,
        startTime = Date.parse(new Date);
    return function () {
        if (timeout !== null) clearTimeout(timeout);
        let curTime = Date.parse(new Date);
        if (curTime - startTime >= maxTimelong) {
            fn();
            startTime = curTime;
        } else {
            timeout = setTimeout(fn, wait);
        }
    }
}
function resizeTOC() {
    const toc_container = document.querySelector(".toc-container"),
        sc = document.querySelector(".site-content")
    if (toc_container && sc) {
        const resize = () => {
            toc_container.style.height = Math.min(sc.getBoundingClientRect()["height"], document.documentElement.offsetHeight - toc_container.offsetTop) + "px";
        }
        resize()
        //TODO:性能
        window.addEventListener('resize', debounce(resize), { passive: true })
        document.addEventListener('scroll', throttling(resize, 200, 1000))
    }
}
function tableOfContentScroll(flag) {
    let tocContainer = document.getElementsByClassName("toc-container")[0];
    let hasToc = document.querySelector("div.have-toc") || document.querySelector("div.has-toc");
    if (!hasToc) {
        if (tocContainer) {
            tocContainer.style.display = "none";
        }
    } else {
        if (tocContainer) {
            tocContainer.style.display = "";
        }
        if (flag && document.getElementsByClassName('toc').length > 0) {
            import('tocbot').then(({ default: tocbot }) => {
                tocbot.init({
                    tocSelector: '#main-container .toc',
                    contentSelector: ['.entry-content', '.links'],
                    headingSelector: 'h1,h2,h3,h4,h5',
                    headingsOffset: heading_fix - window.innerHeight / 2,
                    onClick: null
                });
            })
            const heading_fix = _iro.entry_content_style == "sakurairo" ? (document.querySelector("article.type-post") ? (document.querySelector("div.pattern-attachment") ? -75 : 200) : 375) : window.innerHeight / 2;
            const _els = document.querySelectorAll('.entry-content,.links');
            const idSet = new Set()
            let id = 1
            for (let i = 0; i < _els.length; i++) {
                let _el = _els[i].querySelectorAll('h1,h2,h3,h4,h5');
                for (const title of _el) {
                    const validId = generateValidId(title.innerText, idSet, id);
                    if (idSet.has(validId)) {
                        title.id = "toc-head-" + id++;
                    } else {
                        title.id = validId;
                        idSet.add(validId);
                    }
                }
            }
        }
    }
}

//转义id，防止使用中文字符报错
function generateValidId(text, idSet, index) {
    // 去除首尾空白并将空格替换为 -
    let newId = text.trim().replace(/\s+/g, '-');
    // 移除除字母、数字、下划线和连字符之外的所有字符
    newId = newId.replace(/[^\w\-]/g, '');
    // 如果处理后为空，则使用默认前缀
    if (!newId) {
        newId = "heading-" + index;
    }
    // 避免重复
    while (idSet.has(newId)) {
        newId += "-" + index;
    }
    idSet.add(newId);
    return newId;
}
/**
 * 上传图片提示
 */
function attach_image() {
    let cached = document.getElementsByClassName("insert-image-tips")[0],
        upload_img = document.getElementById('upload-img-file');
    if (!upload_img) return;
    upload_img.addEventListener("change", (function () {
        if (this.files.length > 10) {
            createButterbar(__("每次上传上限为10张"));
            return 0;
        }
        for (let i = 0; i < this.files.length; i++) {
            if (this.files[i].size >= 5242880) {
                alert(_$('图片上传大小限制为5 MB\n\n「{0}」\n\n这张图太大啦~请重新上传噢！', this.files[i].name));
                return;
            }
        }
        for (let i = 0; i < this.files.length; i++) {
            let f = this.files[i],
                formData = new FormData(),
                xhr = new XMLHttpRequest();
            formData.append('cmt_img_file', f);
            xhr.addEventListener('loadstart', function () {
                cached.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
                createButterbar(__("上传中..."));
            });
            xhr.open("POST", buildAPI(_iro.api + 'sakura/v1/image/upload'), true);
            xhr.send(formData);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                    cached.innerHTML = '<i class="fa-solid fa-check"></i>';
                    setTimeout(function () {
                        cached.innerHTML = '<i class="fa-regular fa-image"></i>';
                    }, 1000);
                    let res = JSON.parse(xhr.responseText);
                    if (res.status == 200) {
                        let get_the_url = res.proxy;
                        document.getElementById("upload-img-show").insertAdjacentHTML('afterend', '<img class="lazyload upload-image-preview" src="' + _iro.loading_ph + '" data-src="' + get_the_url + '" onclick="window.open(\'' + get_the_url + '\')" onerror="imgError(this)" />');
                        lazyload();
                        createButterbar(__("图片上传成功~"));
                        grin(get_the_url, type = 'Img');
                    } else {
                        createButterbar(_$('上传失败！\n文件名: {0}\ncode: {1}\n{2}', f.name, res.status, res.message), 3000)
                    }
                } else if (xhr.readyState == 4) {
                    cached.innerHTML = '<i class="fa-regular fa-clock" aria-hidden="true" style="color:red"></i>';
                    alert(__("上传失败，请重试."));
                    setTimeout(function () {
                        cached.innerHTML = '<i class="fa-regular fa-image"></i>';
                    }, 1000);
                }
            }
        }
    }));
}

/**
 * 添加上传图片的提示
 */
function add_upload_tips() {
    const form_submit = document.querySelector('.form-submit #submit');
    if (form_submit == null) return;
    if (!_iro.comment_upload_img) {
        return
    }
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
function addComtListener() {
    document.querySelectorAll(".comt-addsmilies").forEach((e) => {
        e.addEventListener("click", () => {
            if (e.stlye.display == "block") {
                e.style.display = "none";
            } else {
                e.style.display = "block";
            }
        })
    })
    document.querySelectorAll(".comt-smilies a").forEach((e) => {
        e.addEventListener("click", () => {
            e.parentNode.style.display = "none";
        })
    })
}
function afterAjaxCommentComplete() {
    lazyload();
    code_highlight_style();
    click_to_view_image();
    clean_upload_images();
}

// #region LifeCycle
function whilePopstate() {
    article_attach()
    sm()
}
function whileReady() {
    article_attach()
    XCS()
    XCP()
    getqqinfo()
    add_upload_tips()
}
function whilePjaxComplete() {
    try {
        add_upload_tips()
        article_attach()
        LoadNextPage();
        tableOfContentScroll(true);
        click_to_view_image()
        getqqinfo()
        sm()
        original_emoji_click()
        code_highlight_style()
        prepareEmoji()
        XCS()
        resizeTOC()
        initAnnotations();
        apply_post_theme_color();
        initLinkSubmission();
    } catch (e) {
        console.warn(e)
    }
}
function whileLoaded() {
    window.addEventListener('popstate', whilePopstate)
    click_to_view_image()
    code_highlight_style()
    LoadNextPage();
    sm()
    original_emoji_click()
    prepareEmoji()
    tableOfContentScroll(true);
    addComtListener()
    resizeTOC()
    initAnnotations();
    apply_post_theme_color();
    document.addEventListener('ajax_comment_complete', afterAjaxCommentComplete)
    initLinkSubmission();
}
whileLoaded()
document.addEventListener('pjax:complete', whilePjaxComplete)
ready(whileReady)
//#endregion