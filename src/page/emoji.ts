function smileBoxToggle() {
    const ele = document.getElementById("emotion-toggle");
    ele && ele.addEventListener('click', function () {
        document.querySelector('.emotion-toggle-off').classList.toggle("emotion-hide");
        document.querySelector('.emotion-toggle-on').classList.toggle("emotion-show");
        document.querySelector('.emotion-box').classList.toggle("emotion-box-show");
    })
}
function addEmojiEventListener() {
    const row = document.querySelector('.emotion-box>table tr')

    function emojiPannelSwitcher(elementSwitchTo: HTMLElement) {
        for (const element of row.querySelectorAll('th')) {
            const emojiClassName = element.className.match(/(\w+)-bar/)

            if (element === elementSwitchTo) {
                elementSwitchTo.classList.add('on-hover')
                document.querySelector<HTMLElement>('.' + emojiClassName[1] + '-container').style.display = 'block'
            } else {
                element.classList.remove('on-hover')
                document.querySelector<HTMLElement>('.' + emojiClassName[1] + '-container').style.display = 'none'
            }

        }
    }
    row.addEventListener('click', (e) => {
        if (e.target instanceof HTMLTableCellElement) {
            emojiPannelSwitcher(e.target)
        }
    })
}

export default function prepareEmoji() {
    smileBoxToggle()
    addEmojiEventListener()
}