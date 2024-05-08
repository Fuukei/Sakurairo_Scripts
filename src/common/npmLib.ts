import { ready } from "./util"

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
    ["https://jsd.nmxc.ltd/npm/", "@", "/", ""],
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
 * @param version npm包版本，默认为latest
 * @returns 从当前cdn访问该文件的url
 */
export const resolvePath = (relativePath: string, packageName: string, version: string) => String.raw(currentCDN, packageName, version || PKG_INFO[packageName] || 'latest', relativePath)
const resolvePathByCDN = (cdn: Array<string>, relativePath: string, moduleName: string, version: string) => String.raw({ raw: cdn }, moduleName, version, relativePath)

function isServedByCurrentCDN(path: string) {
    const cdnMatchKey = CDN_LIST[currentCDNIndex][0]
    if (path.match(cdnMatchKey)) {
        return true
    }
}
function analyze(time = 30000) {
    let failedCounts = 0
    let totalCounts = 0
    const observer = new PerformanceObserver((list, observer) => {
        for (const entry of list.getEntries()) {
            if (isServedByCurrentCDN(entry.name)) {
                totalCounts++
                const { transferSize } = entry as PerformanceResourceTiming
                if (transferSize == 0) {
                    //可能是资源未能成功下载
                    failedCounts++
                }
            }
        }
    })
    observer.observe({ entryTypes: ['resource'] })
    setTimeout(() => {
        observer.disconnect()
        if (failedCounts / totalCounts > 0.7) {
            //切换cdn
            const nextCDN = currentCDNIndex + 1
            localStorage.setItem(STORAGE_KEY, (nextCDN >= CDN_LIST.length ? 0 : nextCDN).toString())
        }
    }, time)
}
/* ready(analyze)
 */
//TODO
//测试cdn对实例资源的访问表现
async function testCDN() {
    await Promise.allSettled(CDN_LIST.map((cdn) =>
        //baguettebox.js@1.11.1/dist/baguetteBox.min.css
        fetch(resolvePathByCDN(cdn, 'dist/baguetteBox.min.css', 'baguettebox.js', '1.11.1'))
    ))

}
export const importExternal = (path: string, packageName: string, version?: string) => {
    const id = `${packageName}${version ? '@' + version : ''}`
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