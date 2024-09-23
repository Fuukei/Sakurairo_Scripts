import { loadCSS } from 'fg-loadcss';
import { slideToggle } from '../../common/util';
import { resolvePath, importExternal } from '../../common/npmLib';
import math from './math';
declare namespace window {
    let jQuery: Function
    let $: Function
    let lightGallery: Function
}
function collapse() {
    //收缩、展开
    /* jQuery(document).ready(
    function(jQuery){
        jQuery('.collapseButton').click(function(){
        jQuery(this).parent().parent().find('.xContent').slideToggle('slow');
        });
        }) */
    const collapseButtons = document.getElementsByClassName('collapseButton')
    if (collapseButtons.length > 0) {
        const collapseListener = (e: any) => {
            slideToggle(e.target.parentNode.parentNode.parentNode.querySelector(".xContent"));
            // e.parentNode.parentNode.querySelector(".xContent")
        }
        for (const ele of collapseButtons) {
            ele.addEventListener("click", collapseListener)
        }
        // import('jquery').then(({ default: jQuery }) => {
        //     jQuery('.collapseButton').on("click", function () {
        //         jQuery(this).parent().parent().find('.xContent').slideToggle('slow');
        //     })
        // })
    }
}
let lightBoxCSS: HTMLLinkElement
async function lightbox() {
    //init lightbox
    if (_iro.baguetteBoxON) {
        if (!lightBoxCSS) lightBoxCSS = loadCSS(resolvePath('dist/baguetteBox.min.css', 'baguettebox.js', '1.11.1'))
        //@ts-ignore
        const { default: baguetteBox } = await import('baguettebox.js')
        baguetteBox.run('.entry-content', {
            captions: function (element: HTMLElement) {
                return element.getElementsByTagName('img')[0].alt;
            },
            ignoreClass: 'fancybox',
        });
    } else if (_iro.fancybox) {
        if (!lightBoxCSS) lightBoxCSS = loadCSS(resolvePath('dist/jquery.fancybox.min.css', '@fancyapps/fancybox'))
        if (!((window.jQuery instanceof Function) || (window.$ instanceof Function))) {
            if (_iro.ext_shared_lib) {
                importExternal('dist/jquery.slim.min.js', 'jquery')
            } else {
                //@ts-ignore
                const { default: jQuery } = await import('jquery')
                window.$ = jQuery
                window.jQuery = jQuery
            }
        }
        if (_iro.ext_shared_lib) {
            importExternal('dist/jquery.fancybox.min.js', '@fancyapps/fancybox')
        } else {
            //@ts-ignore
            import('@fancyapps/fancybox')
        }
    } else if (_iro.lightGallery) {
        //lightGallery的umd导入有点问题
        /*         if (_iro.ext_shared_lib) {
                    if (!window.lightGallery) {
                        loadCSS(resolvePath('css/lightgallery-bundle.min.css', 'lightgallery', '2.3.0'))
                        await importExternal('lightgallery.umd.js', 'lightgallery')
                    }
                    const { plugins } = _iro.lightGallery
                    if (plugins) {
                        (await Promise
                            .allSettled(
                                plugins.map((name: string) => importExternal('plugins/' + solvePluginName(name)+'.umd.js', 'lightgallery'))
                            ))
                            .map(handleResult)
                    }
                    window.lightGallery(
                        document.querySelector('.entry-content'),
                        _iro.lightGallery);
                } else {
                    //@ts-ignore
                    const { default: initLightGallery } = await import('./lightGallery/import')
                    initLightGallery()
                } */
        const { default: initLightGallery } = await import('../lightGallery/import')
        initLightGallery()
    }
}

export default function article_attach() {
    collapse()
    lightbox()
    math()
}