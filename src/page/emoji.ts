export default function prepareEmoji() {
    const ele = document.getElementById("emotion-toggle");
    ele && ele.addEventListener('click', () => {
        document.querySelector('.emotion-toggle-off').classList.toggle("emotion-hide");
        document.querySelector('.emotion-toggle-on').classList.toggle("emotion-show");
        document.querySelector('.emotion-box').classList.toggle("emotion-box-show");
    })

    const row = document.querySelector('.emotion-box>table tr')
    if (!row) return

    row.addEventListener('click', (e) => {
        if ((e.target as HTMLElement).tagName === 'TH') {
            for (const element of row.querySelectorAll('th')) {
                const container = document.querySelector<HTMLElement>(`.${element.className.match(/(\S+)-bar/)[1]}-container`)
                if (element === e.target) {
                    element.classList.add('on-hover')
                    container.style.display = 'block'
                } else {
                    element.classList.remove('on-hover')
                    container.style.display = 'none'
                }
            }
        }
    })
}