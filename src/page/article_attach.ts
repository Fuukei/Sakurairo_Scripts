import { loadCSS } from 'fg-loadcss';
import { slideToggle } from '../common/util';
declare namespace window {
    let jQuery: Function
    let $: Function
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
        if (!lightBoxCSS) lightBoxCSS = loadCSS('https://cdn.jsdelivr.net/npm/baguettebox.js@1.11.1/dist/baguetteBox.min.css')
        //@ts-ignore
        const { default: baguetteBox } = await import('baguettebox.js')
        baguetteBox.run('.entry-content', {
            captions: function (element: HTMLElement) {
                return element.getElementsByTagName('img')[0].alt;
            },
            ignoreClass: 'fancybox',
        });
    } else if (mashiro_option.fancybox) {
        if (!lightBoxCSS) lightBoxCSS = loadCSS('https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css')

        if (!((window.jQuery instanceof Function) || (window.$ instanceof Function))) {
            //@ts-ignore
            const jQuery = await import('jquery')
            window.jQuery = jQuery.default
            window.$ = jQuery.default
        }
        //@ts-ignore
        import('@fancyapps/fancybox')
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
                    fontURL: "https://cdn.jsdelivr.net/npm/mathjax/es5/output/chtml/fonts/woff-v2",
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