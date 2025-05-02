import { buildAPI } from '../common/util'
import { __ } from '../common/sakurairo_global';
export interface Query {
    comments: string
    link: string
    text: string
    title: string
    type: "post" | 'page' | 'category' | 'comment' | 'tag' | 'shuoshuo'
}
let QueryStorage: Array<Query>
function renderSearchResult(keyword: string, link: string, fa: string, title: string, iconfont: string, comments: string, text: string) {
    if (keyword) {
        const s = keyword.trim().split(" "),
            a = title.indexOf(s[s.length - 1]),
            b = text.indexOf(s[s.length - 1]);
        title = a < 60 ? title.slice(0, 80) : title.slice(a - 30, a + 30);
        title = title.replace(s[s.length - 1], '<mark class="search-keyword"> ' + s[s.length - 1].toUpperCase() + ' </mark>');
        text = b < 60 ? text.slice(0, 80) : text.slice(b - 30, b + 30);
        text = text.replace(s[s.length - 1], '<mark class="search-keyword"> ' + s[s.length - 1].toUpperCase() + ' </mark>');
    }
    return `<div class="ins-selectable ins-search-item" href="${link}"><header><i class="fa-solid ${fa}" aria-hidden="true"></i>${title}<i class="fa-solid ${iconfont}">${comments}</i></header><p class="ins-search-preview">${text}</p></div>`;
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
function query(data: Query[], keyword: string,) {
    const sectionStart = '<section class="ins-section"><header class="ins-section-header">';
    const sectionEnd = '</section>';
    const headerEnd = '</header>';

    let articleResults = "";
    let shuoshuoResults = "";
    let pageResults = "";
    let categoryResults = "";
    let tagResults = "";
    let commentResults = "";
    let finalHtml = "";

    const matchedItems = Cx(data, keyword.trim());

    for (const item of matchedItems) {
        switch (item.type) {
            case "post":
                articleResults += renderSearchResult(keyword,item.link,"fa-inbox",item.title,"fa-comments",item.comments,item.text);
                break;
            
            case "shuoshuo":
                shuoshuoResults += renderSearchResult(keyword,item.link,"pen-to-square",item.title,"fa-comments",item.comments,item.text);
                break;

            case "page":
                pageResults += renderSearchResult(keyword,item.link,"fa-file",item.title,"fa-comments",item.comments,item.text);
                break;

            case "category":
                categoryResults += renderSearchResult("",item.link,"fa-folder",item.title,"none","","");
                break;

            case "tag":
                tagResults += renderSearchResult("",item.link,"fa-tag",item.title,"none","","");
                break;

            case "comment":
                commentResults += renderSearchResult(keyword,item.link,"fa-comment",item.title,"none","",item.text);
                break;
        }
    }

    if (articleResults) {
        finalHtml += sectionStart + __("文章") + headerEnd + articleResults + sectionEnd;
    }
    if (shuoshuoResults) {
        finalHtml += sectionStart + __("说说") + headerEnd + articleResults + sectionEnd;
    }
    if (pageResults) {
        finalHtml += sectionStart + __("页面") + headerEnd + pageResults + sectionEnd;
    }
    if (categoryResults) {
        finalHtml += sectionStart + __("分类") + headerEnd + categoryResults + sectionEnd;
    }
    if (tagResults) {
        finalHtml += sectionStart + __("标签") + headerEnd + tagResults + sectionEnd;
    }
    if (commentResults) {
        finalHtml += sectionStart + __("评论") + headerEnd + commentResults + sectionEnd;
    }

    document.getElementById("PostlistBox").innerHTML = finalHtml;
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
            let adiv = document.createElement("a")
            adiv.href = Ty.href
            adiv.style.display = "none"
            document.body.appendChild(adiv)
            adiv.click()
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

export function SearchDialog() {
    let searchButton = document.querySelector(".js-toggle-search") as HTMLElement;
    let searchDialog = document.querySelector(".dialog-search-form") as HTMLDialogElement;
    let closeButton = document.querySelector(".search_close") as HTMLElement;
    let searchForm = document.querySelector(".dialog-search-form form") as HTMLElement;
    
    if(searchButton && searchDialog){
        
        function closeSearch(){
            searchDialog.close();
            searchButton.classList.remove('is-active');
            document.documentElement.style.overflowY = 'unset';
        }
        
        function showSearch(){
            searchDialog.showModal();
            searchButton.classList.add('is-active');
            document.documentElement.style.overflowY = 'hidden';
        }

        searchButton.addEventListener("click",function(event){
            event.stopPropagation();
            if (searchDialog.open){
                closeSearch();
            } else {
                showSearch();
            }
        })

        searchDialog.addEventListener("click", function(event) {
            event.stopPropagation();
        });

        closeButton.addEventListener("click",closeSearch)

        document.addEventListener("click",function(event){
            let target = event.target;
            if(target instanceof Node && !searchForm.contains(target)){
                if (searchDialog.open){
                    closeSearch()
                }
            }
        })
        
        if (_iro.live_search) {
            QueryStorage = [];
            search_a(buildAPI(_iro.api + "sakura/v1/cache_search/json"));
    
            let otxt = document.getElementById("search-input") as HTMLInputElement,
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
}