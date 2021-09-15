import { awaitImage, KMeansResult, readImageDownsampling, rgbaCSSText } from 'palette'
import PromiseWorker from 'promise-worker';
let worker = new PromiseWorker(new Worker(new URL('./worker.ts', import.meta.url)))
export async function updateThemeSkin({ detail: coverBGUrl }: CustomEvent<string>) {
    const imgElement = document.createElement('img')
    imgElement.src = coverBGUrl
    await awaitImage(imgElement)
    const data = readImageDownsampling(imgElement, 10000)
    const result: KMeansResult = await worker.postMessage({
        k: 3,
        iteration: 20,
        img: data
    })
    const { label, cluster_center } = result
    const max = [...label].sort((a, b) => b - a)[0]
    const index = label.findIndex(value => value == max)
    _updateThemeSkin(rgbaCSSText(cluster_center[index]))
    console.log(result)
}
function _updateThemeSkin(color: string) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]')
    meta && (meta.content = color)
}
export function init() {
    document.addEventListener('coverBG_change', updateThemeSkin as any)
}