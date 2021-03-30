/**
 * sakura-app.js L167-201
 */

const attributes = [
    ['autocomplete', 'off'],
    ['autocorrect', 'off'],
    ['autocapitalize', 'off'],
    ['spellcheck', 'false'],
    ['contenteditable', 'false'],
    ['design', 'by Mashiro']
]
function code_highlight_style() {
    const pre = document.getElementsByTagName("pre");
    const code = document.querySelectorAll("pre code");
    for (let i = 0; i < code.length; i++) {
        hljs.highlightBlock(code[i]);
    }
    for (let i = 0; i < pre.length; i++) {
        const ele_name = pre[i]?.children[0]?.className
        const code_a = code[i];
        let lang = ele_name.substr(0, ele_name.indexOf(" ")).replace('language-', '')
        if (lang.toLowerCase() == "hljs") {
            lang = code_a.className.replace('hljs', '') ?
                code_a.className.replace('hljs', '') : "text";
        }
        pre[i].classList.add("highlight-wrap");

        for (const [k, v] of attributes) {
            pre[i].setAttribute(k, v);
        }
        code_a.setAttribute('data-rel', lang.toUpperCase());
    }
    hljs.initLineNumbersOnLoad();
    document.getElementsByClassName("entry-content")[0]?.addEventListener("click", function (e) {
        if (!e.target.classList.contains("highlight-wrap")) return;
        e.target.classList.toggle("code-block-fullscreen");
        document.documentElement.classList.toggle('code-block-fullscreen-html-scroll');
    })
}