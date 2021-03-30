import { getCookie, setCookie } from "../../module/cookie";

/**
 * sakura-app.js L135-165
 */
export default class FontControl {
    change_font() {
        if (document.body.classList.contains("serif")) {
            document.body.classList.remove("serif");
            document.getElementsByClassName("control-btn-serif")[0]?.classList.remove("selected");
            document.getElementsByClassName("control-btn-sans-serif")[0]?.classList.remove("selected");
            setCookie("font_family", "sans-serif", 30);
        } else {
            document.body.classList.add("serif");
            document.getElementsByClassName("control-btn-serif")[0]?.classList.add("selected");
            document.getElementsByClassName("control-btn-sans-serif")[0]?.classList.remove("selected");
            setCookie("font_family", "serif", 30);
            if (document.body.clientWidth <= 860) {
                addComment.createButterbar("将从网络加载字体，流量请注意");
            }
        }
    }
    ini() {
        if (document.body.clientWidth > 860) {
            if (!getCookie("font_family") || getCookie("font_family") == "serif")
                document.body.classList.add("serif");
            // $("body").addClass("serif");
        }
        if (getCookie("font_family") == "sans-serif") {
            document.body.classList.remove("sans-serif");
            document.getElementsByClassName("control-btn-serif")[0]?.classList.remove("selected");
            document.getElementsByClassName("control-btn-sans-serif")[0]?.classList.add("selected");
        }
    }
}
