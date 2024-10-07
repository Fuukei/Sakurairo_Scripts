import { neuquant } from '@kotorik/palette'

import registerPromiseWorker from '@kotorik/promise-worker/register'
import { ThemeColorWorkerReq } from './interface';
registerPromiseWorker<ThemeColorWorkerReq>((req) => {
    const { label, centroid } = neuquant(req, 8)
    const max = Math.max(...label)
    const index = label.findIndex(value => value == max)
    return centroid[index]
});