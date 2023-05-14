export default function () {
    const preload = document.getElementById("preload");
    if (preload) {
        let removed = false
        const removeScreen = () => {
            if (removed) return
            document.documentElement.style.overflowY = 'unset';
            if (_iro.preload_blur != 0) {
                try {
                    preload
                        .animate(
                            [
                                { filter: "blur(0px)", backdropFilter: "blur(10px)", opacity: 1 },
                                { backdropFilter: "blur(0px)grayscale(0)", opacity: 0.1 },
                                { opacity: 0, filter: "blur(100px)", }
                            ],
                            { duration: _iro.preload_blur, fill: "forwards", easing: "ease" }
                        )
                        .onfinish = () => {
                            preload.remove()
                        }
                    return
                } catch (error) {
                    console.warn(error)
                }
            }
            preload.classList.add('hide');
            preload.classList.remove('show');
            removed = true
            setTimeout(() => preload.remove(), 233);
        }
        if (document.readyState === 'complete') return removeScreen()
        window.addEventListener('load', removeScreen, { once: true })
        setTimeout(removeScreen, 3000)
    }
}
