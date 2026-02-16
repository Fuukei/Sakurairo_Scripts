import { loadAnime } from '../../animations/anime_runtime'

function makeSnowflake() {
    const flake = document.createElement('span')
    const size = 3 + Math.random() * 9
    const left = Math.random() * window.innerWidth

    flake.setAttribute(
        'style',
        `position:absolute;left:${left}px;top:-24px;width:${size}px;height:${size}px;` +
        'border-radius:50%;background:rgba(255,255,255,.95);box-shadow:0 0 6px rgba(255,255,255,.8);pointer-events:none;'
    )
    return flake
}

function animateFlake(anime, flake, container, baseSpeed) {
    const drift = (Math.random() - 0.5) * 180
    const duration = (7500 + Math.random() * 8500) / Math.max(baseSpeed, 0.2)

    anime.animate(flake, {
        translateY: [0, window.innerHeight + 60],
        translateX: [0, drift],
        opacity: [0, 1, 0.9, 0],
        scale: [0.8, 1, 0.9],
        duration,
        easing: 'linear',
        complete: () => {
            flake.remove()
            if (!container.isConnected) return
            const next = makeSnowflake()
            container.appendChild(next)
            animateFlake(anime, next, container, baseSpeed)
        },
    })
}

export function snowFall(snow) {
    snow = snow || {}
    this.maxFlake = snow.maxFlake || 200
    this.flakeSize = snow.flakeSize || 10
    this.fallSpeed = snow.fallSpeed || 1
    this.container = null
}

snowFall.prototype.start = async function () {
    const anime = await loadAnime()

    const old = document.getElementById('snowfall')
    old?.remove()

    const container = document.createElement('div')
    container.id = 'snowfall'
    container.setAttribute(
        'style',
        'position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;overflow:hidden;z-index:11;'
    )
    document.body.appendChild(container)
    this.container = container

    const amount = this.maxFlake
    const speed = this.fallSpeed
    for (let i = 0; i < amount; i++) {
        const flake = makeSnowflake()
        container.appendChild(flake)
        setTimeout(() => animateFlake(anime, flake, container, speed), Math.random() * 2000)
    }
}
