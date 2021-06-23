export type StyleName = Exclude<keyof CSSStyleDeclaration, 'length' | 'parentRule' | number
    | 'getPropertyPriority' | 'getPropertyValue' | 'item' | 'removeProperty' | 'setProperty' | '__proto__' | 'cssText' | 'cssFloat' | symbol>
export type StyleCache = Array<[StyleName, string]>
export const cache_style = (element: HTMLElement, ...styleNames: StyleName[]): StyleCache =>
    styleNames.map(name => [name, element.style[name]])

export function recover_from_cache(element: HTMLElement, cache: StyleCache) {
    element.style.cssText = element.style.cssText + cache.map(([key, value]) => `${key}:${value};`).join('')
}