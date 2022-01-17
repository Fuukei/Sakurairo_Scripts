//@ts-ignore
import lightGallery from 'lightgallery/lib/index.js'
import { LightGallerySettings } from 'lightgallery/lg-settings'
import 'lightgallery/css/lightgallery-bundle.min.css'
import { handleResult, solvePluginName } from './util'
export interface LightGalleryOptions extends Omit<LightGallerySettings, 'plugins'> {
    plugins?: string[]
};
export default async function initLightGallery() {
    const { plugins, ...opts } = mashiro_option.lightGallery as LightGalleryOptions

    lightGallery(
        document.querySelector('.entry-content'),
        {
            plugins: plugins && (await Promise.allSettled(
                plugins.map(
                    //moduleNameFormat: lgHash->lg-hash
                    name => import(
                        /* webpackChunkName: "lg-" */
                        'lightgallery/plugins/' + solvePluginName(name)+'.min.js')
                )))
                .map(handleResult),
            ...opts
        });
}
