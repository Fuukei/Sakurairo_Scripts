import { buildAPI } from '../common/util'
import { __ } from '../common/sakurairo_global';
export interface Query {
    comments: string
    link: string
    text: string
    title: string
    type: "post" | 'page' | 'category' | 'comment' | 'tag'
}
let QueryStorage: Array<Query>
function search_result(keyword: string, link: string, fa: string, title: string, iconfont: string, comments: string, text: string) {
    if (keyword) {
        var s = keyword.trim().split(" "),
            a = title.indexOf(s[s.length - 1]),
            b = text.indexOf(s[s.length - 1]);
        title = a < 60 ? title.slice(0, 80) : title.slice(a - 30, a + 30);
        title = title.replace(s[s.length - 1], '<mark class="search-keyword"> ' + s[s.length - 1].toUpperCase() + ' </mark>');
        text = b < 60 ? text.slice(0, 80) : text.slice(b - 30, b + 30);
        text = text.replace(s[s.length - 1], '<mark class="search-keyword"> ' + s[s.length - 1].toUpperCase() + ' </mark>');
    }
    return `<div class="ins-selectable ins-search-item" href="${link}"><header><i class="fa fa-${fa}" aria-hidden="true"></i>${title}<i class="iconfont icon-${iconfont}">${comments}</i></header><p class="ins-search-preview">${text}</p></div>`;
}
function Cx(array: Query[], query: string) {
    for (let s = 0; s < query.length; s++) {
        if (['.', '?', '*'].indexOf(query[s]) != -1) {
            query = query.slice(0, s) + "\\" + query.slice(s);
            s++;
        }
    }
    query = query.replace(query, "^(?=.*?" + query + ").+$").replace(/\s/g, ")(?=.*?");
    return array.filter(
        v => Object.values(v)
            .some(v => new RegExp(query + '').test(v))
    );
}
function query(B: any[], A: string,) {
    var s, y = "",
        w = "",
        u = "",
        r = "",
        p = "",
        F = "",
        G = '<section class="ins-section"><header class="ins-section-header">',
        D = "</section>",
        E = "</header>",
        C = Cx(B, A.trim());
    for (const H of C) {
        switch (H.type) {
            case "post":
                w = w + search_result(A, H.link, "file", H.title, "mark", H.comments, H.text);
                break;
            case "tag":
                p = p + search_result("", H.link, "tag", H.title, "none", "", "");
                break;
            case "category":
                r = r + search_result("", H.link, "folder", H.title, "none", "", "");
                break;
            case "page":
                u = u + search_result(A, H.link, "file", H.title, "mark", H.comments, H.text);
                break;
            case "comment":
                F = F + search_result(A, H.link, "comment", H.title, "none", "", H.text);
                break
        }
    }
    w && (y = y + G + __("文章") + E + w + D)
    u && (y = y + G + __("页面") + E + u + D)
    r && (y = y + G + __("分类") + E + r + D)
    p && (y = y + G + __("标签") + E + p + D)
    F && (y = y + G + __("评论") + E + F + D)
    s = document.getElementById("PostlistBox")
    s.innerHTML = y
}

function search_a(val: RequestInfo) {
    const otxt = (document.getElementById("search-input") as HTMLInputElement)
    if (sessionStorage.getItem('search') != null) {
        QueryStorage = JSON.parse(sessionStorage.getItem('search'));
        query(QueryStorage, otxt.value, /* Record */);
        div_href();
    } else {
        fetch(val)
            .then(async resp => {
                if (resp.ok) {
                    const json = await resp.text()
                    if (json != "") {
                        sessionStorage.setItem('search', json);
                        QueryStorage = JSON.parse(json);
                        query(QueryStorage, otxt.value, /* Record */);
                        div_href();
                    }
                } else {
                    console.warn('HTTP ' + resp.status)
                }
            })
            .catch(reason => console.warn(reason))
    }
}
/*                     if (!Object.values) Object.values = function (obj) {
                        if (obj !== Object(obj))
                            throw new TypeError('Object.values called on a non-object');
                        var val = [],
                            key;
                        for (key in obj) {
                            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                                val.push(obj[key]);
                            }
                        }
                        return val;
                    } */
function div_href() {
    const search_close = document.querySelector(".search_close") as HTMLElement
    const Ty = document.getElementById('Ty') as HTMLAnchorElement
    for (const ele of document.getElementsByClassName('ins-selectable')) {
        ele.addEventListener("click", () => {
            Ty.href = ele.getAttribute('href')
            Ty.click()
            search_close.click()
        });
    }
    /* $(".ins-selectable").each(function () {
        $(this).click(function () {
            $("#Ty").attr('href', $(this).attr('href'));
            $("#Ty").click();
            $(".search_close").click();
        });
    }); */
}

export function jsSearchCallback() {
    //$('.js-toggle-search').toggleClass('is-active');
    document.getElementsByClassName('js-toggle-search')[0].classList.toggle('is-active')
    //$('.js-search').toggleClass('is-visible');
    document.getElementsByClassName('js-search')[0].classList.toggle('is-visible')
    //$('html').css('overflow-y', 'hidden');
    document.documentElement.style.overflowY = 'hidden'
    if (mashiro_option.live_search) {
        QueryStorage = [];
        search_a(buildAPI(Poi.api + "sakura/v1/cache_search/json"));

        var otxt = document.getElementById("search-input") as HTMLInputElement,
            //list = document.getElementById("PostlistBox"),
            //Record = list.innerHTML,
            searchFlag: ReturnType<typeof setTimeout> = null;
        otxt.oninput = function () {
            if (searchFlag != null) {
                clearTimeout(searchFlag);
            }
            searchFlag = setTimeout(function () {
                query(QueryStorage, otxt.value, /* Record */);
                div_href();
            }, 250);
        };
    }
}