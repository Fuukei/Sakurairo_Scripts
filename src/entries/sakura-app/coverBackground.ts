import { get, set, del } from './cache'
let bgn = 1;
let blob_url = ''
export async function nextBG() {
    cleanBlobUrl()
    changeCoverBG(await getCoverPath(true))
    bgn++;
}

export async function preBG() {
    cleanBlobUrl()
    bgn--;
    changeCoverBG(await getCoverPath(true))
}
const centerbg: HTMLElement = document.querySelector(".centerbg")
/**
 * 更改封面背景
 */
const changeCoverBG = mashiro_option.site_bg_as_cover ? (url: string) => {
    document.body.style.backgroundImage = `url(${url})`
} :
    centerbg ? (url: string) => {
        centerbg.style.backgroundImage = `url(${url})`
    } : () => { }

function getAPIPath(useBGN = false) {
    const cover_api_url = new URL(mashiro_option.cover_api)
    if (document.body.clientWidth < 860 && mashiro_option.random_graphs_mts == true) {
        cover_api_url.searchParams.set('type', 'mobile')
        return cover_api_url.toString() + (useBGN ? "&" + bgn : '')
    } else {
        return cover_api_url.toString() + (useBGN ? (cover_api_url.search === '' ? "?" : '&') + bgn : '');
    }
}
export const getCoverPath = mashiro_option.cache_cover ? async (useBGN = false) => {
    return get('cover').then(coverBG => {
        if (coverBG) {
            if (typeof coverBG == 'object' && coverBG instanceof Blob) {
                cleanBlobUrl()
                blob_url = URL.createObjectURL(coverBG)
                return blob_url
            }
        } else {
            //fallback
            return getAPIPath(useBGN)
        }
    }).finally(() => {
        fetchAndCache(useBGN)
    })
} : getAPIPath
async function fetchAndCache(useBGN = false) {
    try {
        const resp = await fetch(getAPIPath(useBGN));
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
    if (mashiro_option.site_bg_as_cover) {
        centerbg.style.background = '#0000'
        if (localStorage.getItem('bgImgSetting') !== 'white-bg') {
            return
        }
    } else if (!mashiro_option.land_at_home) return //防止.centerbg在非主页加载图片

    changeCoverBG(await getCoverPath())
}