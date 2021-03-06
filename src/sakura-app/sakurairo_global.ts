/* import sys_call from './_sys_call'
 */export interface SakurairoOption_WebAudio {
    main_gain?: number
    /**
     * 乐谱🎼
     */
    sheet?: string | Array<number>
}
export interface SakurairoOption {
    web_audio?: SakurairoOption_WebAudio
}
export type WhileListenerEventName = 'pjaxComplete' | 'ready' /* | 'load' */ | 'pjaxSuccess'//pjaxSuccess的触发顺序在pjaxComplete之后
export type WhileListenerCallback = () => Promise<void> | void
export type WhileMap = Map<WhileListenerEventName, Set<WhileListenerCallback>>
export type WhileFunction = (eventName: WhileListenerEventName, cb: WhileListenerCallback) => void
export type I18nFunction = (defaultStr: string) => string
export interface SakurairoGlobal {
    opt: SakurairoOption
    __: I18nFunction
/*     _sys_call:typeof sys_call
 */}
/**
 * 
 * @param key 这段句子的中文表述（默认语言）
 */
//@ts-ignore
export const __ = (defaultStr: string) => (window._sakurairoi18n && _sakurairoi18n[defaultStr]) || defaultStr
/**
 * 
 * 占位符格式 {index} ex.{0}
 * @param defaultStr 这段句子的中文表述（默认语言）
 * @param replacements 句子中占位符的替代元素
 */
export const _$ = (defaultStr: string, ...replacements: string[]) => {
    let template = __(defaultStr)
    for (const index in replacements) {
        template = template.replace('{' + index + '}', replacements[index])
    }
    return template
}
export type SakurairoI18n  = Record<string, string>

export const sakurairoGlobal: SakurairoGlobal = {
    opt: {},
    __
/*     _sys_call:sys_call
 */}

if ('_sakurairo' in window) {
    //@ts-ignore
    const _sakurairo = window._sakurairo
    if ('opt' in _sakurairo) {
        sakurairoGlobal.opt = _sakurairo.opt
    }
}
declare const _sakurairoi18n:SakurairoI18n
//@ts-ignore
window._sakurairo = sakurairoGlobal