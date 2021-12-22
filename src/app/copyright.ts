import { createButterbar } from "../common/butterbar";
import { __ } from "../common/sakurairo_global";

const txt = [
    "# 商业转载请联系作者获得授权，非商业转载请注明出处。",
    "# For commercial use, please contact the author for authorization. For non-commercial use, please indicate the source.",
    "# 协议(License)：署名-非商业性使用-相同方式共享 4.0 国际 (CC BY-NC-SA 4.0)",
    "# 作者(Author)：" + mashiro_option.author_name,
    "# 链接(URL)：" + window.location.href,
    "# 来源(Source)：" + mashiro_option.site_name,
]
type WindowWithClipboardData = Window & typeof globalThis & { clipboardData: DataTransfer }

function setClipboardText(event: ClipboardEvent, selectionTxt: string) {
    event.preventDefault();
    const htmlData = txt.join('<br>') + "<br><br>" + selectionTxt.replace(/\r\n/g, "<br>"),
        textData = txt.join('\n') + "\n\n" + selectionTxt.toString().replace(/\r\n/g, "\n");
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
            createButterbar(__("复制成功！"), 1000);
        }
    }
}
/**
 * 添加复制时的版权提示
 */
export default function add_copyright() {
    if (mashiro_option.clipboardCopyright) {
        document.body.removeEventListener("copy", copytext)
        document.body.addEventListener("copy", copytext);
    }
}