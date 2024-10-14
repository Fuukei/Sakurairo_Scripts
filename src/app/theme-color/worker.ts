import registerPromiseWorker from '@kotorik/promise-worker/register'
import { ThemeColorWorkerReq } from './interface';
import neuquantCalc from './calc';
registerPromiseWorker<ThemeColorWorkerReq>(neuquantCalc);