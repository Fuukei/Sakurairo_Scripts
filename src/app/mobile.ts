import debounce from '@mui/utils/debounce'
let cache_is_mobile = false
export function initIsMobileCache() {
    window.addEventListener('resize', debounce(refreshIsMobileCache))
    refreshIsMobileCache()
}
export function refreshIsMobileCache() {
    cache_is_mobile = document.body.clientWidth <= 860
}
/**
 * 
 * @returns 返回document.body.clientWidth <= 860的结果。这个结果是缓存的
 */
export const isMobile = () => cache_is_mobile