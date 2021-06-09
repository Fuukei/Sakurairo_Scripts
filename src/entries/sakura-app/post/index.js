import article_attach from './article_attach.js'
import { slideToggle } from '../../../module/util'
import { lazyload } from 'lazyload'
import { createButterbar } from '../butterbar'
import POWERMODE from 'activate-power-mode'
import './global-func'
import getqqinfo from './getqqinfo'
import addComment from './AddComment'
import { hljs_process, prism_process } from './code_highlight'
function powermode() {
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
}
function code_highlight_style() {
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
function smileBoxToggle() {
    let et = document.getElementById("emotion-toggle");
    et && et.addEventListener('click', function () {
        document.querySelector('.emotion-toggle-off').classList.toggle("emotion-hide");
        document.querySelector('.emotion-toggle-on').classList.toggle("emotion-show");
        document.querySelector('.emotion-box').classList.toggle("emotion-box-show");
    })
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
function whilePopstate() {
    article_attach()
    sm()
}
export function whileReady() {
    article_attach()
    XCS()
    XCP()
    powermode()
    getqqinfo()
    add_upload_tips()
    copy_code_block()
}
export function whilePjaxComplete() {
    try {
        add_upload_tips()
        article_attach()
        tableOfContentScroll(true);
        click_to_view_image()
        getqqinfo()
        sm()
        original_emoji_click()
        code_highlight_style()
        copy_code_block()
        smileBoxToggle()
        XCS()
    } catch (e) {
        console.warn(e)
    }
}
export function whileLoaded() {
    window.addEventListener('popstate', whilePopstate)
    click_to_view_image()
    code_highlight_style()
    sm()
    original_emoji_click()
    smileBoxToggle()
    tableOfContentScroll(true);
    addComtListener()
}