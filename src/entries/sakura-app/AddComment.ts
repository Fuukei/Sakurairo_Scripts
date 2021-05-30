const AddComment = {
    respondId: '',
    moveForm: function (commId: string, parentId: any, respondId: string) {
        const t = this,
            comm = document.getElementById(commId),
            respond = document.getElementById(respondId),
            cancel = document.getElementById('cancel-comment-reply-link'),
            parent = document.getElementById('comment_parent') as HTMLInputElement
        //post = document.getElementById('comment_post_ID');
        t.respondId = respondId;
        if (!document.getElementById('wp-temp-form-div')) {
            let div
            div = document.createElement('div');
            div.id = 'wp-temp-form-div';
            div.style.display = 'none';
            respond.parentNode.insertBefore(div, respond)
        }
        if (!comm) {
            const temp = document.getElementById('wp-temp-form-div');
            (document.getElementById('comment_parent') as HTMLInputElement).value = '0'
            temp.parentNode.insertBefore(respond, temp)
            temp.remove()
        } else {
            comm.parentNode.insertBefore(respond, comm.nextSibling);
        }
        const _respond = document.getElementById("respond");
        window.scrollTo({
            top: _respond.getBoundingClientRect().top + window.pageYOffset - _respond.clientTop - 100,
            behavior: "smooth"
        });
        parent.value = parentId;
        cancel.style.display = '';
        cancel.onclick = function (e) {
            var t = AddComment,
                temp = document.getElementById('wp-temp-form-div'),
                respond = document.getElementById(t.respondId);
            (document.getElementById('comment_parent') as HTMLInputElement).value = '0';
            if (temp && respond) {
                temp.parentNode.insertBefore(respond, temp);
                temp.remove();
                //temp.parentNode.removeChild(temp);
            }
            (this as HTMLElement).style.display = 'none';
            this.onclick = null;
            return false;
        };
        try {
            document.getElementById('comment').focus();
        } catch (e) { }
        return false;
    },

};
export default AddComment