const UA = navigator.userAgent
const reg = /(Firefox|Chrome|Version|Opera|Edg)\/(\d+)/i
const version = UA.match(reg) as [string, VersionName, string];
import { setCookie } from '../common/cookie'

function setAcceptImage() {
    const acceptList = []
    const canvas = document.createElement('canvas')
    if (isSupported({ Chrome: 59, Opera: 46, Firefox: 3, Edg: 79, Version: 8 })) {
        acceptList.push('image/apng')
        if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
            setCookie('su_webp', '1', 114514)
            acceptList.push('image/webp')
            if (isSupported({ Chrome: 85, Opera: 71, Firefox: 93 })) {
                acceptList.push('image/avif')
            }
        }
    }
    return acceptList.reverse().join(',') + ',image/*,*/*;q=0.8'
}
export type VersionName = 'Firefox' | 'Edg' | 'Chrome' | 'Opera' | 'Version'
export type VersionCheck = Partial<Record<VersionName, number>>
export function isSupported(checkList: VersionCheck) {
    return version && checkList[version[1]] /**如果目前还没有版本支持，就填undefined */ && (parseInt(version[2]) >= checkList[version[1]])
}
export const Accept_Image = setAcceptImage()
