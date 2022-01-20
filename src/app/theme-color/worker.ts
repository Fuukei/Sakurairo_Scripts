import { neuquant } from "@kotorik/palette"
/* import { Buffer } from 'buffer'
self.Buffer = Buffer */
export interface kmeanWorkerData {
    img: ImageData,
    k: number,
    iteration: number
}
import registerPromiseWorker from 'promise-worker/register'
registerPromiseWorker((data) => {
    const { img, k } = data as kmeanWorkerData
    const result = neuquant(img.data, k);
    return result
});