/* import sys_call from './_sys_call'
 */export interface SakurairoOption_WebAudio {
    main_gain?: number
    notes?: string | Array<number>
}
export interface SakurairoOption {
    web_audio?: SakurairoOption_WebAudio
}
export type WhileListenerEventName = 'pjaxComplete' | 'ready' /* | 'load' */
export type WhileListenerCallback = () => Promise<void> | void
export type WhileMap = Map<WhileListenerEventName, Set<WhileListenerCallback>>
export type WhileFunction = (eventName: WhileListenerEventName, cb: WhileListenerCallback) => void
export interface SakurairoGlobal {
    opt: SakurairoOption
    on: WhileFunction
/*     _sys_call:typeof sys_call
 */}
const _map: WhileMap = new Map([['pjaxComplete', new Set()], ['ready', new Set()]/* , ['load', new Set()] */])
function _getListenerList(eventName: WhileListenerEventName) {
    const listener_list = _map.get(eventName)
    if (listener_list) {
        return listener_list
    } else {
        throw new TypeError('[Sakurairo] unknown name.')
    }
}
export function dispatch(eventName: WhileListenerEventName) {
    const list = _getListenerList(eventName)
    return Promise.all(Array.from(list.values()).map(cb => cb()))
}
export const on: WhileFunction = (eventName, cb) => {
    _getListenerList(eventName).add(cb)
}
const sakurairoGlobal: SakurairoGlobal = {
    opt: {},
    on,
/*     _sys_call:sys_call
 */}

if ('_sakurairo' in window) {
    //@ts-ignore
    const _sakurairo = window._sakurairo
    if ('opt' in _sakurairo) {
        sakurairoGlobal.opt = _sakurairo.opt
    }
}
//@ts-ignore
window._sakurairo = sakurairoGlobal