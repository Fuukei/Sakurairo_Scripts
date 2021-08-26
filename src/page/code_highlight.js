import { isInDarkMode } from '../sakura-app/darkmode'
import { loadCSS } from 'fg-loadcss'
function gen_top_bar(pre, code_a) {
    const attributes = {
        'autocomplete': 'off',
        'autocorrect': 'off',
        'autocapitalize': 'off',
        'spellcheck': 'false',
        'contenteditable': 'false',
        'design': 'by Mashiro'
    }
    if (!pre.children[0]) return
    const ele_name = pre.children[0].className
    let lang = ele_name.substr(0, ele_name.indexOf(" ")).replace('language-', '')
    if (lang.toLowerCase() == "hljs") lang = code_a.className.replace('hljs', '') ? code_a.className.replace('hljs', '') : "text";
    pre.classList.add("highlight-wrap");
    for (const t in attributes) {
        pre.setAttribute(t, attributes[t]);
    }
    code_a.setAttribute('data-rel', lang.toUpperCase());
}
async function importHighlightjs() {
    try {
        if (!window.hljs) {
            window.hljs = (await import('highlight.js')).default
            await import('highlightjs-line-numbers.js')
        }
    } catch (e) { console.warn(e) }
}
export async function hljs_process(pre, code) {
    try {
        await importHighlightjs()
        for (let i = 0; i < code.length; i++) {
            hljs.highlightElement(code[i]);
        }
        for (let i = 0; i < pre.length; i++) {
            gen_top_bar(pre[i], code[i]);
        }
        hljs.initLineNumbersOnLoad();
        const ec = document.querySelector(".entry-content");
        ec && ec.addEventListener("click", function (e) {
            //类型问题
            //可以考虑换成 ec
            if (!e.target.classList.contains("highlight-wrap")) return;
            e.target.classList.toggle("code-block-fullscreen");
            document.documentElement.classList.toggle('code-block-fullscreen-html-scroll');
        })
    } catch (e) {
        console.warn(e)
    }
}
//Prism
const PrismBaseUrl = mashiro_option.code_highlight_prism?.autoload_path ?? 'https://cdn.jsdelivr.net/npm/prismjs@1.23.0/'
let currentPrismThemeCSS = undefined
const themeCSS = (() => {
    const { light, dark } = mashiro_option.code_highlight_prism?.theme ?? {}
    const theme = {
        light: light ?? 'themes/prism.min.css',
        dark: dark ?? 'themes/prism-tomorrow.min.css',
    }
    for (const theme_name in theme) {
        theme[theme_name] = new URL(theme[theme_name], PrismBaseUrl).toString()
    }
    return theme
})()

function loadPrismCSS(darkmodeOn) {
    const nextCSS = darkmodeOn ? themeCSS.dark : themeCSS.light
    if (currentPrismThemeCSS) {
        if (currentPrismThemeCSS.href !== nextCSS) {
            const nextCSSElement = loadCSS(nextCSS)
            nextCSSElement.addEventListener('load', () => {
                currentPrismThemeCSS.remove()
                currentPrismThemeCSS = nextCSSElement
            })
        }
    } else {
        currentPrismThemeCSS = loadCSS(nextCSS)
    }
}

const prism_darkmode_callback = (e) => {
    loadPrismCSS(e.detail)
}
async function importPrismJS() {
    try {
        if (!window.Prism) {
            loadPrismCSS(isInDarkMode())
            document.addEventListener('darkmode', prism_darkmode_callback)
            //必备插件全家桶
            loadCSS(new URL('plugins/toolbar/prism-toolbar.min.css', PrismBaseUrl).toString())
            loadCSS(new URL('plugins/previewers/prism-previewers.min.css', PrismBaseUrl).toString())
            await import('./prism_pack')
            Prism.plugins.autoloader.languages_path = new URL('components/', PrismBaseUrl).toString()
        }
    } catch (reason) {
        console.warn(reason)
    }
}
function loadPrismPluginLineNumbers() {
    loadCSS(new URL('plugins/line-numbers/prism-line-numbers.min.css', PrismBaseUrl).toString())
    return import('prismjs/plugins/line-numbers/prism-line-numbers')
}
function loadPrismMatchBraces() {
    loadCSS(new URL('plugins/match-braces/prism-match-braces.min.css', PrismBaseUrl).toString())
    return import('prismjs/plugins/match-braces/prism-match-braces')
}
/**
 * 
 * @param {NodeListOf<HTMLElement>} code document.querySelectorAll("pre code")
 */
export async function prism_process(code) {
    try {
        await importPrismJS()
        let loadLineNumber = false
        let loadMatchBraces = false
        if (mashiro_option.code_highlight_prism.line_number_all) {
            document.querySelector('.entry-content').classList.add('line-numbers')
            loadLineNumber = true
        }
        for (const ele of code) {
            if (ele.parentElement.classList.contains('line-numbers')) {
                loadLineNumber = true
            }
            if (ele.classList.contains('match-braces')) {
                loadMatchBraces = true
                if (loadLineNumber == true) {
                    break
                }
            }
        }
        await Promise.all([loadLineNumber && loadPrismPluginLineNumbers(), loadMatchBraces && loadPrismMatchBraces()])
        for (const ele of code) {
            Prism.highlightElement(ele)
        }
        Prism.plugins.fileHighlight && Prism.plugins.fileHighlight.highlight()
    } catch (error) {
        console.warn(error)
    }
}