const UA = navigator.userAgent
const reg = UA.indexOf('Chrome') != -1 ? /(Chrome)\/(\d+)/i : /(Firefox|Chrome|Version|Opera)\/(\d+)/i
const version = UA.match(reg);
export type VersionName = 'Firefox' | 'Edge' | 'Chrome' | 'Opera' | 'Version'
export type VersionCheck = Record<VersionName | string, number>
export function isSupported(checkList: VersionCheck) {
    return version && (parseInt(version[2]) >= checkList[version[1]])
}