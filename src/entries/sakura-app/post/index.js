async function IA() {
    const POWERMODE = (await import('activate-power-mode')).default
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
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
    XCS()
    XCP()
    IA()
