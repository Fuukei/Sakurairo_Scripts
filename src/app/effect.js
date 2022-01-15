async function initParticle() {
    const cfg = document.getElementById('particles-js-cfg')
    if (cfg) {
        try {
            //particles.js的npm包内没有预置minify版本，与unpkg不兼容
            //@ts-ignore
            await import('particles.js')
            //@ts-ignore
            particlesJS('particles-js', JSON.parse(cfg.innerHTML))
        } catch (error) {
            console.error(error)
        }
    }
}
export default function initEffect() {
    document.addEventListener('load', () => {
        const { effect } = mashiro_option
        if (effect) {
            if (effect.type == 'yuki') {
                import('./falling_effect/yuki/start')
            } else import('./falling_effect/sakura/start')
        }
        initParticle()
    })
}