import { animate, remove } from 'animejs'

type AnimeModule = {
    animate: typeof animate
    remove: typeof remove
}

const animeModule: AnimeModule = {
    animate,
    remove,
}

export function initAnimeRuntime() {
    document.documentElement.classList.add('iro-anime-runtime')
    initClassMutationAnimations()
}

export function loadAnime(): Promise<AnimeModule> {
    return Promise.resolve(animeModule)
}

function withAnime(
    targets: unknown,
    params: Record<string, unknown>,
    fallback?: () => void,
) {
    try {
        animeModule.remove(targets)
        return animeModule.animate(targets, params)
    } catch {
        fallback?.()
        return null
    }
}

async function waitAnimation(animation: unknown) {
    if (!animation) return
    const thenable = animation as { then?: (onfulfilled?: (value: unknown) => unknown, onrejected?: (reason: unknown) => unknown) => unknown }
    if (typeof thenable.then !== 'function') return
    try {
        await (animation as Promise<unknown>)
    } catch {
        return
    }
}

export async function animateShowUp(target: HTMLElement, duration = 480) {
    target.style.opacity = '0'
    target.style.transform = 'translate3d(0, 24px, 0)'
    return withAnime(target, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration,
        easing: 'easeOutCubic',
    }, () => {
        target.style.opacity = '1'
        target.style.transform = ''
    })
}

export async function animateSlideToggle(el: HTMLElement, expand: boolean, duration = 360) {
    const fullHeight = el.scrollHeight
    el.style.overflow = 'hidden'
    el.style.display = 'block'

    const fromHeight = expand ? 0 : fullHeight
    const toHeight = expand ? fullHeight : 0
    const fromOpacity = expand ? 0 : 1
    const toOpacity = expand ? 1 : 0

    const anim = await withAnime(el, {
        height: [fromHeight, toHeight],
        opacity: [fromOpacity, toOpacity],
        duration,
        easing: expand ? 'easeOutCubic' : 'easeInCubic',
    }, () => {
        el.style.display = expand ? 'block' : 'none'
    })

    if (!anim) {
        el.style.height = ''
        el.style.overflow = ''
        return
    }

    await waitAnimation(anim)
    el.style.display = expand ? 'block' : 'none'
    el.style.height = ''
    el.style.opacity = ''
    el.style.overflow = ''
}

export async function animateFooterVisibility(footer: HTMLElement, show: boolean) {
    return withAnime(footer, {
        opacity: show ? [0, 1] : [1, 0],
        translateY: show ? [32, 0] : [0, 32],
        duration: show ? 420 : 280,
        easing: show ? 'easeOutCubic' : 'easeInCubic',
        begin: (): void => {
            if (show) footer.style.display = 'block'
        },
        complete: (): void => {
            if (!show) footer.style.display = ''
        },
    }, () => {
        footer.style.opacity = show ? '1' : '0'
    })
}

export async function animatePreloadOut(preload: HTMLElement, duration = 360) {
    const anim = await withAnime(preload, {
        opacity: [1, 0],
        filter: ['blur(0px)', 'blur(24px)'],
        scale: [1, 1.02],
        duration,
        easing: 'easeInOutCubic',
    }, () => preload.remove())
    if (!anim) return
    await waitAnimation(anim)
    preload.remove()
}

export async function animateModalState(modal: HTMLElement, active: boolean) {
    const content = modal.querySelector('.medal-modal-content') as HTMLElement | null
    if (!content) return
    if (active) modal.style.display = 'flex'
    await withAnime(content, {
        opacity: active ? [0, 1] : [1, 0],
        scale: active ? [0.92, 1] : [1, 0.92],
        translateY: active ? [24, 0] : [0, 24],
        duration: active ? 320 : 220,
        easing: active ? 'easeOutCubic' : 'easeInCubic',
        complete: (): void => {
            if (!active) modal.style.display = ''
        },
    })
}

function initClassMutationAnimations() {
    const observer = new MutationObserver((records) => {
        for (const record of records) {
            if (record.type !== 'attributes' || record.attributeName !== 'class') continue
            const el = record.target as HTMLElement
            if (!el.isConnected) continue

            if (el.classList.contains('post-list-show') || el.classList.contains('show')) {
                void withAnime(el, {
                    opacity: [0, 1],
                    translateY: [16, 0],
                    duration: 260,
                    easing: 'easeOutCubic',
                })
            }
            if (el.classList.contains('hide')) {
                void withAnime(el, {
                    opacity: [1, 0],
                    duration: 180,
                    easing: 'easeInQuad',
                })
            }
            if (el.classList.contains('open')) {
                void withAnime(el, {
                    opacity: [0, 1],
                    scale: [0.96, 1],
                    duration: 220,
                    easing: 'easeOutCubic',
                })
            }
        }
    })

    observer.observe(document.documentElement, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
    })
}