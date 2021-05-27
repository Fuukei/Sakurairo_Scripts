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
function clearButterbar() {
    const butterBar = document.getElementsByClassName("butterBar");
    if (butterBar.length > 0) {
        for (let i = 0; i < butterBar.length; i++) {
            butterBar[i].remove();
        }
    }
}
function createButterbar(message: string, keep?: boolean) {
    clearButterbar();
    /*     document.body.insertAdjacentHTML('beforeend', '<div class="butterBar butterBar--center"><p class="butterBar-message">' + message + '</p></div>');
     */
    const div = document.createElement('div')
    div.classList.add('butterBar', 'butterBar--center')
    const p = document.createElement('p')
    p.classList.add('butterBar-message')
    p.appendChild(document.createTextNode(message))
    div.appendChild(p)
    document.body.appendChild(div)
    if (!keep) setTimeout(() => { clearButterbar() }, 6000);
    return div
}
export { clearButterbar, createButterbar }
export default AddComment