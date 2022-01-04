import { loadCSS } from 'fg-loadcss';
import { slideToggle } from '../common/util';
import { LightGallerySettings } from 'lightgallery/lg-settings'
import { resolvePath } from '../common/npmLib';
declare namespace window {
    let jQuery: Function
    let $: Function
}
type LightGalleryOptions = LightGallerySettings & {
    //TODO:Fix types
    plugins?: Array<string>
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
            //@ts-ignore
            const jQuery = await import('jquery')
            window.jQuery = jQuery.default
            window.$ = jQuery.default
        }
        //@ts-ignore
        import('@fancyapps/fancybox')
    } else if (mashiro_option.lightGallery) {
        //@ts-ignore
        const { default: lightGallery } = await import('lightgallery/lib/index.js')
        const { plugins, ...opts } = mashiro_option.lightGallery as LightGalleryOptions
        loadCSS(resolvePath('css/lightgallery-bundle.min.css', 'lightgallery', '2.3.0'))
        lightGallery(
            document.querySelector('.entry-content'),
            {
                plugins: plugins && (await Promise.allSettled(plugins.map(moduleName =>
                    import(
                        /* webpackChunkName: "lg-plugin-" */
                        `lightgallery/plugins/${moduleName}/lg-${moduleName}.es5.js`)
                ))).map(result => result.status == 'fulfilled' ? result.value.default : console.error('加载lightGallery的插件时出错啦！', result.reason)),
                ...opts
            });
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