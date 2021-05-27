import { get, set, del } from './cache'
let bgn = 1;
let blob_url = ''
export function nextBG() {
    cleanBlobUrl()
    changeCoverBG(getAPIPath(true))
    bgn++;
}

export function preBG() {
    cleanBlobUrl()
    bgn--;
    changeCoverBG(getAPIPath(true))
}
const centerbg: HTMLElement = document.querySelector(".centerbg")
/**
 * 更改封面背景
 */
export const changeCoverBG =
    centerbg ? (url: string) => {
        centerbg.style.backgroundImage = `url(${url})`
    } : (console.warn(''), () => { })

export function getAPIPath(useBGN = false) {
    const cover_api_url = new URL(mashiro_option.cover_api)
    if (document.body.clientWidth < 860 && mashiro_option.random_graphs_mts == true) {
        cover_api_url.searchParams.set('type', 'mobile')
        return cover_api_url.toString() + (useBGN ? "&" + bgn : '')
    } else {
        return cover_api_url.toString() + (useBGN ? (cover_api_url.search === '' ? "?" : '&') + bgn : '');
    }
}
export async function fetchAndCache() {
    try {
        const resp = await fetch(getAPIPath());
        if (resp.ok) {
            const blob = await resp.blob();
            set('cover', blob);
        }
    } catch (e) {
        if (typeof e == 'object' && e instanceof TypeError) {
            console.warn('你的封面API好像不支持跨域调用,这种情况下缓存是不会生效的哦')
            del('cover')
        }
    }
}
function cleanBlobUrl() {
    URL.revokeObjectURL(blob_url)
    blob_url = ''
}
export async function initCoverBG() {
    if (!mashiro_option.land_at_home) return
    if (mashiro_option.cache_cover) {
        const coverBG = await get('cover')
        if (coverBG) {
            if (typeof coverBG == 'object' && coverBG instanceof Blob) {
                cleanBlobUrl()
                blob_url = URL.createObjectURL(coverBG)
                changeCoverBG(blob_url)
            }
        } else {
            //fallback
            changeCoverBG(getAPIPath())
        }
        fetchAndCache()
    } else {
        changeCoverBG(getAPIPath())
    }
}