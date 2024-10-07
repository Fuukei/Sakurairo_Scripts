import PromiseWorker from '@kotorik/promise-worker';
import { isInDarkMode } from '../darkmode';
//@ts-ignore
import 'color-space/hsl'
//@ts-ignore
import rgb from 'color-space/rgb'
import { ThemeColorWorkerReq, ThemeColorWorkerResp } from './interface';
import { awaitImage, readImageDownsampling, Vector4 } from '@kotorik/palette';
const originalThemeSkinMatcing = getComputedStyle(document.documentElement).getPropertyValue('--theme-skin-matching')
const worker: PromiseWorker<ThemeColorWorkerReq, ThemeColorWorkerResp> = new PromiseWorker(new Worker(new URL('./worker.ts', import.meta.url)))
let currentColor = [0, 0, 0, 0] as Vector4
function hslaCSSText([h, s, l, a]: readonly [number, number, number, number?]) {
    if (a) {
        return "hsla(" + h + "deg," + s + "%," + l + "%," + a + ")"
    } else {
        return "hsl(" + h + "deg," + s + "%," + l + "%)"
    }
}

export async function getThemeColorFromImageElement(imgElement: HTMLImageElement): Promise<Vector4> {
    try {
        await awaitImage(imgElement)
        const imageData = readImageDownsampling(imgElement, 10000)
        const result = await worker.postMessage(imageData.data, { transfer: [imageData.data.buffer] })
        return result
    } catch (e) {
        console.error(e)
        return null
    }
}
function _updateThemeColorMeta(color_css: string) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');
    meta && (meta.content = color_css)
}
export async function updateThemeSkin(coverBGUrl: string) {
    const imgElement = document.createElement('img')
    imgElement.src = coverBGUrl
    imgElement.crossOrigin = "anonymous";

    const rgba = await getThemeColorFromImageElement(imgElement)
    if (rgba) {
        currentColor = rgba
        _setColor()
    } else {
        _updateThemeColorMeta(originalThemeSkinMatcing)//回滚
    }
}
function _setColor(darkmode?: boolean) {
    let hsla = rgb.hsl(currentColor) as Vector4
    const darkmodeColor = [...hsla] as Vector4
    darkmodeColor[2] *= 0.5
    if (typeof darkmode == 'undefined' ? isInDarkMode() : darkmode) {
        hsla = darkmodeColor
    }
    _updateThemeColorMeta(hslaCSSText(hsla))
    if (_iro.extract_theme_skin) {
        document.documentElement.style.setProperty('--theme-skin-matching', hslaCSSText(hsla))
        document.documentElement.style.setProperty('--theme-skin-dark', hslaCSSText(darkmodeColor))
    }
    /*     const textColor = [0, 0, 0] as [number, number, number]
    
        if (hsla[2] > 40) {
            textColor[2] = 0.314
        } else {
            textColor[2] = 1 - 0.314
        }
    
        const style = document.documentElement.style
        const [h, s, l] = hsla
        style.setProperty('--header-color-h', h + 'deg')
        style.setProperty('--header-color-s', s + '%')
        style.setProperty('--header-color-l', l + '%')
    
        const siteHeader = document.querySelector<HTMLDivElement>('.site-header')
        siteHeader.style.color = hslaCSSText(textColor)
     */
}

export function initThemeColor() {
    document.addEventListener('coverBG_change', (({ detail: coverBGUrl }: CustomEvent<string>) => updateThemeSkin(coverBGUrl)) as any)
    document.addEventListener('darkmode', (({ detail: next }: CustomEvent<boolean>) => _setColor(next)) as any)
}

export function getForeground(rgba: Vector4) {
    const hsla = rgb.hsl(rgba)
    if (hsla[2] > 40) {
        return [0, 0, 0, 1] as Vector4
    }
    return [0, 100, 100, 1] as Vector4
}

export function getHighlight(rgba: Vector4) {
    const hsla = rgb.hsl(rgba)
    hsla[2] = Math.min(100, hsla[2] * 1.1)
    return hsla
}