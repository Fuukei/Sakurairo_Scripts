export function clearButterbar() {
    const butterBar = document.getElementsByClassName("butterBar");
    if (butterBar.length > 0) {
        for (let i = 0; i < butterBar.length; i++) {
            butterBar[i].remove();
        }
    }
}
export function createButterbar(message: string, keep?: boolean | number) {
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
    if (keep !== true) setTimeout(() => { clearButterbar() }, typeof keep == 'number' ? keep : 6000);
    return div
}