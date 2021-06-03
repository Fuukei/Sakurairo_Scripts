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
/**
 * 延迟函数到DOM树加载完成后执行
 * @seealso https://developer.mozilla.org/zh-CN/docs/Web/API/Document/readyState
 * @param fn 要延迟执行的函数
 */
export const ready = function (fn:Function) {
    //interactive:等价于事件DOMContentLoaded
    //complete:等价于事件load
    if (document.readyState !== 'loading') {
        return fn();
    }
    //@ts-ignore
    document.addEventListener('DOMContentLoaded', fn, false);
};
export const max = (a: number, b: number) => a > b ? a : b
export const min = (a: number, b: number) => a < b ? a : b