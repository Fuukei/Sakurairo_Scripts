const UA = navigator.userAgent

/**
 * 关于AppleWebkit与Safari版本的对应，参考：
 * @seealso https://gist.github.com/jakub-g/48a16195280a7023f570ffa5c8a4eae5
 * @seealso https://en.wikipedia.org/wiki/Safari_version_history
 * 
 * Opera浏览器自15以来更换了User Agent
 * OPR/*
 */
const reg = /(Firefox|Chrome|AppleWebkit|OPR|Edg)\/(\d+)/i
const uaMatches = UA.matchAll(reg) as IterableIterator<[string, VersionName, string]>;
import { setCookie } from '../common/cookie'

function setAcceptImage() {
    const acceptList = []
    if (isSupported({ Chrome: 59, OPR: 46, Firefox: 3, Edg: 79, AppleWebkit: 600/**Safari 8 */ })) {
        acceptList.push('image/apng')
        if (isSupported({ Chrome: 32, OPR: 19, Firefox: 65, Edg: 18, AppleWebkit: 605/**Safari 14 */ })) {
            setCookie('su_webp', '1', 114514)
            acceptList.push('image/webp')
            if (isSupported({ Chrome: 85, OPR: 71, Firefox: 93 })) {
                acceptList.push('image/avif')
            }
        }
    }
    return acceptList.reverse().join(',') + ',image/*,*/*;q=0.8'
}
export type VersionName = 'Firefox' | 'Edg' | 'Chrome' | 'OPR' | 'AppleWebkit'
export type VersionCheck = Partial<Record<VersionName, number>>
export function isSupported(checkList: VersionCheck) {
    for (const [_, name, version] of uaMatches) {
        if (parseFloat(version) >= checkList[name]) {
            return true
        }
    }
    return false
}
export const Accept_Image = setAcceptImage()
