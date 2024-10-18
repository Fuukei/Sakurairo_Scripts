import { createButterbar } from "../common/butterbar";
import { __ } from "../common/sakurairo_global";

const txt = [
    `ref(APA): ${_iro.author_name}.${_iro.site_name}.${_iro.site_url}. Retrieved ${new Date().toLocaleDateString()}.`,
]
type WindowWithClipboardData = Window & typeof globalThis & { clipboardData: DataTransfer }

function setClipboardText(event: ClipboardEvent, selectionTxt: string) {
    event.preventDefault();
    const htmlData = selectionTxt.replace(/\r\n/g, "<br>") + "<br><br>" + txt.join('<br>'),
        textData = selectionTxt.toString().replace(/\r\n/g, "\n") + "\n\n" + txt.join('\n');
    if (event.clipboardData) {
        event.clipboardData.setData("text/html", htmlData);
        event.clipboardData.setData("text/plain", textData);
    } else if ((window as WindowWithClipboardData).clipboardData) {
        //deprecate?
        return (window as WindowWithClipboardData).clipboardData.setData("text", textData);
    }
}
function copytext(e: ClipboardEvent) {
    const selection = window.getSelection()
    if (selection) {
        const selectionText = selection.toString()
        if (selectionText.length > 30) {
            setClipboardText(e, selectionText);
        }
        createButterbar(__("复制成功！"), 1000);
    }
}
/**
 * 添加复制时的版权提示
 */
export default function add_copyright() {
    if (_iro.clipboardRef) {
        document.body.removeEventListener("copy", copytext)
        document.body.addEventListener("copy", copytext);
    }
}