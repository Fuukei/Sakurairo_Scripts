import { createStore, promisifyRequest } from 'idb-keyval'
const store = createStore('sakurairo', 'cache')
const get = (key: IDBValidKey) => store('readonly', (store) => promisifyRequest(store.get(key)))
const set = (key: IDBValidKey, value: any) => store('readwrite', (store) => {
    store.put(value, key);
    return promisifyRequest(store.transaction);
});
const del = (key: IDBValidKey) => store('readwrite', (store) => {
    store.delete(key);
    return promisifyRequest(store.transaction);
})
export { get, set, del }