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
function isLiveSearchEnabled(value: unknown) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        return normalized === '1' || normalized === 'true' || normalized === 'on' || normalized === 'yes';
    }
    return !!value;
}

function renderSearchResult(keyword: string, link: string, title: string, text: string, showPreview = true) {
    if (keyword) {
        const terms = keyword.trim().split(/\s+/).filter(Boolean);
        const lastTerm = terms[terms.length - 1];
        const escapedTerm = lastTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const highlightRegExp = new RegExp(escapedTerm, 'ig');

        title = title.replace(highlightRegExp, match => `<mark class="search-keyword">${match}</mark>`);
        text = text.replace(highlightRegExp, match => `<mark class="search-keyword">${match}</mark>`);
    }
    const previewHtml = showPreview ? `<p class="ins-search-preview">${text}</p>` : '';

    return `<a class="ins-selectable ins-search-item" href="${link}">
                <header>${title}</header>
                ${previewHtml}
            </a>`;
}
function Cx(array: Query[], query: string) {
    const terms = query
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (!terms.length) {
        return [];
    }

    query = "^" + terms.map(term => `(?=.*${term})`).join('') + ".+$";
    const regexp = new RegExp(query, 'i');

    return array.filter(
        v => Object.values(v)
            .some(v => regexp.test(String(v ?? '')))
    );
}
function query(data: Query[], keyword: string, showPreview = true) {
    const sectionStart = '<section class="ins-section"><header class="ins-section-header">';
    const sectionEnd = '</section>';
    const headerEnd = '</header>';
    const normalizedKeyword = keyword.trim();

    const resultContainer = document.getElementById("PostlistBox");
    const wrapper = resultContainer?.closest<HTMLElement>(".ins-section-wrapper");
    if (!resultContainer) {
        return;
    }

    if (!normalizedKeyword) {
        resultContainer.innerHTML = '';
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    if (wrapper) wrapper.style.display = '';

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

    const matchedItems = Cx(data, normalizedKeyword);

    for (const item of matchedItems) {
        switch (item.type) {
            case "post":
                articleResults += renderSearchResult(normalizedKeyword, item.link, item.title, item.text, showPreview);
                break;
            
            case "shuoshuo":
                shuoshuoResults += renderSearchResult(normalizedKeyword, item.link, item.title, item.text, showPreview);
                break;

            case "page":
                pageResults += renderSearchResult(normalizedKeyword, item.link, item.title, item.text, showPreview);
                break;

            case "category":
                categoryResults += renderSearchResult("", item.link, item.title, item.text, showPreview);
                break;

            case "tag":
                tagResults += renderSearchResult("", item.link, item.title, "", showPreview);
                break;

            case "comment":
                commentResults += renderSearchResult(normalizedKeyword, item.link, item.title, item.text, showPreview);
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

    if (!tabs || !finalHtml) {
        resultContainer.innerHTML = '';
        if (wrapper) wrapper.style.display = 'none';
        return;
    }

    resultContainer.innerHTML = '<div class="ins-tab">' + tabs + '</div><div class="ins-type-container">' + finalHtml + "</div>";
    if (wrapper) wrapper.style.display = '';

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

function search_a(val: RequestInfo, showPreview = true) {
    const otxt = (document.getElementById("search-input") as HTMLInputElement)
    const resultContainer = document.getElementById("PostlistBox");
    if (!resultContainer || !otxt) {
        return;
    }

    if (sessionStorage.getItem('search') != null) {
        try {
            QueryStorage = JSON.parse(sessionStorage.getItem('search'));
            query(QueryStorage, otxt.value, showPreview);
        } catch {
            sessionStorage.removeItem('search');
        }
    } else {
        fetch(val)
            .then(async resp => {
                if (resp.ok) {
                    const json = await resp.text()
                    if (json != "") {
                        sessionStorage.setItem('search', json);
                        QueryStorage = JSON.parse(json);
                        query(QueryStorage, otxt.value, showPreview);
                    }
                } else {
                    console.warn('HTTP ' + resp.status)
                }
            })
            .catch(reason => console.warn(reason))
    }
}

export function SearchDialog() {
    const searchButton = document.querySelector<HTMLElement>(".js-toggle-search");
    const searchDialog = document.querySelector<HTMLDialogElement>(".dialog-search-form");
    const searchForm = document.querySelector<HTMLElement>(".dialog-search-form form");
    const detail = document.querySelector<HTMLElement>(".dialog-search-form .search-detail");
    const closeButton = document.querySelector<HTMLElement>(".dialog-search-form .search-close");
    const searchInput = document.getElementById("search-input") as HTMLInputElement;
    const resultWrapper = document.querySelector<HTMLElement>(".dialog-search-form .ins-section-wrapper");

    if (!searchButton || !searchDialog || !searchForm || !searchInput) {
        return;
    }

    if (searchDialog.dataset.initialized === '1') {
        return;
    }
    searchDialog.dataset.initialized = '1';

    const hasResultContainer = !!document.getElementById("PostlistBox");
    const canLiveSearch = isLiveSearchEnabled(_iro.live_search) && hasResultContainer;
    const canShowPreview = canLiveSearch && isLiveSearchEnabled(_iro.live_search_preview);

    if (resultWrapper) {
        resultWrapper.style.display = canLiveSearch ? 'none' : '';
    }

    let lastFocusedElement: HTMLElement | null = null;

    function closeSearch() {
        if (!searchDialog.open) return;

        searchButton.classList.remove('is-active');
        searchButton.setAttribute('aria-expanded', 'false');
        searchForm.classList.remove('is-active');
        document.documentElement.style.overflowY = 'unset';

        searchForm.addEventListener("transitionend", function () {
            if (searchDialog.open) {
                searchDialog.close();
            }
            if (lastFocusedElement && document.contains(lastFocusedElement)) {
                lastFocusedElement.focus();
            }
        }, { once: true });
    }

    function showSearch() {
        lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        searchDialog.showModal();
        searchButton.classList.add('is-active');
        searchButton.setAttribute('aria-expanded', 'true');
        searchForm.classList.add('is-active');
        document.documentElement.style.overflowY = 'hidden';
        window.requestAnimationFrame(() => searchInput.focus());
    }

    if (canShowPreview && detail) {
        detail.addEventListener("click", function () {
            const isActive = detail.classList.toggle("active");
            searchForm.classList.toggle("show-detail", isActive);
            detail.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    } else {
        detail?.remove();
        searchForm.classList.remove("show-detail");
    }

    closeButton?.addEventListener("click", function () {
        closeSearch();
    });

    searchButton.addEventListener("click", function (event) {
        event.stopPropagation();
        if (searchDialog.open) {
            closeSearch();
        } else {
            showSearch();
        }
    });

    searchDialog.addEventListener('cancel', function (event) {
        event.preventDefault();
        closeSearch();
    });

    document.addEventListener("click", function (event) {
        const target = event.target;
        if (target instanceof Node && !searchForm.contains(target) && !searchButton.contains(target)) {
            if (searchDialog.open) {
                closeSearch();
            }
        }
    });

    if (canLiveSearch) {
        QueryStorage = [];
        search_a(buildAPI(_iro.api + "sakura/v1/cache_search/json"), canShowPreview);

        let searchFlag: ReturnType<typeof setTimeout> = null;
        searchInput.oninput = function () {
            if (searchFlag != null) {
                clearTimeout(searchFlag);
            }
            searchFlag = setTimeout(function () {
                query(QueryStorage || [], searchInput.value, canShowPreview);
            }, 250);
        };
        document.addEventListener("pjax:complete", closeSearch);
    }
}