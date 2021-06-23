import { cache_style, recover_from_cache, StyleCache, StyleName } from "../../common/style_cache"
function _style_mem(element: HTMLElement, relateStyles: StyleName[], func: (element: HTMLElement) => void) {
    let former_style: StyleCache
    return (turnOn: boolean) => {
        if (turnOn) {
            former_style = cache_style(element, ...relateStyles)
            func(element)
        } else {
            recover_from_cache(element, former_style)
        }
    }
}

export const Dinnerbone = _style_mem(document.documentElement, ['willChange', 'transition', 'transform'],
    (element: HTMLElement) => element.style.cssText = 'willChange:transform;transition:transform 2s;transform:rotateZ(' + 180 * 7 + 'deg);')

export const payRespect = _style_mem(document.documentElement, ['filter'], (element: HTMLElement) => element.style.filter = 'gratscale(1)')

export const ilidilid = _style_mem(document.documentElement, ['willChange', 'transition', 'transform'], (element: HTMLElement) => element.style.cssText = 'willChange:transform;transition:transform 2s;transform:rotateY(' + 180 * 7 + 'deg);')