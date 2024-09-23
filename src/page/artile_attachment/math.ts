import { resolvePath } from '../../common/npmLib'

export default async function math() {
    if (document.getElementsByTagName('math').length > 0 || document.querySelector('article > div.entry-content')?.textContent.match(/(?:\$|\\\(|\\\[|\\begin\{.*?})/)) {
        const mathjaxConfig = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']]
            },
            startup: {
                typeset: false,           // Perform initial typeset?
            },
            chtml: {
                fontURL: resolvePath('es5/output/chtml/fonts/woff-v2', 'mathjax'),
                mathmlSpacing: true// true for MathML spacing rules, false for TeX rules
            }
        }
        if (!('MathJax' in window)) {
            //@ts-ignore
            window.MathJax = mathjaxConfig
        }
        //@ts-ignore
        await import('mathjax/es5/tex-mml-chtml')        //@ts-ignore
        window.MathJax.typesetPromise()
    }
}