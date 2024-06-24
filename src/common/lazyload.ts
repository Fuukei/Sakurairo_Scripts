import Lazyload from 'lazyload'
let instance: Lazyload
export default function lazyload() {
    if(instance){
        instance.destroy()
    }
    instance = new Lazyload()
}