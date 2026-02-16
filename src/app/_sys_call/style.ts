import { cache_style, recover_from_cache, StyleCache, StyleName } from "../../common/style_cache"
import { loadAnime } from "../animations/anime_runtime"
function _style_mem(element: HTMLElement, relateStyles: StyleName[], func: (element: HTMLElement) => void) {
    let former_style: StyleCache
    return (turnOn: boolean): void => {
        if (turnOn) {
            former_style = cache_style(element, ...relateStyles)
            func(element)
        } else {
            recover_from_cache(element, former_style)
        }
    }
}

function _style_mem_animated(
    element: HTMLElement,
    relateStyles: StyleName[],
    animationParams: Record<string, unknown>,
) {
    let former_style: StyleCache
    return (turnOn: boolean): void => {
        if (turnOn) {
            former_style = cache_style(element, ...relateStyles)
            element.style.willChange = 'transform'
            void loadAnime().then((anime): void => {
                anime.remove(element)
                anime.animate(element, {
                    ...animationParams,
                    complete: (): void => {
                        element.style.willChange = ''
                    },
                })
            }).catch((): void => {
                element.style.willChange = ''
            })
        } else {
            recover_from_cache(element, former_style)
            void loadAnime().then((anime): void => {
                anime.remove(element)
            }).catch((): void => {
                return
            })
        }
    }
}

export const Dinnerbone = _style_mem_animated(document.documentElement, ['willChange', 'transform'], {
    rotateZ: [0, 180 * 7],
    duration: 2000,
    easing: 'easeInOutCubic',
})

export const payRespect = _style_mem(document.documentElement, ['filter'], (element: HTMLElement): void => {
    element.style.filter = 'gratscale(1)'
})

export const ilidilid = _style_mem_animated(document.documentElement, ['willChange', 'transform'], {
    rotateY: [0, 180 * 7],
    duration: 2000,
    easing: 'easeInOutCubic',
})