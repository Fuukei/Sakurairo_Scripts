import {ifDarkmodeShouldOn} from '../app/darkmode'

export default function ghcardTheme(){
    document.addEventListener('darkmode', (event) => { // darkmode.ts informDarkModeChange事件通知
        let turn = event.detail;
        ghcardDark(turn);
    });
    document.addEventListener('pjax:complete',function(){
        checkDark()
    })
    checkDark()
}

function checkDark () {
    const dark = localStorage.getItem("dark")
    if (!dark) {
        if (ifDarkmodeShouldOn() && _iro.darkmode) {
            ghcardDark(true);
        } else {
            ghcardDark(false);
        }
    } else {
        if (dark == '1') {
            ghcardDark(true);
        } else {
            ghcardDark(false);
        }
    }
}

function ghcardDark (turn = false) {
    let cards = document.querySelectorAll('.ghcard');
    if (!cards) return;
    cards.forEach((ghcard) => {
        let card = ghcard.querySelector('img')
        if (!card) return;
        let src = new URL(card.src)
        try{
            if (turn) {
                src.searchParams.set('theme','dark')
                card.src = src.toString()
            } else {
                src.searchParams.delete('theme')
                card.src = src.toString()
            }
        } catch(e){
            // none
        }
    });
}