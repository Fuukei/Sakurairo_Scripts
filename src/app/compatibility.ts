const UA = navigator.userAgent

/**
 * 关于AppleWebkit与Safari版本的对应，参考：
 * @seealso https://gist.github.com/jakub-g/48a16195280a7023f570ffa5c8a4eae5
 * @seealso https://en.wikipedia.org/wiki/Safari_version_history
 * 
 * Opera浏览器自15以来更换了User Agent
 * OPR/*
 */
const uaMatches = Array.from(UA.matchAll(/(Firefox|Chrome|Version|OPR|Edg)\/(\d+)/ig)) as [string,VersionName,string][];
import { setCookie } from '../common/cookie'

function setAcceptImage() {
    const acceptList = ['image/*,*/*;q=0.8']
    if (isSupported({ Chrome: 59, OPR: 46, Firefox: 3, Edg: 79, Version: 8/**Safari 8 */ })) {
        acceptList.push('image/apng')
        if (isSupported({ Chrome: 32, OPR: 19, Firefox: 65, Edg: 18, Version: 14/**Safari 14 */ })) {
            setCookie('su_webp', '1', 114514)
            acceptList.push('image/webp')
            if (isSupported({ Chrome: 85, OPR: 71, Firefox: 93 })) {
                acceptList.push('image/avif')
            }
        }
    }
    return acceptList.reverse().join(',')
}
export type VersionName = 'Firefox' | 'Edg' | 'Chrome' | 'OPR' | 'Version'
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
