import { awaitImage, KMeansResult, readImageDownsampling, Vector4, } from '@kotorik/palette'
import PromiseWorker from 'promise-worker';
import { isInDarkMode } from '../darkmode';
//@ts-ignore
import 'color-space/hsl'
//@ts-ignore
import rgb from 'color-space/rgb'
let worker: PromiseWorker
let currentColor: Vector4
function hslaCSSText([h, s, l, a]: readonly [number, number, number, number?]) {
    if (a) {
        return "hsla(" + h + "deg," + s + "%," + l + "%," + a + ")"
    } else {
        return "hsl(" + h + "deg," + s + "%," + l + "%)"
    }
}
export async function updateThemeSkin(coverBGUrl: string) {
    try {
        const imgElement = document.createElement('img')
        imgElement.src = coverBGUrl
        await awaitImage(imgElement)
        const data = readImageDownsampling(imgElement, 10000)
        const result: KMeansResult = await worker.postMessage({
            k: 8,
            //iteration: 20,
            img: data
        })
        const { label, centroid } = result
        const max = Math.max(...label)
        const index = label.findIndex(value => value == max)
        currentColor = centroid[index]
        _setColor()
    } catch (error) {
        console.error(error)
        _updateThemeColor(getComputedStyle(document.documentElement).getPropertyValue('--theme-skin-matching'))//回滚
    }
}
function _setColor(darkmode?: boolean) {
    const hsla = rgb.hsl(currentColor)
    if (typeof darkmode == 'undefined' ? isInDarkMode() : darkmode) hsla[2] *= 0.5
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
    _updateThemeColor(hslaCSSText(hsla))
}
function _updateThemeColor(color_css: string) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');
    meta && (meta.content = color_css)
}
export function initThemeColor() {
    if (!worker) worker = new PromiseWorker(new Worker(new URL('./worker.ts', import.meta.url)))
    document.addEventListener('coverBG_change', (({ detail: coverBGUrl }: CustomEvent<string>) => updateThemeSkin(coverBGUrl)) as any)
    document.addEventListener('darkmode', (({ detail: next }: CustomEvent<boolean>) => _setColor(next)) as any)
}