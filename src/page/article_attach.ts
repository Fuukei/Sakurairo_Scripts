import { loadCSS } from 'fg-loadcss';
import { slideToggle } from '../common/util';
import { resolvePath, importExternal } from '../common/npmLib';
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
    if (mashiro_option.baguetteBoxON) {
        if (!lightBoxCSS) lightBoxCSS = loadCSS(resolvePath('dist/baguetteBox.min.css', 'baguettebox.js', '1.11.1'))
        //@ts-ignore
        const { default: baguetteBox } = await import('baguettebox.js')
        baguetteBox.run('.entry-content', {
            captions: function (element: HTMLElement) {
                return element.getElementsByTagName('img')[0].alt;
            },
            ignoreClass: 'fancybox',
        });
    } else if (mashiro_option.fancybox) {
        if (!lightBoxCSS) lightBoxCSS = loadCSS(resolvePath('dist/jquery.fancybox.min.css', '@fancyapps/fancybox', '3.5.7'))
        if (!((window.jQuery instanceof Function) || (window.$ instanceof Function))) {
            if (mashiro_option.ext_shared_lib) {
                importExternal('dist/jquery.slim.min.js', 'jquery')
                importExternal('dist/jquery.fancybox.min.js', '@fancyapps/fancybox')
            } else {
                //@ts-ignore
                const { default: jQuery } = await import('jquery')
                window.$ = jQuery
                window.jQuery = jQuery
                //@ts-ignore
                import('@fancyapps/fancybox')
            }
        }
    } else if (mashiro_option.lightGallery) {
        //lightGallery的umd导入有点问题
        /*         if (mashiro_option.ext_shared_lib) {
                    if (!window.lightGallery) {
                        loadCSS(resolvePath('css/lightgallery-bundle.min.css', 'lightgallery', '2.3.0'))
                        await importExternal('lightgallery.umd.js', 'lightgallery')
                    }
                    const { plugins } = mashiro_option.lightGallery
                    if (plugins) {
                        (await Promise
                            .allSettled(
                                plugins.map((name: string) => importExternal('plugins/' + solvePluginName(name)+'.umd.js', 'lightgallery'))
                            ))
                            .map(handleResult)
                    }
                    window.lightGallery(
                        document.querySelector('.entry-content'),
                        mashiro_option.lightGallery);
                } else {
                    //@ts-ignore
                    const { default: initLightGallery } = await import('./lightGallery/import')
                    initLightGallery()
                } */
        const { default: initLightGallery } = await import('./lightGallery/import')
        initLightGallery()
    }
}
async function math() {
    if (document.getElementsByTagName('math').length > 0) {
        if (!('MathJax' in window)) {
            //@ts-ignore
            window.MathJax = {
                svg: {
                    fontCache: 'global'
                }, startup: {
                    typeset: false,           // Perform initial typeset?
                }, chtml: {
                    fontURL: resolvePath('es5/output/chtml/fonts/woff-v2', 'mathjax', '2.3.0'),
                    mathmlSpacing: true// true for MathML spacing rules, false for TeX rules
                }
            }
        }
        //@ts-ignore
        await import('mathjax/es5/mml-chtml')
        //@ts-ignore
        window.MathJax.typeset()
    }
}
export default function article_attach() {
    collapse()
    lightbox()
    math()
}