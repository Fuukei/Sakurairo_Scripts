const addComment = {
    respondId: '',
    moveForm: function (commId: string, parentId: any, respondId: string) {
        let t = this,
            div, comm = document.getElementById(commId),
            respond = document.getElementById(respondId),
            cancel = document.getElementById('cancel-comment-reply-link'),
            parent = document.getElementById('comment_parent') as HTMLInputElement,
            //post = document.getElementById('comment_post_ID'),
            temp;
        __cancel.textContent = __cancel_text;
        t.respondId = respondId;
        if (!document.getElementById('wp-temp-form-div')) {
            div = document.createElement('div');
            div.id = 'wp-temp-form-div';
            div.style.display = 'none';
            respond.parentNode.insertBefore(div, respond)
        }
        if (!comm) {
            temp = document.getElementById('wp-temp-form-div')
            document.getElementById('comment_parent').value = '0'
            temp.parentNode.insertBefore(respond, temp)
            temp.remove()
        } else {
            comm.parentNode.insertBefore(respond, comm.nextSibling);
        }
        let _respond = document.getElementById("respond");
        if (_respond) window.scrollTo({
            top: _respond.getBoundingClientRect().top + window.pageYOffset - _respond.clientTop - 100,
            behavior: "smooth"
        });
        parent.value = parentId;
        cancel.style.display = '';
        cancel?.onclick = function () {
            let t = addComment,
                temp = document.getElementById('wp-temp-form-div'),
                respond = document.getElementById(t.respondId);
            document.getElementById('comment_parent').value = '0';
            if (temp && respond) {
                temp.parentNode.insertBefore(respond, temp);
                temp.remove();
            }
            (this as HTMLElement).style.display = 'none';
            this.onclick = null;
            return false;
        };
        try {
            document.getElementById('comment').focus();
        } catch { }
        return false;
    },

    clearButterbar: function () {
        const butterBar = document.getElementsByClassName("butterBar");
        if (butterBar.length > 0) {
            for (let i = 0; i < butterBar.length; i++) {
                butterBar[i].remove();
            }
        }
    },
    createButterbar: function (message: string, showtime: number | undefined) {
        let t = this;
        t.clearButterbar();
        document.body.insertAdjacentHTML('beforeend', '<div class="butterBar butterBar--center"><p class="butterBar-message">' + message + '</p></div>');
        let butterBar = () => {
            let _butterBar = document.getElementsByClassName("butterBar");
            if (_butterBar.length == 0) return;
            for (let i = 0; i < _butterBar.length; i++) {
                let a = _butterBar[i];
                a.remove();
            }
        }
        //undefined > 0 === false
        //@ts-ignore
        if (showtime > 0) {
            setTimeout(() => { butterBar() }, showtime);
        } else {
            setTimeout(() => { butterBar() }, 6000);
        }
    }
    // clearButterbar: function (e) {
    //     if (jQuery(".butterBar").length > 0) {
    //         jQuery(".butterBar").remove();
    //     }
    // },
    // createButterbar: function (message, showtime) {
    //     var t = this;
    //     t.clearButterbar();
    //     jQuery("body").append('<div class="butterBar butterBar--center"><p class="butterBar-message">' + message + '</p></div>');
    //     if (showtime > 0) {
    //         setTimeout("jQuery('.butterBar').remove()", showtime);
    //     } else {
    //         setTimeout("jQuery('.butterBar').remove()", 6000);
    //     }
    // }
};
export default addComment