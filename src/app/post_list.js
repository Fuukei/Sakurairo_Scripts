import { onlyOnceATime } from "../common/util";
import { lazyload } from 'lazyload'
import { __ } from '../common/sakurairo_global'
import { code_highlight_style } from '../page/index.js'
let load_post_timer;
const load_post = onlyOnceATime(function load_post() {
    const now_href = document.location.href
    const pagination_a = document.querySelector('#pagination a');
    if (pagination_a.classList.contains("loading")) return;
    pagination_a.classList.add("loading");
    pagination_a.innerText = "";

    // $('#pagination a').addClass("loading").text("");
    fetch(pagination_a.getAttribute("href") + "#main")
        .then(async resp => {
            const text = await resp.text()
            //在进行DOM操作前检查页面是否已经变化，防止错误加载到其他页面上
            if (now_href != document.location.href) return /**如果页面状态发生了变化，那么也应该不用理加载提示符 */
            const parser = new DOMParser(),
                DOM = parser.parseFromString(text, "text/html"),
                result = DOM.querySelectorAll("#main .post, #shuoshuo_post"),
                paga = DOM.querySelector("#pagination a"),
                paga_innerText = paga && paga.innerText,
                nextHref = paga && paga.getAttribute("href"),
                main = document.getElementById("main")
            for (let i = 0; i < result.length; i++) {
                main.append(result[i])
            }
            //if (resp.ok) {
            // result = $(data).find("#main .post");
            // nextHref = $(data).find("#pagination a").attr("href");
            // $("#main").append(result.fadeIn(500));
            const dpga = document.querySelector("#pagination a"),
                addps = document.querySelector("#add_post span");
            if (dpga) {
                dpga.classList.remove("loading");
                dpga.innerText = paga_innerText;
            }
            if (addps) {
                addps.classList.remove("loading");
                addps.innerText = "";
            }
            // $("#pagination a").removeClass("loading").text("Previous");
            // $('#add_post span').removeClass("loading").text("");
            lazyload();
            code_highlight_style();
            post_list_show_animation();
            document.dispatchEvent(new CustomEvent('ajax_post_loaded',))
            if (nextHref != undefined) {
                pagination_a.setAttribute("href", nextHref);
                // $("#pagination a").attr("href", nextHref);
                //加载完成上滑
                let tempScrollTop = document.documentElement.scrollTop || window.pageYOffset || document.body.scrollTop;
                // window.scrollTo(tempScrollTop);
                // $(window).scrollTop(tempScrollTop);
                window.scrollTo({
                    top: tempScrollTop + 300,
                    behavior: 'smooth'
                })
                // $body.animate({
                //     scrollTop: tempScrollTop + 300
                //
                // }, 666)
            } else {
                document.getElementById("pagination").innerHTML = "<span>" + __("很高兴你翻到这里，但是真的没有了...") + "</span>";
                // $("#pagination").html("<span>很高兴你翻到这里，但是真的没有了...</span>");
            }
            //}

        })
    /*  $.ajax({
         type: "POST",
         url: $('#pagination a').attr("href") + "#main",
         success: function (data) {
             result = $(data).find("#main .post");
             nextHref = $(data).find("#pagination a").attr("href");
             $("#main").append(result.fadeIn(500));
             $("#pagination a").removeClass("loading").text("Previous");
             $('#add_post span').removeClass("loading").text("");
             lazyload();
             post_list_show_animation();
             if (nextHref != undefined) {
                 $("#pagination a").attr("href", nextHref);
                 //加载完成上滑
                 var tempScrollTop = $(window).scrollTop();
                 $(window).scrollTop(tempScrollTop);
                 $body.animate({
                     scrollTop: tempScrollTop + 300

                 }, 666)
             } else {
                 $("#pagination").html("<span>很高兴你翻到这里，但是真的没有了...</span>");
             }
         }
     }); */
})
export function post_list_show_animation() {
    const articles = document.querySelectorAll('article.post-list-thumb')
    if (articles) {
        const options = {
            root: null,
            threshold: [0.66]
        }
        const callback = (entries) => {
            entries.forEach((article) => {
                if (article.target.classList.contains("post-list-show")) {
                    article.target.style.willChange = 'auto';
                    io.unobserve(article.target)
                } else if (article.isIntersecting) {
                    article.target.classList.add("post-list-show");
                    article.target.style.willChange = 'auto';
                    io.unobserve(article.target)
                }
            })
        }
        const io = new IntersectionObserver(callback, options)
        for (const article of articles) {
            io.observe(article)
        }
    }
}
function XLS_Listener(e) {
    //要求是#pagination只有anchor一个直接子后代
    if (e.target.parentElement.id == 'pagination') {
        e.preventDefault();
        e.stopPropagation();
        clearTimeout(load_post_timer);
        load_post();
    }
}
export function XLS() {
    const intersectionObserver = new IntersectionObserver((entries) => {
        if (entries[0].intersectionRatio <= 0) return;
        // var page_next = $('#pagination a').attr("href");
        const _page_next = document.querySelector('#pagination a')
        if (_page_next) {
            const href_page_next = _page_next.getAttribute("href"),
                load_key = document.getElementById("add_post_time");
            if (href_page_next != undefined && load_key) {
                const load_time = load_key.title;
                if (load_time != "233") {
                    console.log("%c 自动加载时倒计时 %c", "background:#9a9da2; color:#ffffff; border-radius:4px;", "", "", load_time);
                    load_post_timer = setTimeout(load_post, load_time * 1000);
                }
            }
        }
    });
    intersectionObserver.observe(
        document.querySelector('.footer-device')
    );
    document.body.removeEventListener('click', XLS_Listener)
    document.body.addEventListener("click", XLS_Listener)
}