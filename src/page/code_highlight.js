import { isInDarkMode } from '../app/darkmode'
import { loadCSS } from 'fg-loadcss'
import { importExternal, resolvePath } from '../common/npmLib';
window.LineNumbers = false;
window.MatchBraces = false;
window.CommandLine = false;
const PRISM_VERSION = PKG_INFO['prismjs']
const attributes = {
    'autocomplete': 'off',
    'autocorrect': 'off',
    'autocapitalize': 'off',
    'spellcheck': 'false',
    'contenteditable': 'false',
    'design': 'by Mashiro'
}
function gen_top_bar(pre, code_a) {
    if (!pre.children[0]) return
    let lang = 'text'
    const className = pre.children[0].className
    const matchResult = className.match(/language-(\w+)/i)
    if (matchResult) {
        lang = matchResult[1]
    }
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
    } catch (e) {
        console.warn(e)
    }
}
const hljs_click_callback = (e) => {
    const element = e.target
    if (!element.classList.contains("highlight-wrap")) return;
    if (element.classList.contains('code-block-fullscreen')) {
        element.remove()
    } else {
        const cloneElement = element.cloneNode(true)
        cloneElement.classList.toggle("code-block-fullscreen")
        document.body.append(cloneElement)
    }
    document.documentElement.classList.toggle('code-block-fullscreen-html-scroll');
}
export function deattachHljsCallback() {
    document.body.removeEventListener("click", hljs_click_callback)
}
export async function hljs_process(pre, code) {
    try {
        await importHighlightjs()
        for (let i = 0; i < code.length; i++) {
            if (!code[i].classList.contains("hljs")) {
                hljs.highlightElement(code[i]);
            }            
        }
        for (let i = 0; i < pre.length; i++) {
            if (!pre[i].classList.contains("highlight-wrap")) {
                gen_top_bar(pre[i], code[i]);
            }          
        }
        hljs.initLineNumbersOnLoad();
        document.body.addEventListener("click", hljs_click_callback)
    } catch (e) {
        console.warn(e)
    }
}
//Prism
const PrismBaseUrl = _iro.code_highlight_prism?.autoload_path || resolvePath('', 'prismjs', PRISM_VERSION)
let currentPrismThemeCSS = undefined
const themeCSS = (() => {
    const { light, dark } = _iro.code_highlight_prism?.theme || {}
    const theme = {
        light: light || 'themes/prism.min.css',
        dark: dark || 'themes/prism-tomorrow.min.css',
    }
    for (const theme_name in theme) {
        theme[theme_name] = new URL(theme[theme_name], PrismBaseUrl).toString()
    }
    return theme
})()

function loadPrismCSS(darkmodeOn) {
    const nextCSSHref = darkmodeOn ? themeCSS.dark : themeCSS.light
    if (currentPrismThemeCSS) {
        if (currentPrismThemeCSS.href !== nextCSSHref) {
            const nextCSSElement = loadCSS(nextCSSHref)
            nextCSSElement.addEventListener('load', () => {
                currentPrismThemeCSS.remove()
                currentPrismThemeCSS = nextCSSElement
            })
        }
    } else {
        currentPrismThemeCSS = loadCSS(nextCSSHref)
    }
}

const prism_darkmode_callback = (e) => {
    loadPrismCSS(e.detail)
}
export const deattachPrismCallback = () => document.removeEventListener('darkmode', prism_darkmode_callback)
async function importPrismJS() {
    try {
        if (!window.Prism) {
            loadPrismCSS(isInDarkMode())
            document.addEventListener('darkmode', prism_darkmode_callback)
            //必备插件全家桶
            loadCSS(new URL('plugins/toolbar/prism-toolbar.min.css', PrismBaseUrl).toString())
            loadCSS(new URL('plugins/previewers/prism-previewers.min.css', PrismBaseUrl).toString())
            if (_iro.ext_shared_lib) {
                await Promise.all([importExternal('components/prism-core.min.js', 'prismjs', PRISM_VERSION),
                importExternal('plugins/autoloader/prism-autoloader.min.js', 'prismjs', PRISM_VERSION),
                importExternal('plugins/toolbar/prism-toolbar.min.js', 'prismjs', PRISM_VERSION),
                importExternal('plugins/previewers/prism-previewers.min.js', 'prismjs', PRISM_VERSION),
                importExternal('plugins/show-language/prism-show-language.min.js', 'prismjs', PRISM_VERSION)])
            } else await import('./prism_pack')
            Prism.plugins.autoloader.languages_path = new URL('components/', PrismBaseUrl).toString()
        }
    } catch (reason) {
        console.warn(reason)
    }
}
function loadPrismPluginLineNumbers() {
    window.LineNumbers = true;
    loadCSS(new URL('plugins/line-numbers/prism-line-numbers.min.css', PrismBaseUrl).toString())
    if (_iro.ext_shared_lib) {
        return importExternal('plugins/line-numbers/prism-line-numbers.min.js', 'prismjs', PRISM_VERSION)
    } else {
        return import('prismjs/plugins/line-numbers/prism-line-numbers')
    }
}
function loadPrismMatchBraces() {
    window.MatchBraces = true;
    loadCSS(new URL('plugins/match-braces/prism-match-braces.min.css', PrismBaseUrl).toString())
    if (_iro.ext_shared_lib) {
        return importExternal('plugins/match-braces/prism-match-braces.min.js', 'prismjs', PRISM_VERSION)
    } else {
        return import('prismjs/plugins/match-braces/prism-match-braces')
    }
}
function loadPrismCommandLine() {
    window.CommandLine = true;
    loadCSS(new URL('plugins/command-line/prism-command-line.css', PrismBaseUrl).toString())
    if (_iro.ext_shared_lib) {
        return importExternal('plugins/command-line/prism-command-line.min.js', 'prismjs', PRISM_VERSION)
    } else {
        return import('prismjs/plugins/command-line/prism-command-line')
    }
}
/**
 * 
 * @param {NodeListOf<HTMLElement>} code document.querySelectorAll("pre code")
 */
export async function prism_process(code) {
    try {
        let loadLineNumber = false
        let loadMatchBraces = false
        let loadCommandLine = false
        if (_iro.code_highlight_prism.line_number_all) {
            document.querySelector('.entry-content').classList.add('line-numbers')
            loadLineNumber = true
        }
        for (const ele of code) {
            if (ele.parentElement.classList.contains('line-numbers')) {
                loadLineNumber = true
            }
            if (ele.classList.contains('match-braces')) {
                loadMatchBraces = true
            }
            if (ele.dataset.prompt || ele.dataset.host || ele.dataset.user) {
                //cli
                loadCommandLine = true
            }
        }
        await Promise.all([
            importPrismJS(),
            loadLineNumber && !window.LineNumbers && loadPrismPluginLineNumbers(),
            loadMatchBraces && !window.MatchBraces && loadPrismMatchBraces(),
            loadCommandLine && !window.CommandLine && loadPrismCommandLine()
        ])
        for (const ele of code) {
            if (!(ele.firstChild && ele.firstChild.classList && ele.firstChild.classList.contains('token'))) {
                Prism.highlightElement(ele)
            }           
        }
        Prism.plugins.fileHighlight && Prism.plugins.fileHighlight.highlight()
    } catch (error) {
        console.warn(error)
    }
}