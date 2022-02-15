let cache_is_mobile = false
export function initIsMobileCache() {
    const mediaQuery = window.matchMedia('(max-width:860px)')
    cache_is_mobile = mediaQuery.matches
    mediaQuery.addEventListener ? mediaQuery.addEventListener('change', refreshIsMobileCache) : mediaQuery.addListener(refreshIsMobileCache)
}
function refreshIsMobileCache(ev: MediaQueryListEvent) {
    cache_is_mobile = ev.matches
}
/**
 * 
 * @returns 返回document.body.clientWidth <= 860的结果。这个结果是缓存的
 */
export const isMobile = () => cache_is_mobile