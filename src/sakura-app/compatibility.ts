const UA = navigator.userAgent
const version = UA.match(reg);
export type VersionName = 'Firefox' | 'Edge' | 'Chrome' | 'Opera' | 'Version'
export type VersionCheck = Record<VersionName | string, number>
const reg = /(Firefox|Chrome|Version|Opera|Edg)\/(\d+)/i
export function isSupported(checkList: VersionCheck) {
    return version && checkList[version[1]] /**如果目前还没有版本支持，就填undefined */ && (parseInt(version[2]) >= checkList[version[1]])
}
export const Accept_Image = setAcceptImage()
console.log(Accept_Image)