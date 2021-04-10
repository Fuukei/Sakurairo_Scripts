const AddComment = {
    respondId: null,
    moveForm: function (commId, parentId, respondId) {
        let __cancel = jQuery('#cancel-comment-reply-link'),
            __cancel_text = __cancel.text(),
         t = this,
            div, comm = t.I(commId),
            respond = t.I(respondId),
            cancel = t.I('cancel-comment-reply-link'),
            parent = t.I('comment_parent')
        //post = t.I('comment_post_ID');
        __cancel.text(__cancel_text);
        t.respondId = respondId;
        if (!t.I('wp-temp-form-div')) {
            div = document.createElement('div');
            div.id = 'wp-temp-form-div';
            div.style.display = 'none';
            respond.parentNode.insertBefore(div, respond)
        }
        if (!comm) {
            const temp = t.I('wp-temp-form-div')
            t.I('comment_parent').value = '0'
            temp.parentNode.insertBefore(respond, temp)
            temp.remove()
        } else {
            comm.parentNode.insertBefore(respond, comm.nextSibling);
        }
        jQuery("body").animate({
            scrollTop: jQuery('#respond').offset().top - 180
        }, 400);
        parent.value = parentId;
        cancel.style.display = '';
        cancel.onclick = function () {
            var t = addComment,
                temp = t.I('wp-temp-form-div'),
                respond = t.I(t.respondId);
            t.I('comment_parent').value = '0';
            if (temp && respond) {
                temp.parentNode.insertBefore(respond, temp);
                temp.remove();
                //temp.parentNode.removeChild(temp);
            }
            this.style.display = 'none';
            this.onclick = null;
            return false;
        };
        try {
            t.I('comment').focus();
        } catch (e) { }
        return false;
    },
    I:(e)=> document.getElementById(e),
    clearButterbar: function () {
        const butterBar = document.getElementsByClassName("butterBar");
        if (butterBar.length > 0) {
            for (let i = 0; i < butterBar.length; i++) {
                butterBar[i].remove();
            }
        }
    },
    createButterbar: function (message, showtime) {
        const t = this;
        t.clearButterbar();
        document.body.insertAdjacentHTML('beforeend', '<div class="butterBar butterBar--center"><p class="butterBar-message">' + message + '</p></div>');
        if (showtime > 0) {
            setTimeout(() => { t.clearButterbar() }, showtime);
        } else {
            setTimeout(() => { t.clearButterbar() }, 6000);
        }
    }
};
export default AddComment