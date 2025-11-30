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
function renderSearchResult(keyword: string, link: string, title: string, text: string) {
    if (keyword) {
        const s = keyword.trim().split(" "),
            a = title.indexOf(s[s.length - 1]),
            b = text.indexOf(s[s.length - 1]);
        title = a < 60 ? title.slice(0, 80) : title.slice(a - 30, a + 30);
        title = title.replace(s[s.length - 1], '<mark class="search-keyword">' + s[s.length - 1] + '</mark>');
        text = b < 60 ? text.slice(0, 80) : text.slice(b - 30, b + 30);
        text = text.replace(s[s.length - 1], '<mark class="search-keyword">' + s[s.length - 1] + '</mark>');
    }
    return `<a class="ins-selectable ins-search-item" href="${link}">
                <header>${title}</header>
                <p class="ins-search-preview">${text}</p>
            </a>`;
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

    let tabBar = document.querySelector<HTMLDivElement>(".ins-tab")!;

    tabBar && tabBar.removeEventListener("click",tabSwitch);

    let articleResults = "";
    let shuoshuoResults = "";
    let pageResults = "";
    let categoryResults = "";
    let tagResults = "";
    let commentResults = "";
    let finalHtml = "";
    let tabs = "";

    const matchedItems = Cx(data, keyword.trim());

    for (const item of matchedItems) {
        switch (item.type) {
            case "post":
                articleResults += renderSearchResult(keyword,item.link,item.title,item.text);
                break;
            
            case "shuoshuo":
                shuoshuoResults += renderSearchResult(keyword,item.link,item.title,item.text);
                break;

            case "page":
                pageResults += renderSearchResult(keyword,item.link,item.title,item.text);
                break;

            case "category":
                categoryResults += renderSearchResult("",item.link,item.title,item.text);
                break;

            case "tag":
                tagResults += renderSearchResult("",item.link,item.title,"");
                break;

            case "comment":
                commentResults += renderSearchResult(keyword,item.link,item.title,item.text);
                break;
        }
    }

    if (articleResults) {
        tabs += '<section class="ins-section"><header class="ins-section-header tab-post">' + __("文章") + headerEnd + sectionEnd;
        finalHtml += '<section class="ins-section type-post">' + articleResults + sectionEnd;
    }
    if (shuoshuoResults) {
        tabs += '<section class="ins-section"><header class="ins-section-header tab-shuoshuo">' + __("说说") + headerEnd + sectionEnd;
        finalHtml += '<section class="ins-section type-shuoshuo">' + shuoshuoResults + sectionEnd;
    }
    if (pageResults) {
        tabs += '<section class="ins-section"><header class="ins-section-header tab-page">' + __("页面") + headerEnd + sectionEnd;
        finalHtml += '<section class="ins-section type-page">' + pageResults + sectionEnd;
    }
    if (categoryResults) {
        tabs += '<section class="ins-section"><header class="ins-section-header tab-cate">' + __("分类") + headerEnd + sectionEnd;
        finalHtml += '<section class="ins-section type-cate">' + categoryResults + sectionEnd;
    }
    if (tagResults) {
        tabs += '<section class="ins-section"><header class="ins-section-header tab-tag">' + __("标签") + headerEnd + sectionEnd;
        finalHtml += '<section class="ins-section type-tag">' + tagResults + sectionEnd;
    }
    if (commentResults) {
        tabs += '<section class="ins-section"><header class="ins-section-header tab-comment">' + __("评论") + headerEnd + sectionEnd;
        finalHtml += '<section class="ins-section type-comment">' + commentResults + sectionEnd;
    }

    document.getElementById("PostlistBox").innerHTML = '<div class="ins-tab">' + tabs + '</div><div class="ins-type-container">' + finalHtml + "</div>";

    const typeContainer = document.querySelector<HTMLDivElement>(".ins-type-container")!;
    tabBar = document.querySelector<HTMLDivElement>(".ins-tab")!;

    const firstTabSection = tabBar.querySelector<HTMLElement>(".ins-section");
    const firstContentSection = typeContainer.querySelector<HTMLElement>(".ins-section");

    if (firstTabSection && firstContentSection) {
        firstTabSection.classList.add("active");
        firstContentSection.classList.add("active");
        firstContentSection.style.setProperty("--items", String(firstContentSection.childNodes.length));

        let nextSibling = firstTabSection.nextElementSibling as HTMLElement | null;
        while (nextSibling) {
            nextSibling.classList.add("next");
            nextSibling = nextSibling.nextElementSibling as HTMLElement | null;
        }

        nextSibling = firstContentSection.nextElementSibling as HTMLElement | null;
        while (nextSibling) {
            nextSibling.classList.add("next");
            nextSibling = nextSibling.nextElementSibling as HTMLElement | null;
        }
    }

    tabBar.addEventListener("click", tabSwitch)

    function tabSwitch (e: Event) {
        const target = e.target as HTMLElement;
        
        if (!target.classList.contains("ins-section-header")) return;

        const tabSection = target.closest(".ins-section") as HTMLElement;
        if (!tabSection) return;

        const tabClasses = Array.from(target.classList);
        const tabClass   = tabClasses.find(c => c.startsWith("tab-"));
        if (!tabClass) return;
        const typeKey = tabClass.slice(4); // 'post','shuoshuo','page','cate','tag','comment'

        // 清除所有 active
        tabBar.querySelectorAll(".ins-section")
            .forEach(el => el.classList.remove("active", "prev", "next"));
        typeContainer.querySelectorAll(".ins-section")
            .forEach(el => el.classList.remove("active", "prev", "next"));

        let sibling = tabSection.previousElementSibling as HTMLElement | null;
        while (sibling) {
            sibling.classList.add("prev");
            sibling = sibling.previousElementSibling as HTMLElement | null;
        }
        
        sibling = tabSection.nextElementSibling as HTMLElement | null;
        while (sibling) {
            sibling.classList.add("next");
            sibling = sibling.nextElementSibling as HTMLElement | null;
        }
        
        tabSection.classList.add("active");
        
        // 内容：添加 active / prev / next
        const contentSection = typeContainer.querySelector<HTMLElement>(`.type-${typeKey}`);
        if (!contentSection) return;
        
        sibling = contentSection.previousElementSibling as HTMLElement | null;
        while (sibling) {
            sibling.classList.add("prev");
            sibling = sibling.previousElementSibling as HTMLElement | null;
        }
        
        sibling = contentSection.nextElementSibling as HTMLElement | null;
        while (sibling) {
            sibling.classList.add("next");
            sibling = sibling.nextElementSibling as HTMLElement | null;
        }
        
        contentSection.classList.add("active");
        contentSection.style.setProperty("--items", String(contentSection.childNodes.length));
        // typeContainer.scrollTo({
        // left: contentSection.offsetLeft,
        // behavior: "smooth"
        // });
    };
}

function search_a(val: RequestInfo) {
    const otxt = (document.getElementById("search-input") as HTMLInputElement)
    if (sessionStorage.getItem('search') != null) {
        QueryStorage = JSON.parse(sessionStorage.getItem('search'));
        query(QueryStorage, otxt.value, /* Record */);
    } else {
        fetch(val)
            .then(async resp => {
                if (resp.ok) {
                    const json = await resp.text()
                    if (json != "") {
                        sessionStorage.setItem('search', json);
                        QueryStorage = JSON.parse(json);
                        query(QueryStorage, otxt.value, /* Record */);
                    }
                } else {
                    console.warn('HTTP ' + resp.status)
                }
            })
            .catch(reason => console.warn(reason))
    }
}

export function SearchDialog() {
    let searchButton = document.querySelector(".js-toggle-search") as HTMLElement;
    let searchDialog = document.querySelector(".dialog-search-form") as HTMLDialogElement;
    let searchForm = document.querySelector(".dialog-search-form form") as HTMLElement;
    let detail =  document.querySelector(".dialog-search-form .search-detail") as HTMLElement;
    
    if(searchButton && searchDialog){
        
        function closeSearch(){
            searchButton.classList.remove('is-active');
            searchForm.classList.remove('is-active');
            document.documentElement.style.overflowY = 'unset';
            searchForm.addEventListener("transitionend",function(){
                searchDialog.close();
            },{once: true})
        }
        
        function showSearch(){
            searchDialog.showModal();
            searchButton.classList.add('is-active');
            searchForm.classList.add('is-active');
            document.documentElement.style.overflowY = 'hidden';
        }

        detail.addEventListener("click",function(){
            detail.classList.toggle("active");
            searchForm.classList.toggle("show-detail");
        })

        searchButton.addEventListener("click",function(event){
            event.stopPropagation();
            if (searchDialog.open){
                closeSearch();
            } else {
                showSearch();
            }
        })

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
                }, 250);
            };
            document.addEventListener("pjax:complete",closeSearch);
        }
        
    }
}