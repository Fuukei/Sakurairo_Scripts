let readyFunctionList: Function[] = []

/**
 * 传入的函数同时间只能运行一个
 * @param func 要包装的函数
 * @returns 包装后的函数
 */
export const onlyOnceATime = <T extends Function>(func: T) => {
    let isRunning = false
    return (...args: any) => {
        if (!isRunning) {
            isRunning = true
            try {
                const result = func(...args)
                if (result instanceof Promise) {
                    result.finally(() => isRunning = false)
                } else {
                    isRunning = false
                }
                return result
            } catch (e) {
                console.warn(e)
                isRunning = false
            }
        }
    }
}
const whileReady = () => {
    document.removeEventListener('DOMContentLoaded', whileReady)
    for (const fn of readyFunctionList) {
        fn()
    }
    readyFunctionList = []
}
/**
 * 延迟函数到DOM树加载完成后执行
 * @seealso https://developer.mozilla.org/zh-CN/docs/Web/API/Document/readyState
 * @param fn 要延迟执行的函数
 */
export const ready = function (fn: Function) {
    //interactive:等价于事件DOMContentLoaded
    //complete:等价于事件load
    if (document.readyState !== 'loading') {
        return fn();
    }
    if (readyFunctionList.length == 0) {
        document.addEventListener('DOMContentLoaded', whileReady, false);
    }
    readyFunctionList.push(fn)
};

/**
 * 获取文件名的主名部分（即去除扩展名）
 * @param fileName 文件名
 * @returns 主名
 */
export const getFileNameMain = (fileName: string) => fileName.replace(/\.\w+$/, '')
export function slideToggle(el: any, duration = 1000, mode = '', callback?: () => void) {
    let dom = el;
    dom.status = dom.status || getComputedStyle(dom, null)['display'];
    const flag = dom.status != 'none';
    if ((flag == true && mode == "show") || (flag == false && mode == "hide")) return;
    dom.status = flag ? 'none' : 'block';
    dom.style.transition = 'height ' + duration / 1000 + 's';
    dom.style.overflow = 'hidden';
    clearTimeout(dom.tagTimer);
    dom.tagTimer = dom.tagTimer || null;
    dom.style.display = 'block';
    dom.tagHeight = dom.tagHeight || dom.clientHeight + 'px';
    dom.style.display = '';
    dom.style.height = flag ? dom.tagHeight : "0px";
    setTimeout(() => {
        dom.style.height = flag ? "0px" : dom.tagHeight
    }, 0);
    dom.tagTimer = setTimeout(() => {
        dom.style.display = flag ? 'none' : 'block';
        dom.style.transition = '';
        dom.style.overflow = '';
        dom.style.height = '';
        dom.status = dom.tagHeight = null;
    }, duration);
    if (callback) callback();
}
export function buildAPI(apiPath: string, params: Record<string, string> = {}, nonce: boolean = true) {
    const path = new URL(apiPath)
    const { searchParams } = path
    for (const [key, value] of Object.entries(params)) {
        searchParams.set(key, value)
    }
    if (nonce) searchParams.set("_wpnonce", Poi.nonce)
    return path.toString()
}