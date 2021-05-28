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
export const max = (a: number, b: number) => a > b ? a : b
export const min = (a: number, b: number) => a < b ? a : b