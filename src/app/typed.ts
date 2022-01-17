import { importExternal } from '../common/npmLib'
declare global {
    interface Window {
        Typed: any
    }
}
let typedInstance: import('typed.js').default
export function disableTypedJsIfExist() {
    if (typedInstance) {
        typedInstance.destroy()
        typedInstance = null
    }
}
export default async function initTypedJs() {
    const json = document.getElementById('typed-js-initial')
    if (json) {
        try {
            const options = JSON.parse(json.innerHTML)
            const element = document.querySelector<HTMLElement>('.element')
            element.innerText = ''
            if (mashiro_option.ext_shared_lib) {
                if (!window.Typed) await importExternal('lib/typed.min.js', 'typed.js')
                typedInstance = new window.Typed(element, options)

            } else {
                const { default: Typed } = await import('typed.js')
                typedInstance = new Typed(element, options)
            }
        } catch (e) {
            console.error("请检查typed.js设置", e)
        }
    }
}