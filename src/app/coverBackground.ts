import { get, set, del } from './cache'
import { Accept_Image } from './compatibility';
import { __ } from '../common/sakurairo_global';
let bgn = 1;
let blob_url = ''
export async function nextBG() {
    changeCoverBG(await getCoverPath(true))
    bgn++;
}

export async function preBG() {
    bgn--;
    changeCoverBG(await getCoverPath(true))
}
const centerbg = document.querySelector<HTMLElement>(".centerbg")
/**
 * 更改封面背景
 */
export const changeCoverBG = mashiro_option.site_bg_as_cover ? (url: string) => {
    document.body.style.backgroundImage = `url(${url})`
    document.dispatchEvent(new CustomEvent('coverBG_change', { detail: url }))
} :
    centerbg ? (url: string) => {
            centerbg.style.backgroundImage = `url(${url})`
            document.dispatchEvent(new CustomEvent('coverBG_change', { detail: url }))
    } : () => { }
function parseCSSUrl(cssText?: string) {
    const result = cssText?.match(/^url\("(.+)"\)$/)
    if (result) {
        return result[1]
    }
}
/**
 * 返回当前封面背景的URL
 */
export const getCurrentBG = mashiro_option.site_bg_as_cover ? () => parseCSSUrl(document.body.style.backgroundImage) :
    () => parseCSSUrl(centerbg.style.backgroundImage)

function getAPIPath(useBGN = false) {
    const cover_api_url = new URL(mashiro_option.cover_api)
    if (document.body.clientWidth < 860 && mashiro_option.random_graphs_mts == true) {
        cover_api_url.searchParams.set('type', 'mobile')
        return cover_api_url.toString() + (useBGN ? "&" + bgn : '')
    } else {
        return cover_api_url.toString() + (useBGN ? (cover_api_url.search === '' ? "?" : '&') + bgn : '');
    }
}
export const getCoverPath = mashiro_option.cache_cover ? (useBGN = false) =>
    get('cover').then(coverBG => {
        if (coverBG && coverBG instanceof ArrayBuffer) {
            cleanBlobUrl()
            blob_url = URL.createObjectURL(new Blob([coverBG]))
            return blob_url
        } else {
            //fallback
            return getAPIPath(useBGN)
        }
    }).finally(() => {
        fetchAndCache(useBGN)
    })
    : getAPIPath
async function fetchAndCache(useBGN = false) {
    try {
        const resp = await fetch(getAPIPath(useBGN), { headers: { Accept: Accept_Image } });
        if (resp.ok) {
            const buf = await resp.arrayBuffer();
            try {
                set('cover', buf);
                /**
                 * @problem Safari暂时不支持indexdb存储blob
                 * DataCloneError: Failed to store record in an IDBObjectStore: BlobURLs are not yet supported.
                 * @seealso https://developers.google.com/web/fundamentals/instant-and-offline/web-storage/indexeddb-best-practices#keeping_your_app_predictable
                 */
            } catch (e) {
                //catch: FireFox无痕模式下数据库不允许修改
                /**
                 * @problem FireFox无痕模式下数据库不允许修改
                 * DOMException: A mutation operation was attempted on a database that did not allow mutations
                 * Chrome不会报错
                 * 像是火狐的设计 https://wiki.mozilla.org/Private_Browsing#Persistent_Storage
                 * 变通方法 https://bugzilla.mozilla.org/show_bug.cgi?id=1639542#c9
                */
                console.warn(e)
            }
        }
    } catch (e) {
        if (e instanceof TypeError) {
            console.warn(__('你的封面API好像不支持跨域调用,这种情况下缓存是不会生效的哦'))
            del('cover')
        }
    }
}
function cleanBlobUrl() {
    URL.revokeObjectURL(blob_url)
    blob_url = ''
}
/* export function initCoverBG() {
    if (mashiro_option.site_bg_as_cover) {
        if (centerbg) centerbg.style.background = '#0000'
    }
} */