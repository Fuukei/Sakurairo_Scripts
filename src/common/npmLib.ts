/**
 * 收集资源的下载情况，自动切换cdn
 * 策略：
 * 1.如果发现大量资源无法下载（cdn down），尝试切换cdn
 * 2.切换cdn时测试对同一个资源访问的表现(未实现)
 * 3.
 * 暂不根据加载速度动态调整cdn
 * TODO: 使用内置依赖的fallback
 */
const STORAGE_KEY = 'sakurairo_prefer_cdn'
const CDN_LIST = [
    /*     ["https://jscdn.host/release/ucode/", "/", "/", ""],
        ["https://cdnjs.cloudflare.com/ajax/libs/", "/", "/", ""],
     */
    ["https://cdn.jsdelivr.net/npm/", "@", "/", ""],
    ["https://unpkg.com/", "@", "/", ""],
    //TODO:自定cdn
]
function getPreferCDNIndex() {
    const config = localStorage.getItem(STORAGE_KEY)
    if (config) {
        const num = parseInt(config)
        if (isNaN(num) || num >= CDN_LIST.length) {
            //回归初始值
            localStorage.removeItem(STORAGE_KEY)
            return 0
        }
        return num
    } else {
        return 0
    }
}
const currentCDNIndex = getPreferCDNIndex()
const currentCDN = { raw: CDN_LIST[currentCDNIndex] }
/**
 * 从当前的CDN中获取指定npm包中的指定文件
 * @author KotoriK
 * @param relativePath 文件在npm包中的路径
 * @param packageName npm包名
 * @param version npm包版本，默认从package.json中获取依赖版本（注意package_info.js中有限定哪些包的信息会被带到运行时），若无相关信息则为latest
 * @returns 从当前cdn访问该文件的url
 */
export const resolvePath = (relativePath: string, packageName: string, version?: string) => String.raw(currentCDN, packageName, version || PKG_INFO[packageName] || 'latest', relativePath)

export const importExternal = (path: string, packageName: string, version?: string) => {
    const id = `${packageName}${version ? '@' + version : ''}${path}`
    if (document.getElementById(id)) { // 避免重复加载
        return Promise.resolve()
    }
    const script = document.createElement('script')
    script.id = id
    script.src = resolvePath(path, packageName, version)
    script.async = true
    //TODO: 超时处理
    return new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = () => {
            script.remove() // 允许下次尝试
            reject(new Error(packageName + "加载失败"))
        }
        document.body.append(script)
    }).finally(() => {
        script.onload = script.onerror = null//据说ie上会内存泄露
    })
}