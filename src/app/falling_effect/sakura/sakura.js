import { loadAnime } from '../../animations/anime_runtime'

let sakuraAmount = 50
let sakuraContainer = null

function ensureContainer() {
    const existed = document.getElementById('canvas_sakura')
    if (existed) return existed

    const container = document.createElement('div')
    container.id = 'canvas_sakura'
    container.setAttribute(
        'style',
        'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;overflow:hidden;z-index:10;'
    )
    document.body.appendChild(container)
    return container
}

function buildPetal() {
    const petal = document.createElement('span')
    const size = 14 + Math.random() * 26
    const startX = Math.random() * window.innerWidth

    petal.setAttribute(
        'style',
        `position:absolute;left:${startX}px;top:-40px;width:${size}px;height:${size}px;opacity:${0.45 + Math.random() * 0.5};` +
        'background:radial-gradient(circle at 30% 30%, rgba(255,255,255,.95), rgba(255,182,193,.9) 45%, rgba(255,105,180,.65) 70%, rgba(255,105,180,.08));' +
        'border-radius: 70% 45% 70% 40%; transform: rotate(45deg); filter: blur(0.2px);'
    )
    return petal
}

function animatePetal(anime, petal) {
    const drift = (Math.random() - 0.5) * 320
    const duration = 7000 + Math.random() * 9000

    anime.animate(petal, {
        translateY: [0, window.innerHeight + 120],
        translateX: [0, drift],
        rotate: [0, 360 + Math.random() * 360],
        easing: 'linear',
        duration,
        complete: () => {
            petal.remove()
            if (!sakuraContainer?.isConnected) return
            const newPetal = buildPetal()
            sakuraContainer.appendChild(newPetal)
            animatePetal(anime, newPetal)
        },
    })
}

export async function start(amount) {
    switch (typeof amount) {
        case 'number':
            sakuraAmount = Math.floor(amount)
            break
        case 'string':
            sakuraAmount = parseInt(amount)
            break
        default:
            throw new TypeError('need a int as args, but get ' + typeof amount + ' instead')
    }

    const anime = await loadAnime()

    const existed = document.getElementById('canvas_sakura')
    existed?.remove()

    sakuraContainer = ensureContainer()
    for (let i = 0; i < sakuraAmount; i++) {
        const petal = buildPetal()
        sakuraContainer.appendChild(petal)
        setTimeout(() => animatePetal(anime, petal), Math.random() * 1500)
    }
}
