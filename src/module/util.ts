export const onlyOnceATime = <T extends Function>(func: T) => {
    let isRunning = false
    return (...args: any) => {
        if (!isRunning) {
            isRunning = true
            func(...args)
            isRunning = false
        }
    }
}
export const max = (a:number,b:number)=>a>b?a:b
export const min = (a:number,b:number)=>a<b?a:b