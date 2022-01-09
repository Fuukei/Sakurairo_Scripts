async function initParticle() {
    const cfg = document.getElementById('particles-js-cfg')
    if (cfg) {
        try {
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
    const { effect } = mashiro_option
    if (effect) {
        if (effect.type == 'yuki') {
            import('./falling_effect/yuki/start')
        } else import('./falling_effect/sakura/start')
    }
    initParticle()
}