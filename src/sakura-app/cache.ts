import {createStore,get as idbget,set as idbset,del as idbdel} from 'idb-keyval'
const store = createStore('sakurairo','cache')
const get = (key:IDBValidKey)=>idbget(key,store)
const set = (key:IDBValidKey,value: any)=>idbset(key,value,store)
const del = (key: IDBValidKey)=>idbdel(key,store)
export {get,set,del}