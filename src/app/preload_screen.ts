import { animatePreloadOut } from './animations/anime_runtime'

export default function () {
    const preload = document.getElementById("preload");
    if (preload) {
        let removed = false
        const removeScreen = () => {
            if (removed) return
            document.documentElement.style.overflowY = 'unset';
            removed = true
            void animatePreloadOut(preload, _iro.preload_blur || 360)
        }
        if (document.readyState === 'complete') return removeScreen()
        window.addEventListener('load', removeScreen, { once: true })
        setTimeout(removeScreen, 3000)
    }
}
