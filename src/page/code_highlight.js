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
            window.hljs = await import('highlight.js')
            await import('highlightjs-line-numbers.js')
        }
    } catch (e) { console.warn(e) }
}
export async function hljs_process(pre, code) {
    try {
        await importHighlightjs()
        for (let i = 0; i < code.length; i++) {
            hljs.highlightBlock(code[i]);
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
const PrismBaseUrl = mashiro_option.code_highlight_prism?.autoload_path ?? 'https://cdn.jsdelivr.net/npm/prismjs@1.23.0/'
let current_prism_css = undefined
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
    if (current_prism_css) {
        if (current_prism_css.href !== nextCSS) {
            const nextCSSElement = loadCSS(nextCSS)
            nextCSSElement.addEventListener('load', () => {
                current_prism_css.remove()
                current_prism_css = nextCSSElement
            })
        }
    } else {
        current_prism_css = loadCSS(nextCSS)
    }
}
async function importPrismJS() {
    try {
        if (!window.Prism) {
            const { default: Prism } = await import('prismjs')
            window.Prism = Prism
        }
        //必备插件全家桶
        loadCSS(new URL('plugins/toolbar/prism-toolbar.min.css', PrismBaseUrl).toString())
        loadCSS(new URL('plugins/previewers/prism-previewers.min.css', PrismBaseUrl).toString())
        loadPrismCSS(isInDarkMode())
        document.addEventListener('darkmode', (e) => {
            loadPrismCSS(e.detail)
        })
        await Promise.all([
            import('prismjs/plugins/autoloader/prism-autoloader'),
            import('prismjs/plugins/previewers/prism-previewers'),
            import('prismjs/plugins/toolbar/prism-toolbar')
                .then(() => import('prismjs/plugins/show-language/prism-show-language'))
        ])
        Prism.plugins.autoloader.languages_path = new URL('components/', PrismBaseUrl).toString()
    } catch (reason) {
        console.warn(reason)
    }
}
function loadPrismPluginLineNumbers() {
    loadCSS(new URL('plugins/line-numbers/prism-line-numbers.min.css', PrismBaseUrl).toString())
    return import('prismjs/plugins/line-numbers/prism-line-numbers')
}
/**
 * 
 * @param {NodeListOf<HTMLElement>} code document.querySelectorAll("pre code")
 */
export async function prism_process(code) {
    try {
        await importPrismJS()
        if (mashiro_option.code_highlight_prism.line_number_all) {
            document.querySelector('.entry-content').classList.add('line-numbers')
            await loadPrismPluginLineNumbers()
        }
        code.forEach(async ele => {
            if (ele.parentElement.classList.contains('line-numbers')) {
                await loadPrismPluginLineNumbers()
            }
            if (ele.classList.contains('match-braces')) {
                await import('prismjs/plugins/match-braces/prism-match-braces')
                loadCSS(new URL('plugins/match-braces/prism-match-braces.min.css', PrismBaseUrl).toString())
            }
            Prism.highlightElement(ele)
        })
        Prism.plugins.fileHighlight && Prism.plugins.fileHighlight.highlight()
    } catch (error) {
        console.warn(error)
    }
}