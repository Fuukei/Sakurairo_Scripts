
export default function showcard() {
    for (const showcard of document.querySelectorAll('.showcard')) {
        const img = showcard.querySelector('.img')
        const button = showcard.querySelector('.showcard-button')
        if (!img || !button) {
            throw new Error('invalid structure for .showcard')
        }
        img.addEventListener('mouseover', function () {
            button.classList.add('hover');
        });

        img.addEventListener('mouseout', function () {
            button.classList.remove('hover');
        });
    }
}