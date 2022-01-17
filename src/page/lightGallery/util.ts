import { paramCase, } from 'change-case'

export function solvePluginName(pluginName: string) {
    const fileName = paramCase(pluginName)
    const folderName = pluginName[2].toLowerCase() + pluginName.replace(/^lg\w/, '')
    return `${folderName}/${fileName}`
}
export const handleResult = (result: PromiseSettledResult<any>) => result.status == 'fulfilled' ? result.value.default : console.error('加载lightGallery的插件时出错啦！', result.reason)
