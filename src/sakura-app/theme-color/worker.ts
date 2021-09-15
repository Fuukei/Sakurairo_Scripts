import { kmeans, toPixel } from "palette"
export interface kmeanWorkerData {
    img: ImageData,
    k: number,
    iteration: number
}
import registerPromiseWorker from 'promise-worker/register'
registerPromiseWorker(function (data) {
    const { img, k, iteration } = data as kmeanWorkerData
    const result = kmeans(toPixel(img), k, iteration);
    return result
});