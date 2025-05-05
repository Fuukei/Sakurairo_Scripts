let visibilityHandler = null;
let scrollHandler = null;
let videoClickHandler = null;
let appClickHandler = null;
let appObserverInstance = null;
let imgObserverInstance = null;
let videoContainer = null;
let isInitialized = false;
let isAdmin = null;
let app = null;

function bili_fav_init () {
    app = document.getElementById("bilibili-favlist-app");
    isAdmin = _iro.is_admin;
    if (app) {
        initBilibiliFavList();
    } else {
        cleanup();
    }
    document.addEventListener("pjax:complete", () => {
        setTimeout(() => {
            initBilibiliFavList();
        }, 100);
    });
};

setInterval(bili_fav_init,3000)

function cleanup () {
    if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
        visibilityHandler = null;
    }
    if (scrollHandler) {
        window.removeEventListener("scroll", scrollHandler);
        scrollHandler = null;
    }
    if (videoClickHandler) {
        document.removeEventListener("click", videoClickHandler);
        videoClickHandler = null;
    }
    const app = document.getElementById("bilibili-favlist-app");
    if (app) {
        if (appClickHandler) {
            app.removeEventListener("click", appClickHandler);
            appClickHandler = null;
        }
    }
    if (appObserverInstance) {
        appObserverInstance.disconnect();
        appObserverInstance = null;
    }
    if (imgObserverInstance) {
        imgObserverInstance.disconnect();
        imgObserverInstance = null;
    }
    isInitialized = false;
};

// Bilibili收藏夹应用初始化函数
async function initBilibiliFavList() {
    if (isInitialized) {
        return;
    }
    cleanup();

    isInitialized = true;

    try {
        const restApiUrl = _iro.iro_api;
        const wpnonce = _iro.nonce;

        if (!restApiUrl) {
            throw new Error("初始化失败：REST API路径不可用");
        }

        const state = {
            folders: [],
            currentFolder: null,
            loading: true,
            pageSize: 12,
            currentItems: [],
            currentPage: 1,
            totalPages: 0,
            error: null,
            lastDataUpdate: 0,
            fromCache: false,
            cacheExpiresIn: 0,
            cacheAge: 0,
            cache: new Map(),
        };

        const cache = {
            getKey: (folderId, page) => `folder_${folderId}_page_${page}`,
            set: (folderId, page, data) => {
                const key = cache.getKey(folderId, page);
                state.cache.set(key, {
                    timestamp: Date.now(),
                    data: data,
                });
                try {
                    const lsKey = `bilibili_favlist_${folderId}_${page}`;
                    localStorage.setItem(
                        lsKey,
                        JSON.stringify({
                            timestamp: Date.now(),
                            data: data,
                        })
                    );
                } catch (e) {
                }
            },
            get: (folderId, page) => {
                const key = cache.getKey(folderId, page);
                let item = state.cache.get(key);
                if (!item) {
                    try {
                        const lsKey = `bilibili_favlist_${folderId}_${page}`;
                        const savedData = localStorage.getItem(lsKey);
                        if (savedData) {
                            const parsed = JSON.parse(savedData);
                            if (
                                parsed &&
                                parsed.timestamp &&
                                Date.now() - parsed.timestamp <
                                    12 * 60 * 60 * 1000
                            ) {
                                state.cache.set(key, parsed);
                                item = parsed;
                            } else {
                                localStorage.removeItem(lsKey);
                            }
                        }
                    } catch (e) {}
                }
                return item;
            },
            isValid: (cachedItem) => {
                if (!cachedItem) return false;
                return Date.now() - cachedItem.timestamp < 12 * 60 * 60 * 1000;
            },
        };

        async function initApp() {
            try {
                await fetchAllFolders();
                renderApp();
                bindEvents(); // Bind events after rendering
                setupScrollEffects(); // Setup effects after rendering
                imgObserverInstance = setupImageLazyLoading(); // Setup lazy loading and store observer
                setupVideoModal(); // Setup modal structure
                setupVideoItemsClickEvent(); // Setup click listener for video items
                setupScrollAnimations(); // Setup scroll animations
            } catch (error) {
                let errorMsg = error.message || "未知错误";
                showError(`加载收藏夹失败: ${errorMsg}<br>请刷新页面重试`);
            }
        }

        async function fetchAllFolders(forceRefresh = false) {
            state.loading = true;
            renderApp();

            if (!forceRefresh) {
                try {
                    const savedData = localStorage.getItem("bilibili_favlist_folders");
                    if (savedData) {
                        const parsed = JSON.parse(savedData);
                        if (
                            parsed &&
                            parsed.timestamp &&
                            Date.now() - parsed.timestamp < 12 * 60 * 60 * 1000
                        ) {
                            state.folders = parsed.folders;
                            if (state.folders?.length) {
                                state.currentFolder =
                                    state.currentFolder || state.folders[0].id;
                                await fetchFolderItems(
                                    state.currentFolder,
                                    1,
                                    false
                                );
                                return;
                            }
                        } else {
                            localStorage.removeItem("bilibili_favlist_folders"); // Remove expired
                        }
                    }
                } catch (e) {}
            }

            const endpoint = `${restApiUrl}/favlist/bilibili/folders`;
            try {
                let url = `${endpoint}?_wpnonce=${wpnonce}`;
                if (forceRefresh) {
                    url += `&_t=${Date.now()}`;
                }

                const response = await fetch(url, {
                    headers: {
                        "Cache-Control": forceRefresh
                            ? "no-cache, no-store, must-revalidate"
                            : "max-age=43200",
                        Pragma: forceRefresh ? "no-cache" : undefined,
                    },
                });

                if (!response.ok) throw new Error(`网络请求失败 (${response.status})`);

                const data = await response.json();
                if (data.code !== 0) throw new Error(data.message || "获取收藏夹列表失败");

                state.folders = data.data.list || [];
                if (state.folders?.length) {
                    try {
                        localStorage.setItem("bilibili_favlist_folders",JSON.stringify({timestamp: Date.now(),folders: state.folders,}));
                    } catch (e) {}
                    state.currentFolder = state.folders[0].id;
                    await fetchFolderItems(state.currentFolder,1,forceRefresh);
                } else {
                    state.loading = false;
                    state.currentItems = [];
                    state.totalPages = 0;
                    renderApp();
                }
            } catch (error) {
                showError("加载收藏夹列表失败，请刷新页面重试");
                state.loading = false;
                renderApp();
            }
        }

        async function fetchFolderItems(folderId,page = 1,forceRefresh = false) {
            state.loading = true;
            state.error = null;
            state.currentPage = page;
            state.currentFolder = folderId;
            renderApp();

            if (!forceRefresh) {
                const cachedData = cache.get(folderId, page);
                if (cache.isValid(cachedData)) {
                    const folderData = cachedData.data;
                    state.currentItems = folderData.medias || [];
                    state.totalPages = Math.ceil(
                        (folderData.info?.media_count || 0) / state.pageSize
                    );
                    state.fromCache = true;
                    state.cacheAge = Math.floor(
                        (Date.now() - cachedData.timestamp) / 1000
                    );
                    state.loading = false;
                    renderApp(true);
                    return;
                }
            }
            await fetchFolderItemsFromNetwork(folderId, page, forceRefresh);
        }

        async function fetchFolderItemsFromNetwork(folderId,page = 1,forceRefresh = false) {
            const endpoint = `${restApiUrl}/favlist/bilibili`;
            try {
                let url = `${endpoint}?folder_id=${folderId}&page=${page}&_wpnonce=${wpnonce}`;
                if (forceRefresh) {
                    url += `&_t=${Date.now()}`;
                }

                const response = await fetch(url, {
                    headers: {
                        "Cache-Control": forceRefresh
                            ? "no-cache, no-store, must-revalidate"
                            : "max-age=43200",
                        Pragma: forceRefresh ? "no-cache" : undefined,
                    },
                });

                if (!response.ok)
                    throw new Error(`网络请求失败 (${response.status})`);

                const data = await response.json();
                if (data.code !== 0)
                    throw new Error(data.message || "获取收藏内容失败");

                const folderData = data.data;
                cache.set(folderId, page, folderData); // Update cache

                state.currentItems = folderData.medias || [];
                state.totalPages = Math.ceil(
                    (folderData.info?.media_count || 0) / state.pageSize
                );
                state.fromCache = data.cache_info?.from_cache || false;
                state.cacheExpiresIn = data.cache_info?.expires_in || 0;
                state.lastDataUpdate = Date.now();
            } catch (error) {
                showError(`加载收藏内容失败: ${error.message}. 请重试`);
                state.currentItems = [];
                state.totalPages = 0;
            } finally {
                state.loading = false;
                renderApp(true);
            }
        }

        function showError(message) {
            state.error = message;
            state.loading = false;
        }

        function renderApp(isUpdate = false) {
            const EXIT_ANIMATION_DURATION = 400; // 基础退出动画时间 (ms)
            const EXIT_STAGGER_DELAY = 50; // 每个卡片退出的交错延迟 (ms)
            const ENTER_STAGGER_DELAY = 30; // 每个卡片进入的交错延迟 (ms) - 更短
            const folderSelectorHtml =
                state.folders.length > 0 ? renderFolderSelector() : "";
            let contentHtml = "";

            if (state.error) {
                contentHtml = `
                    <div class="fav-section">
                    <div class="fav-content">
                    <div class="fav-empty">
                    <p>${state.error}</p>
                    <button class="page-btn retry-btn">重试</button>
                    </div>
                    </div>
                    </div>
                `;
            } else if (state.loading && !state.currentItems.length) {
                contentHtml = renderLoadingSkeleton();
            } else if (!state.folders.length && !state.loading) {
                contentHtml = `
                    <div class="fav-section">
                    <div class="fav-content">
                    <div class="fav-empty">
                    <p>没有找到收藏夹或UID配置错误。</p>
                        <button class="page-btn retry-btn">重试</button>
                    </div>
                    </div>
                    </div>
                `;
            } else {
                contentHtml = renderCurrentFolder(); // renderCurrentFolder 现在只返回内容部分的 HTML
            }

            const existingContent = app.querySelector(".fav-section");
            const wasSkeleton =
                existingContent &&
                existingContent.querySelector(".fav-item-skeleton");
            // 仅在成功更新内容且之前不是骨架屏时应用动画
            const needsAnimation =
                isUpdate &&
                existingContent &&
                !wasSkeleton &&
                !state.loading &&
                !state.error;

            const renderNewContent = () => {
                app.innerHTML = folderSelectorHtml + contentHtml; // 渲染包括 tabs 和新内容

                // Re-bind events and apply effects to new content
                bindAppContainerEvents();
                if (
                    !state.loading &&
                    !state.error &&
                    state.currentItems.length > 0
                ) {
                    const newItems = app.querySelectorAll(".fav-item");
                    newItems.forEach((item, index) => {
                        // 为新项目添加入场动画和交错
                        item.classList.add("fav-item-enter");
                        // 添加入场交错
                        item.style.transitionDelay = `${
                            index * ENTER_STAGGER_DELAY
                        }ms`;
                        requestAnimationFrame(() => {
                            // 触发 CSS transition
                            if (item && item.parentNode) {
                                item.classList.remove("fav-item-enter");
                            }
                        });
                    });
                    // 重新设置懒加载和滚动动画
                    if (imgObserverInstance) imgObserverInstance.disconnect();
                    imgObserverInstance = setupImageLazyLoading();
                    setupScrollAnimations(); // 重新设置滚动动画监听
                } else {
                    // 如果是骨架屏或错误状态，可能不需要特定的进入动画或效果
                    if (imgObserverInstance) imgObserverInstance.disconnect(); // 确保旧的观察器被移除
                    imgObserverInstance = null;
                    if (scrollHandler)
                        window.removeEventListener("scroll", scrollHandler); // 移除旧的滚动监听
                    scrollHandler = null;
                }
            };

            if (needsAnimation) {
                const itemsToExit =
                    existingContent.querySelectorAll(".fav-item");
                if (itemsToExit.length > 0) {
                    // 计算总退出时间 (最后一个元素完成动画的时间点)
                    const totalExitDuration =
                        EXIT_ANIMATION_DURATION +
                        (itemsToExit.length - 1) * EXIT_STAGGER_DELAY;

                    // 应用交错退出动画
                    itemsToExit.forEach((item, index) => {
                        // 使用 requestAnimationFrame 确保类添加和延迟设置在同一帧或后续帧
                        requestAnimationFrame(() => {
                            // 确保元素仍然存在
                            if (item && item.parentNode) {
                                item.style.transitionDelay = `${
                                    index * EXIT_STAGGER_DELAY
                                }ms`;
                                item.classList.add("fav-item-exit");
                                // 在动画结束后移除元素上的延迟，以防干扰后续操作
                                setTimeout(() => {
                                    if (item && item.parentNode) {
                                        // 再次检查
                                        item.style.transitionDelay = "";
                                    }
                                }, EXIT_ANIMATION_DURATION + index * EXIT_STAGGER_DELAY);
                            }
                        });
                    });

                    // 稍微提前调用 renderNewContent，让进入动画开始时，退出动画接近尾声
                    // 例如，在最后一个元素开始退出动画后不久，或者总时间的 80-90% 处
                    const waitTimeForNewContent = Math.max(
                        EXIT_ANIMATION_DURATION,
                        totalExitDuration - EXIT_STAGGER_DELAY * 2
                    ); // 保证至少等待基础动画时间，并提前一点

                    // 等待计算出的时间后渲染新内容
                    setTimeout(renderNewContent, waitTimeForNewContent);
                } else {
                    // 如果没有旧项目（例如从空状态更新），直接渲染
                    renderNewContent();
                }
            } else {
                // 初始加载、加载骨架屏、显示错误、从错误重试或从骨架屏更新时，直接渲染
                renderNewContent();
            }
        }
        function renderLoadingSkeleton() {
            let skeletonHtml =
                '<div class="fav-section"><div class="fav-content"><div class="fav-grid">';
            for (let i = 0; i < state.pageSize; i++) {
                skeletonHtml += `
                    <div class="fav-item fav-item-skeleton">
                    <div class="fav-item-content-wrapper">
                    <div class="fav-item-thumb">
                    <div class="fav-item-thumb-placeholder"></div>
                    </div>
                    <div class="fav-item-desc-wrapper">
                    <div class="fav-item-desc"></div>
                    <div class="fav-item-desc"></div>
                    </div>
                    </div>
                    </div>
                `;
            }
            skeletonHtml += "</div></div></div>";
            return skeletonHtml;
        }

        function renderFolderSelector() {
            let refreshButtonHtml = "";
            // Only add refresh button if the user is an admin
            if (isAdmin) {
                refreshButtonHtml = `
                    <div class="fav-tab refresh-btn" title="强制刷新数据 (仅管理员可见)">
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 2v6h6"></path>
                    <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                    <path d="M21 22v-6h-6"></path>
                    <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                    </svg>
                    <span class="refresh-text">刷新</span>
                    </div>
                `;
            }

            return `
                <div class="fav-tabs">
                ${state.folders
                    .map(
                        (folder) => `
                            <div class="fav-tab ${folder.id === state.currentFolder ? "active" : ""}"
                            data-folder-id="${folder.id}">
                            ${folder.title}
                            <span class="fav-tab-count">${folder.media_count}</span>
                            </div>
                        `
                    )
                    .join("")}
                ${refreshButtonHtml}
                </div>
            `;
        }

        function renderCurrentFolder() {
            const currentFolder = state.folders.find(
                (folder) => folder.id === state.currentFolder
            );

            let contentHtml = "";
            if (!state.currentItems.length && !state.loading) {
                contentHtml = `<div class="fav-empty"><p>该收藏夹暂无内容</p></div>`;
            } else if (state.currentItems.length) {
                contentHtml = `
                    <div class="fav-grid">
                    ${state.currentItems.map((item) => renderFavItem(item)).join("")}
                    </div>
                    ${renderPagination()}
                `;
            }

            return `
                <div class="fav-section">
                <div class="fav-content">
                ${contentHtml}
                </div>
                </div>
            `;
        }

        function renderFavItem(item) {
            // ... existing renderFavItem code ...
            let bvid = item.bvid || "";
            // Ensure cover uses HTTPS and handle potential missing cover
            let cover = item.cover
                ? item.cover.replace(/^http:/, "https:")
                : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Placeholder for missing cover

            return `
                <div class="fav-item" data-bvid="${bvid}" data-title="${item.title}" data-up="${
                                item.upper?.name || "未知"
                            }" tabindex="0" role="button" aria-label="播放视频: ${item.title}">
                <div class="fav-item-content-wrapper">
                <div class="fav-item-thumb">
                <div class="fav-item-thumb-placeholder">
                <!-- 移除 spinner -->
                </div>
                <img data-src="${cover}" class="fav-thumb-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" referrerpolicy="no-referrer" alt="${
                                item.title
                            }">
                <div class="fav-item-title-area">
                <h3 class="fav-item-title" title="${item.title}">${item.title}</h3>
                </div>
                <div class="fav-item-up">
                <span class="up-name">UP: ${item.upper?.name || "未知"}</span>
                </div>
                <div class="fav-item-play-btn">
                <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon></svg>
                </div>
                </div>
                <div class="fav-item-desc-wrapper">
                <div class="fav-item-desc" title="${item.intro || ""}">${
                                item.intro || "暂无简介"
                            }</div>
                </div>
                </div>
                </div>
            `;
        }

        function renderPagination() {
            // ... existing renderPagination code ...
            if (state.totalPages <= 1) return "";

            let paginationHtml = '<div class="fav-pagination">';
            const currentPage = state.currentPage;
            const totalPages = state.totalPages;

            // Prev Button
            paginationHtml += `<button class="page-btn prev-btn" ${
                currentPage <= 1 ? "disabled" : ""
            } data-page="${currentPage - 1}">上一页</button>`;

            // Page numbers logic (simplified example)
            const maxPagesToShow = 5;
            let startPage = Math.max(
                1,
                currentPage - Math.floor(maxPagesToShow / 2)
            );
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

            if (endPage - startPage + 1 < maxPagesToShow) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }

            if (startPage > 1) {
                paginationHtml += `<button class="page-btn page-num" data-page="1">1</button>`;
                if (startPage > 2)
                    paginationHtml += `<button class="page-btn page-ellipsis" disabled>...</button>`;
            }

            for (let i = startPage; i <= endPage; i++) {
                paginationHtml += `<button class="page-btn page-num ${
                    i === currentPage ? "active" : ""
                }" data-page="${i}">${i}</button>`;
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1)
                    paginationHtml += `<button class="page-btn page-ellipsis" disabled>...</button>`;
                paginationHtml += `<button class="page-btn page-num" data-page="${totalPages}">${totalPages}</button>`;
            }

            // Next Button
            paginationHtml += `<button class="page-btn next-btn" ${
                currentPage >= totalPages ? "disabled" : ""
            } data-page="${currentPage + 1}">下一页</button>`;

            paginationHtml += "</div>";
            return paginationHtml;
        }

        function bindAppContainerEvents() {
            if (appClickHandler)
                app.removeEventListener("click", appClickHandler);

            appClickHandler = async function (e) {
                const target = e.target;
                const REFRESH_COOLDOWN = 60 * 1000;

                const refreshBtn = target.closest(".refresh-btn");
                if (
                    isAdmin &&
                    refreshBtn &&
                    !refreshBtn.classList.contains("refreshing")
                ) {
                    const lastRefreshTs = parseInt(localStorage.getItem("bilibili_last_refresh_ts") || "0",10);
                    const now = Date.now();
                    const remainingTime =
                        REFRESH_COOLDOWN - (now - lastRefreshTs);
                    const refreshTextSpan =
                        refreshBtn.querySelector(".refresh-text");

                    if (remainingTime > 0) {
                        if (refreshTextSpan) {
                            const originalText = refreshTextSpan.textContent;
                            refreshTextSpan.textContent = `请稍后 (${Math.ceil(
                                remainingTime / 1000
                            )}s)`;
                            setTimeout(() => {
                                const currentBtn =app.querySelector(".refresh-btn");
                                const currentTextSpan =currentBtn?.querySelector(".refresh-text");
                                if (
                                    currentTextSpan &&
                                    currentTextSpan.textContent.startsWith(
                                        "请稍后"
                                    )
                                ) {
                                    currentTextSpan.textContent = "刷新";
                                }
                            }, remainingTime);
                        }
                        return;
                    }

                    localStorage.setItem(
                        "bilibili_last_refresh_ts",
                        now.toString()
                    );
                    refreshBtn.classList.add("refreshing");
                    if (refreshTextSpan)
                        refreshTextSpan.textContent = "刷新中...";

                    try {
                        localStorage.removeItem("bilibili_favlist_folders");
                        if (state.currentFolder) {
                            for (let i = 1; i <= state.totalPages; i++) {
                                localStorage.removeItem(
                                    `bilibili_favlist_${state.currentFolder}_${i}`
                                );
                                state.cache.delete(
                                    cache.getKey(state.currentFolder, i)
                                );
                            }
                            localStorage.removeItem(
                                `bilibili_favlist_${state.currentFolder}_${state.currentPage}`
                            );
                            state.cache.delete(
                                cache.getKey(
                                    state.currentFolder,
                                    state.currentPage
                                )
                            );
                        }
                        state.cache = new Map();

                        await fetchAllFolders(true);
                    } catch (error) {
                        showError("刷新失败，请稍后重试");
                        renderApp();
                    } finally {
                        const currentRefreshBtn =
                            app.querySelector(".refresh-btn");
                        if (currentRefreshBtn) {
                            currentRefreshBtn.classList.remove("refreshing");
                            const currentTextSpan =
                                currentRefreshBtn.querySelector(
                                    ".refresh-text"
                                );
                            if (currentTextSpan)
                                currentTextSpan.textContent = "刷新";
                        }
                    }
                    return;
                }

                const tabEl = target.closest(".fav-tab:not(.refresh-btn)");
                if (tabEl) {
                    const folderId = parseInt(tabEl.dataset.folderId, 10);
                    if (folderId !== state.currentFolder && !state.loading) {
                        await fetchFolderItems(folderId, 1);
                        return;
                    }
                    return;
                }

                const pageBtn = target.closest(".page-btn[data-page]");
                if (
                    pageBtn &&
                    !pageBtn.disabled &&
                    !pageBtn.classList.contains("active")
                ) {
                    const page = parseInt(pageBtn.dataset.page, 10);
                    if (page !== state.currentPage && !state.loading) {
                        await fetchFolderItems(state.currentFolder, page);
                        scrollToTop();
                    }
                    return;
                }

                // Retry button
                const retryBtn = target.closest(".retry-btn");
                if (retryBtn) {
                    state.error = null;
                    state.loading = true;
                    renderApp();
                    try {
                        await fetchAllFolders(false);
                    } catch (error) {
                        showError(`重试失败: ${error.message}`);
                        renderApp();
                    }
                    return;
                }
            };
            app.addEventListener("click", appClickHandler);
        }

        function bindGlobalEvents() {
            let lastVisibilityChange = Date.now();
            let needReloadOnReturn = false;
            const RELOAD_THRESHOLD = 5 * 60 * 1000;

            visibilityHandler = function () {
                const now = Date.now();
                const app = document.getElementById("bilibili-favlist-app");

                if (document.visibilityState === "hidden") {
                    lastVisibilityChange = now;
                } else if (document.visibilityState === "visible") {
                    if (!app || !document.body.contains(app)) {
                        return;
                    }

                    const timeAway = now - lastVisibilityChange;
                    if (
                        isInitialized &&
                        !state.loading &&
                        state.folders.length > 0 &&
                        (timeAway > RELOAD_THRESHOLD || needReloadOnReturn)
                    ) {
                        fetchFolderItems(
                            state.currentFolder,
                            state.currentPage,
                            false
                        );
                        needReloadOnReturn = false;
                    }
                }
            };
            document.addEventListener("visibilitychange", visibilityHandler);
        }

        // Bind all events
        function bindEvents() {
            bindAppContainerEvents();
            bindGlobalEvents();
        }
        function scrollToTop() {
            const contentArea = app.querySelector(".fav-section");
            if (contentArea) {
                window.scrollTo({
                    top: contentArea.offsetTop - 80,
                    behavior: "smooth",
                });
            }
        }

        function setupScrollEffects() {
            if (!app) return;
            const itemObserver = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add("visible");
                            itemObserver.unobserve(entry.target);
                        }
                    });
                },
                { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
            );

            const items = app.querySelectorAll(".fav-item:not(.visible)");
            items.forEach((item, index) => {
                item.style.animationDelay = `${index * 0.05}s`; // Keep delay
                itemObserver.observe(item);
            });
        }

        function appMutationCallback (mutationsList){
            for (const mutation of mutationsList) {
                if (mutation.type === "childList") {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) {
                            if (node.classList.contains("fav-item")) {
                                setupScrollEffects();
                            }
                            node.querySelectorAll(
                                "img.fav-thumb-img[data-src]"
                            ).forEach((img) => {
                                if (imgObserverInstance)
                                    imgObserverInstance.observe(img);
                            });
                        }
                    });
                }
            }
        };

        function debounce(func, wait = 50) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        function setupScrollAnimations() {
            if (scrollHandler) {
                window.removeEventListener("scroll", scrollHandler);
            }

            scrollHandler = debounce(() => {
                if (!app) return;
                // 选择没有 'fav-item-exit' 类的项目来应用 'visible'
                const items = app.querySelectorAll(
                    ".fav-item:not(.visible):not(.fav-item-exit)"
                );
                const viewportHeight = window.innerHeight;
                items.forEach((item) => {
                    const rect = item.getBoundingClientRect();
                    if (
                        rect.top < viewportHeight * 0.9 &&
                        rect.bottom > viewportHeight * 0.1
                    ) {
                        // .visible 类现在可以只用于标记是否已滚动到视图，而不是控制入场动画
                        item.classList.add("visible");
                    }
                });
            }, 50); // Adjust debounce wait time as needed

            window.addEventListener("scroll", scrollHandler);
            requestAnimationFrame(scrollHandler); // 使用 rAF 确保在布局后执行初始检查
        }

        function setupImageLazyLoading() {
            if (imgObserverInstance) {
                imgObserverInstance.disconnect();
            }

            const observer = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            const src = img.getAttribute("data-src");
                            if (src) {
                                const placeholder = img.previousElementSibling;

                                img.onload = () => {
                                    img.classList.add("loaded");
                                    if (
                                        placeholder &&
                                        placeholder.classList.contains(
                                            "fav-item-thumb-placeholder"
                                        )
                                    ) {
                                        placeholder.style.display = "none";
                                    }
                                };
                                img.onerror = () => window.imgError(this);
                                img.src = src;
                                img.removeAttribute("data-src");
                            }
                            obs.unobserve(img);
                        }
                    });
                },
                { threshold: 0.05, rootMargin: "150px" }
            );

            if (app) {
                app.querySelectorAll("img.fav-thumb-img[data-src]").forEach(
                    (img) => observer.observe(img)
                );
            }
            return observer;
        }

        // --- Video Modal ---
        function setupVideoModal() {
            videoContainer = document.querySelector(".video-modal");

            function closeVideoModal () {
                if (!videoContainer) return;
                const container = videoContainer.querySelector(".video-modal-container");
                const iframe = videoContainer.querySelector(".video-modal-iframe");

                container.style.transform = "translateY(20px)";
                container.style.opacity = "0";

                setTimeout(() => {
                        videoContainer.classList.remove("active");
                        videoContainer.close();
                        document.body.style.overflow = "";
                        if (iframe) iframe.src = "about:blank";
                }, 300);
            };
            videoContainer.querySelector(".video-modal-close").addEventListener("click", closeVideoModal);
            videoContainer.addEventListener("click", (e) => {
                if (e.target === videoContainer) {
                    closeVideoModal();
                }
            });
            return videoContainer;
        }

        function handleFavItemClick(favItem) {
            const bvid = favItem.getAttribute("data-bvid");
            if (bvid && videoContainer) {
                const title = favItem.getAttribute("data-title");
                const upName = favItem.getAttribute("data-up");

                videoContainer.querySelector(".video-modal-title").textContent = title;
                videoContainer.querySelector(".video-modal-up-name").textContent = "UP: " + upName;
                videoContainer.querySelector(".video-modal-open").href = `https://www.bilibili.com/video/${bvid}`;

                const iframe = videoContainer.querySelector(".video-modal-iframe");
                iframe.src = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1&danmaku=1`;

                videoContainer.showModal();
                videoContainer.classList.add("active");
                document.body.style.overflow = "hidden";

                setTimeout(() => {
                    if (videoContainer) {
                        const container = videoContainer.querySelector(".video-modal-container");
                        if (container) {
                            container.style.transform = "translateY(0)";
                            container.style.opacity = "1";
                        }
                    }
                }, 10);
            }
        }

        function setupVideoItemsClickEvent() {
            if (videoClickHandler) {
                document.removeEventListener("click", videoClickHandler);
            }

            videoClickHandler = (e) => {
                const favItem = e.target.closest(".fav-item");
                if (favItem) {
                    e.preventDefault();
                    handleFavItemClick(favItem);
                }
            };
            document.addEventListener("click", videoClickHandler);
        }

        // --- Initialization ---
        await initApp();

        if (appObserverInstance) {
            appObserverInstance.disconnect();
        }
        appObserverInstance = new MutationObserver(appMutationCallback);
        if (app) {
            appObserverInstance.observe(app, {
                childList: true,
                subtree: true,
            });
        }
    } catch (error) {
        const app = document.getElementById("bilibili-favlist-app");
        if (app) {
            app.innerHTML = `
                <div class="fav-empty">
                <p>加载收藏夹时发生严重错误: ${error.message || "未知错误"}</p>
                <button class="page-btn retry-btn">重试</button>
                </div>
            `;
            app.querySelector(".retry-btn")?.addEventListener("click", initBilibiliFavList);
        }
        isInitialized = false;
    }
};