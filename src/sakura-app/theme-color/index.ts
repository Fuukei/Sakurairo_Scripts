import { awaitImage, KMeansResult, labaToRGBA, readImageDownsampling, rgbaCSSText, } from '@kotorik/palette'
import PromiseWorker from 'promise-worker';
let worker: PromiseWorker
export async function updateThemeSkin(coverBGUrl: string) {
    try {
        const imgElement = document.createElement('img')
        imgElement.src = coverBGUrl
        await awaitImage(imgElement)
        const data = readImageDownsampling(imgElement, 10000)
        const result: KMeansResult = await worker.postMessage({
            k: 3,
            iteration: 20,
            img: data
        })
        const { label, centroid } = result
        const max = Math.max(...label)
        const index = label.findIndex(value => value == max)
        _updateThemeSkin(rgbaCSSText(labaToRGBA(centroid[index])))
    } catch (error) {
        console.error(error)
        _updateThemeSkin(getComputedStyle(document.documentElement).getPropertyValue('--theme-skin-matching'))//回滚
    }
}
function _updateThemeSkin(color_css: string) {
    //TODO: 暗色模式支持
    const metaLight = document.querySelector<HTMLMetaElement>('meta[name=theme-color][media="(prefers-color-scheme: light)"]')
    /*     const metaDark = document.querySelector<HTMLMetaElement>('meta[name=theme-color][media="(prefers-color-scheme: dark)"]')
        const [h,s,l,a] = rgbaToHSLA(color) */

    metaLight && (metaLight.content = color_css)
/*     metaDark && (metaDark.content = hslaCSSText([h,s,l,a]))
 */}
export function initThemeColor() {
    if (!worker) worker = new PromiseWorker(new Worker(new URL('./worker.ts', import.meta.url)))
    document.addEventListener('coverBG_change', (({ detail: coverBGUrl }: CustomEvent<string>) => updateThemeSkin(coverBGUrl)) as any)
}