export default function prepareEmoji() {
    const ele = document.getElementById("emotion-toggle");
    ele && ele.addEventListener('click', () => {
        const offElement = document.querySelector('.emotion-toggle-off');
        const onElement = document.querySelector('.emotion-toggle-on');
        const boxElement = document.querySelector('.emotion-box');
        
        offElement?.classList.toggle("emotion-hide");
        onElement?.classList.toggle("emotion-show");
        boxElement?.classList.toggle("emotion-box-show");
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