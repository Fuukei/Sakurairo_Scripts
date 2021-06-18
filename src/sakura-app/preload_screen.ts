export default function () {
    const preload = document.getElementById("preload");
    if (preload) {
        if (document.readyState === 'complete') return removeScreen(preload)
        window.addEventListener('load', () => {
            removeScreen(preload)
        })
    }
}
function removeScreen(preload: HTMLElement) {
    document.documentElement.style.overflowY = 'unset';
    if (mashiro_option.preload_blur != 0) {
        try {
            preload.animate(
                [
                    { filter: "blur(0px)", backdropFilter: "blur(10px)", opacity: 1 },
                    { backdropFilter: "blur(0px)grayscale(0)", opacity: 0.1 },
                    { opacity: 0, filter: "blur(100px)", }
                ],
                { duration: mashiro_option.preload_blur, fill: "forwards", easing: "ease" }
            ).onfinish = () => {
                preload.remove()
            }
            return
        } catch (error) {
            console.warn(error)
        }
    }
    preload.classList.add('hide');
    preload.classList.remove('show');
    setTimeout(() => preload.remove(), 233);
}