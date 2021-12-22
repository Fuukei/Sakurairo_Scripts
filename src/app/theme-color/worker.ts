import { kmeans, convertToLab } from "@kotorik/palette"
export interface kmeanWorkerData {
    img: ImageData,
    k: number,
    iteration: number
}
import registerPromiseWorker from 'promise-worker/register'
registerPromiseWorker((data) => {
    const { img, k, iteration } = data as kmeanWorkerData
    const result = kmeans(convertToLab(img.data), k, iteration);
    return result
});