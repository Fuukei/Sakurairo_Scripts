import { isMobile } from "./mobile"

export default function scrollHandler() {
    const header_thresold = 0
    const siteHeader = document.querySelector(".site-header")
    const changskin = document.querySelector<HTMLElement>("#changskin")
    const mb_to_top = document.querySelector<HTMLElement>("#moblieGoTop")
    const common = (scrollTop: number) => {
        //NH
        if (scrollTop > header_thresold) {
            siteHeader.classList.add("yya");
        } else {
            siteHeader.classList.remove("yya");
        }
        const cssText = scrollTop > 20 ? "scale(1)" : "scale(0)"
        mb_to_top.style.transform = cssText;
        changskin.style.transform = cssText;
    }

    if (isMobile()) {
        const smallScreenHandler = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            common(scrollTop)
        }
        window.addEventListener("scroll", smallScreenHandler)
    } else {
        const cached = document.getElementById('bar')
        const skinMenu = document.querySelector(".skin-menu");
        const recalcuScrollbar = (scrollTop: number) => {
            const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight
            const result = Math.round(scrollTop / (scrollHeight - window.innerHeight) * 100)
            cached.style.width = result + '%';
            /* switch (true) {
                case (result <= 19): c = '#cccccc'; break;
                case (result <= 39): c = '#50bcb6'; break;
                case (result <= 59): c = '#85c440'; break;
                case (result <= 79): c = '#f2b63c'; break;
                case (result <= 99): c = '#FF0000'; break;
                case (result == 100): c = '#5aaadb'; break;
                default: c = "orange";
            }
            cached.style.background = c; */
            //炫彩scrollbar好像不是很好看，又被php那边的样式强制覆盖了，就先注释掉
            skinMenu && skinMenu.classList.remove("show");
        }
        const largeScreenHandler = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            recalcuScrollbar(scrollTop)
            common(scrollTop)
        }
        window.addEventListener("scroll", largeScreenHandler)
    }
}
//pjax.complete ready
/* function NH() {
    const header_thresold = 0,
        siteHeader = document.querySelector(".site-header")
    window.addEventListener("scroll", () => {
        const scrollTop = document.documentElement.scrollTop || window.pageYOffset;
        if (scrollTop > header_thresold) {
            siteHeader.classList.add("yya");
        } else {
            siteHeader.classList.remove("yya");
        }
    })
    //     $(window).scroll(function () {
    //         var s = $(document).scrollTop(),
    //             cached = $('.site-header');
    //         if (s == h1) {
    //             cached.removeClass('yya');
    //         }
    //         if (s > h1) {
    //             cached.addClass('yya');
    //         }
    // });
} */
//ready
/* function GT() {
    const mb_to_top = document.querySelector("#moblieGoTop"),
        changskin = document.querySelector("#changskin");
    window.addEventListener("scroll", debounce(() => {
        const scroll = document.documentElement.scrollTop || document.body.scrollTop;
        const cssText = scroll > 20 ? "scale(1)" : "scale(0)"
        mb_to_top.style.transform = cssText;
        changskin.style.transform = cssText;
    }))
    mb_to_top.onclick = topFunction
}

function topFunction() {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
} */
