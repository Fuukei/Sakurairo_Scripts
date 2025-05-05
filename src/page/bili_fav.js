// Pass admin status to JavaScript
const isAdmin = <?php echo json_encode(current_user_can('manage_options')); ?>;

(function() {
   // --- Scope variables for handlers and observers ---
   let visibilityHandler = null;
   let scrollHandler = null;
   let escHandler = null;
   let videoClickHandler = null;
   let appKeydownHandler = null;
   let appClickHandler = null;
   let appObserverInstance = null;
   let imgObserverInstance = null;
   let videoModalInstance = null; // Store reference to the modal element
   let isInitialized = false; // Flag to prevent multiple initializations without cleanup

   // --- Cleanup Function ---
   const cleanup = () => {
       // console.log('Cleaning up Bilibili FavList...');

       // Remove event listeners
       if (visibilityHandler) {
           document.removeEventListener('visibilitychange', visibilityHandler);
           visibilityHandler = null;
       }
       if (scrollHandler) {
           window.removeEventListener('scroll', scrollHandler);
           scrollHandler = null;
       }
       if (escHandler) {
           document.removeEventListener('keydown', escHandler);
           escHandler = null;
       }
       if (videoClickHandler) {
           document.removeEventListener('click', videoClickHandler); // Removed from document
           videoClickHandler = null;
       }
       // Remove listeners attached to the app container if it exists
       const app = document.getElementById('bilibili-favlist-app');
       if (app) {
           if (appKeydownHandler) {
               app.removeEventListener('keydown', appKeydownHandler);
               appKeydownHandler = null;
           }
           if (appClickHandler) {
               app.removeEventListener('click', appClickHandler);
               appClickHandler = null;
           }
       }


       // Disconnect observers
       if (appObserverInstance) {
           appObserverInstance.disconnect();
           appObserverInstance = null;
       }
       if (imgObserverInstance) {
           imgObserverInstance.disconnect();
           imgObserverInstance = null;
       }

       // Close and remove video modal if it exists
       if (videoModalInstance) {
           const closeBtn = videoModalInstance.querySelector('.video-modal-close');
           if (closeBtn) {
                // Manually trigger close logic if needed, or just remove
                const iframe = videoModalInstance.querySelector('.video-modal-iframe');
                if (iframe) iframe.src = ""; // Stop video
           }
           videoModalInstance.remove(); // Remove modal from DOM
           videoModalInstance = null;
           // Restore body overflow if it was changed
           document.body.style.overflow = '';
       }

       // Reset initialization flag
       isInitialized = false;
       // console.log('Cleanup complete.');
   };

   // Bilibili收藏夹应用初始化函数
   const initBilibiliFavList = async () => {
       // Prevent re-initialization if already initialized without cleanup
       if (isInitialized) {
           // console.log('Already initialized, skipping.');
           return;
       }

       // Ensure cleanup runs first, especially important for PJAX
       cleanup();

       const app = document.getElementById('bilibili-favlist-app');
       if (!app) {
           // console.log('Target element #bilibili-favlist-app not found. Aborting initialization.');
           return; // Target element not found, do nothing
       }

       // console.log('Initializing Bilibili FavList...');
       isInitialized = true; // Set flag

       try {
           const restApiUrl = '<?php echo esc_url_raw(rest_url('sakura/v1')); ?>';
           const wpnonce = '<?php echo wp_create_nonce('wp_rest'); ?>';

           if (!restApiUrl) {
               throw new Error('初始化失败：REST API路径不可用');
           }

           // console.log('Bilibili收藏夹应用初始化，API: ', restApiUrl);
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
               cache: new Map()
           };

           const cache = {
               getKey: (folderId, page) => `folder_${folderId}_page_${page}`,
               set: (folderId, page, data) => {
                   const key = cache.getKey(folderId, page);
                   state.cache.set(key, {
                       timestamp: Date.now(),
                       data: data
                   });
                   // Also save to localStorage for persistence across sessions/refreshes
                   try {
                       const lsKey = `bilibili_favlist_${folderId}_${page}`;
                       localStorage.setItem(lsKey, JSON.stringify({
                           timestamp: Date.now(),
                           data: data
                       }));
                   } catch (e) {
                       // console.warn('保存到本地存储失败', e);
                   }
               },
               get: (folderId, page) => {
                   const key = cache.getKey(folderId, page);
                   let item = state.cache.get(key);
                   // If not in memory cache, try localStorage
                   if (!item) {
                        try {
                           const lsKey = `bilibili_favlist_${folderId}_${page}`;
                           const savedData = localStorage.getItem(lsKey);
                           if (savedData) {
                               const parsed = JSON.parse(savedData);
                               // Check if localStorage data is valid (within 12 hours)
                               if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < 12 * 60 * 60 * 1000)) {
                                   // console.log('Restored item from localStorage', { folderId, page });
                                   // Load into memory cache
                                   state.cache.set(key, parsed);
                                   item = parsed;
                               } else {
                                   // Remove expired data from localStorage
                                   localStorage.removeItem(lsKey);
                               }
                           }
                       } catch (e) {
                           // console.warn('从本地存储恢复失败', e);
                       }
                   }
                   return item;
               },
               isValid: (cachedItem) => {
                   if (!cachedItem) return false;
                   return (Date.now() - cachedItem.timestamp) < 12 * 60 * 60 * 1000; // 12 hours
               }
           };

           async function initApp() {
               try {
                   // console.log('初始化应用开始');
                   await fetchAllFolders();
                   renderApp();
                   bindEvents(); // Bind events after rendering
                   setupScrollEffects(); // Setup effects after rendering
                   imgObserverInstance = setupImageLazyLoading(); // Setup lazy loading and store observer
                   setupVideoModal(); // Setup modal structure
                   setupVideoItemsClickEvent(); // Setup click listener for video items
                   setupScrollAnimations(); // Setup scroll animations
                   // console.log('初始化应用完成');
               } catch (error) {
                   // console.error('初始化失败:', error);
                   let errorMsg = error.message || '未知错误';
                   showError(`加载收藏夹失败: ${errorMsg}<br>请刷新页面重试`);
               }
           }

           async function fetchAllFolders(forceRefresh = false) {
               state.loading = true; // Set loading state
               renderApp(); // Render loading state immediately

               if (!forceRefresh) {
                   try {
                       const savedData = localStorage.getItem('bilibili_favlist_folders');
                       if (savedData) {
                           const parsed = JSON.parse(savedData);
                           if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp < 12 * 60 * 60 * 1000)) {
                               // console.log('从本地存储恢复收藏夹列表');
                               state.folders = parsed.folders;
                               if (state.folders?.length) {
                                   state.currentFolder = state.currentFolder || state.folders[0].id;
                                   // Don't set loading to false here, let fetchFolderItems handle it
                                   await fetchFolderItems(state.currentFolder, 1, false); // Use cache if available
                                   return;
                               }
                           } else {
                               localStorage.removeItem('bilibili_favlist_folders'); // Remove expired
                           }
                       }
                   } catch (e) {
                       // console.warn('恢复本地缓存失败', e);
                   }
               }

               const endpoint = `${restApiUrl}/favlist/bilibili/folders`;
               try {
                   let url = `${endpoint}?_wpnonce=${wpnonce}`;
                   if (forceRefresh) {
                       url += `&_t=${Date.now()}`;
                   }

                   const response = await fetch(url, {
                       headers: {
                           'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate' : 'max-age=43200', // Align with backend?
                           'Pragma': forceRefresh ? 'no-cache' : undefined // Pragma is deprecated
                       }
                   });

                   if (!response.ok) throw new Error(`网络请求失败 (${response.status})`);

                   const data = await response.json();
                   if (data.code !== 0) throw new Error(data.message || '获取收藏夹列表失败');

                   state.folders = data.data.list || []; // Ensure it's an array
                   if (state.folders?.length) {
                       try {
                           localStorage.setItem('bilibili_favlist_folders', JSON.stringify({
                               timestamp: Date.now(),
                               folders: state.folders
                           }));
                       } catch (e) {
                           // console.warn('保存收藏夹列表到本地存储失败', e);
                       }
                       state.currentFolder = state.folders[0].id;
                       await fetchFolderItems(state.currentFolder, 1, forceRefresh); // Fetch items for the first folder
                   } else {
                       // Handle case with no folders
                       state.loading = false;
                       state.currentItems = [];
                       state.totalPages = 0;
                       renderApp(); // Render empty state
                   }
               } catch (error) {
                   // console.error('获取收藏夹列表失败:', error);
                   showError('加载收藏夹列表失败，请刷新页面重试');
                   state.loading = false; // Ensure loading is false on error
                   renderApp(); // Render error state
               }
               // No finally block needed here as loading state is handled within success/error paths
           }

           async function fetchFolderItems(folderId, page = 1, forceRefresh = false) {
               state.loading = true;
               state.error = null; // Clear previous errors
               state.currentPage = page; // Update current page immediately for UI feedback
               state.currentFolder = folderId; // Update current folder
               renderApp(); // Show loading state (skeleton) for the specific folder/page

               if (!forceRefresh) {
                   const cachedData = cache.get(folderId, page);
                   if (cache.isValid(cachedData)) {
                       // console.log('使用缓存的收藏夹内容', { folderId, page });
                       const folderData = cachedData.data;
                       state.currentItems = folderData.medias || [];
                       state.totalPages = Math.ceil((folderData.info?.media_count || 0) / state.pageSize);
                       state.fromCache = true;
                       state.cacheAge = Math.floor((Date.now() - cachedData.timestamp) / 1000);
                       state.loading = false;
                       renderApp(true); // Render cached content, indicate it's an update
                       // 移除这里的效果重置，由 renderApp 处理
                       // setTimeout(() => { ... }, 0);
                       return;
                   }
               }

               await fetchFolderItemsFromNetwork(folderId, page, forceRefresh);
           }

           async function fetchFolderItemsFromNetwork(folderId, page = 1, forceRefresh = false) {
               const endpoint = `${restApiUrl}/favlist/bilibili`;
               try {
                   // console.log('从网络获取收藏夹内容', { folderId, page, forceRefresh });
                   let url = `${endpoint}?folder_id=${folderId}&page=${page}&_wpnonce=${wpnonce}`;
                   if (forceRefresh) {
                       url += `&_t=${Date.now()}`;
                   }

                   const response = await fetch(url, {
                       headers: {
                           'Cache-Control': forceRefresh ? 'no-cache, no-store, must-revalidate' : 'max-age=43200',
                           'Pragma': forceRefresh ? 'no-cache' : undefined
                       }
                   });

                   if (!response.ok) throw new Error(`网络请求失败 (${response.status})`);

                   const data = await response.json();
                   if (data.code !== 0) throw new Error(data.message || '获取收藏内容失败');

                   const folderData = data.data;
                   cache.set(folderId, page, folderData); // Update cache

                   state.currentItems = folderData.medias || [];
                   state.totalPages = Math.ceil((folderData.info?.media_count || 0) / state.pageSize);
                   state.fromCache = data.cache_info?.from_cache || false;
                   state.cacheExpiresIn = data.cache_info?.expires_in || 0;
                   state.lastDataUpdate = Date.now();

               } catch (error) {
                   // console.error('获取收藏夹内容失败:', error);
                   showError(`加载收藏内容失败: ${error.message}. 请重试`);
                   state.currentItems = []; // Clear items on error
                   state.totalPages = 0;
               } finally {
                   state.loading = false;
                   renderApp(true); // Render results or error, indicate it's an update
                   // 移除这里的效果重置，由 renderApp 处理
                   // setTimeout(() => { ... }, 0);
               }
           }

           function showError(message) {
               state.error = message;
               state.loading = false;
               // Don't render here, let the caller handle rendering
           }

           function renderApp(isUpdate = false) { // 添加 isUpdate 参数
                if (!app) return;

                const EXIT_ANIMATION_DURATION = 400; // 基础退出动画时间 (ms)
                const EXIT_STAGGER_DELAY = 50; // 每个卡片退出的交错延迟 (ms)
                const ENTER_STAGGER_DELAY = 30; // 每个卡片进入的交错延迟 (ms) - 更短
                const folderSelectorHtml = state.folders.length > 0 ? renderFolderSelector() : '';
                let contentHtml = '';

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

                const existingContent = app.querySelector('.fav-section');
                // 检查之前的内容是否是骨架屏
                const wasSkeleton = existingContent && existingContent.querySelector('.fav-item-skeleton');
                // 仅在成功更新内容且之前不是骨架屏时应用动画
                const needsAnimation = isUpdate && existingContent && !wasSkeleton && !state.loading && !state.error;

                const renderNewContent = () => {
                    app.innerHTML = folderSelectorHtml + contentHtml; // 渲染包括 tabs 和新内容

                    // Re-bind events and apply effects to new content
                    bindAppContainerEvents();
                    if (!state.loading && !state.error && state.currentItems.length > 0) {
                        const newItems = app.querySelectorAll('.fav-item');
                        newItems.forEach((item, index) => { // 为新项目添加入场动画和交错
                            item.classList.add('fav-item-enter');
                            // 添加入场交错
                            item.style.transitionDelay = `${index * ENTER_STAGGER_DELAY}ms`;
                            requestAnimationFrame(() => { // 触发 CSS transition
                                // Ensure item still exists before removing class
                                if (item && item.parentNode) {
                                    item.classList.remove('fav-item-enter');
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
                        if (scrollHandler) window.removeEventListener('scroll', scrollHandler); // 移除旧的滚动监听
                        scrollHandler = null;
                    }
                };

                if (needsAnimation) {
                    const itemsToExit = existingContent.querySelectorAll('.fav-item');
                    if (itemsToExit.length > 0) {
                        // 计算总退出时间 (最后一个元素完成动画的时间点)
                        const totalExitDuration = EXIT_ANIMATION_DURATION + (itemsToExit.length - 1) * EXIT_STAGGER_DELAY;

                        // 应用交错退出动画
                        itemsToExit.forEach((item, index) => {
                            // 使用 requestAnimationFrame 确保类添加和延迟设置在同一帧或后续帧
                            requestAnimationFrame(() => {
                                // 确保元素仍然存在
                                if (item && item.parentNode) {
                                    item.style.transitionDelay = `${index * EXIT_STAGGER_DELAY}ms`;
                                    item.classList.add('fav-item-exit');
                                    // 在动画结束后移除元素上的延迟，以防干扰后续操作
                                    setTimeout(() => {
                                        if (item && item.parentNode) { // 再次检查
                                            item.style.transitionDelay = '';
                                        }
                                    }, EXIT_ANIMATION_DURATION + index * EXIT_STAGGER_DELAY);
                                }
                            });
                        });

                        // 稍微提前调用 renderNewContent，让进入动画开始时，退出动画接近尾声
                        // 例如，在最后一个元素开始退出动画后不久，或者总时间的 80-90% 处
                        const waitTimeForNewContent = Math.max(EXIT_ANIMATION_DURATION, totalExitDuration - EXIT_STAGGER_DELAY * 2); // 保证至少等待基础动画时间，并提前一点

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
               let skeletonHtml = '<div class="fav-section"><div class="fav-content"><div class="fav-grid">';
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
               skeletonHtml += '</div></div></div>';
               return skeletonHtml;
           }

           function renderFolderSelector() {
               let refreshButtonHtml = '';
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
                       ${state.folders.map(folder => `
                           <div class="fav-tab ${folder.id === state.currentFolder ? 'active' : ''}"
                                data-folder-id="${folder.id}">
                               ${folder.title}
                               <span class="fav-tab-count">${folder.media_count}</span>
                           </div>
                       `).join('')}
                       ${refreshButtonHtml}
                   </div>
               `;
           }

           function renderCurrentFolder() {
               const currentFolder = state.folders.find(folder => folder.id === state.currentFolder);

               let contentHtml = '';
               // 移除 state.loading 的判断，骨架屏由 renderApp 控制
               if (!state.currentItems.length && !state.loading) { // 仅在非加载状态且无内容时显示空状态
                   contentHtml = `<div class="fav-empty"><p>该收藏夹暂无内容</p></div>`;
               } else if (state.currentItems.length) { // 仅在有内容时渲染网格和分页
                   contentHtml = `
                       <div class="fav-grid">
                           ${state.currentItems.map(item => renderFavItem(item)).join('')}
                       </div>
                       ${renderPagination()}
                   `;
               }
               // 如果 state.loading 为 true 且 state.currentItems 为空，renderApp 会渲染骨架屏，这里不需要额外处理

               return `
                   <div class="fav-section">
                       <div class="fav-content">
                           ${contentHtml}
                       </div>
                   </div>
               `;
           }

           function renderFolderContent() {
               if (!state.currentItems.length) {
                   return `<div class="fav-empty"><p>该收藏夹暂无内容</p></div>`;
               }
               return `
                   <div class="fav-grid">
                       ${state.currentItems.map(item => renderFavItem(item)).join('')}
                   </div>
                   ${renderPagination()}
               `;
           }

           function renderFavItem(item) {
               // ... existing renderFavItem code ...
                let bvid = item.bvid || '';
               // Ensure cover uses HTTPS and handle potential missing cover
               let cover = item.cover ? item.cover.replace(/^http:/, 'https:') : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // Placeholder for missing cover
               let pubdate = item.pubdate ? formatDate(item.pubdate * 1000) : ''; // Handle missing pubdate

               return `
                   <div class="fav-item" data-bvid="${bvid}" data-title="${item.title}" data-up="${item.upper?.name || '未知'}" tabindex="0" role="button" aria-label="播放视频: ${item.title}">
                       <div class="fav-item-content-wrapper">
                           <div class="fav-item-thumb">
                               <div class="fav-item-thumb-placeholder">
                                   <!-- 移除 spinner -->
                               </div>
                               <img data-src="${cover}" class="fav-thumb-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" referrerpolicy="no-referrer" alt="${item.title}">
                               <div class="fav-item-title-area">
                                   <h3 class="fav-item-title" title="${item.title}">${item.title}</h3>
                               </div>
                               <div class="fav-item-up">
                                   <span class="up-name">UP: ${item.upper?.name || '未知'}</span>
                               </div>
                               <div class="fav-item-play-btn">
                                   <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"></polygon></svg>
                               </div>
                           </div>
                           <div class="fav-item-desc-wrapper">
                               <div class="fav-item-desc" title="${item.intro || ''}">${item.intro || '暂无简介'}</div>
                           </div>
                       </div>
                   </div>
               `;
           }

           function formatDate(timestamp) {
               // ... existing formatDate code ...
                const date = new Date(timestamp);
               const now = new Date();
               const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

               if (diffDays < 1) { return '今天'; }
               if (diffDays === 1) { return '昨天'; }
               if (diffDays < 7) { return `${diffDays}天前`; }
               // Simplified date format
               return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
           }

           function formatTimeLeft(seconds) {
               // ... existing formatTimeLeft code ...
                if (seconds < 60) { return `${seconds}秒`; }
                if (seconds < 3600) { return `${Math.floor(seconds / 60)}分钟`; }
                if (seconds < 86400) { return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`; }
                return `${Math.floor(seconds / 86400)}天${Math.floor((seconds % 86400) / 3600)}小时`;
           }

           function renderPagination() {
               // ... existing renderPagination code ...
                if (state.totalPages <= 1) return '';

               let paginationHtml = '<div class="fav-pagination">';
               const currentPage = state.currentPage;
               const totalPages = state.totalPages;

               // Prev Button
               paginationHtml += `<button class="page-btn prev-btn" ${currentPage <= 1 ? 'disabled' : ''} data-page="${currentPage - 1}">上一页</button>`;

               // Page numbers logic (simplified example)
               const maxPagesToShow = 5;
               let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
               let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

               if (endPage - startPage + 1 < maxPagesToShow) {
                   startPage = Math.max(1, endPage - maxPagesToShow + 1);
               }

               if (startPage > 1) {
                   paginationHtml += `<button class="page-btn page-num" data-page="1">1</button>`;
                   if (startPage > 2) paginationHtml += `<button class="page-btn page-ellipsis" disabled>...</button>`;
               }

               for (let i = startPage; i <= endPage; i++) {
                   paginationHtml += `<button class="page-btn page-num ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
               }

               if (endPage < totalPages) {
                   if (endPage < totalPages - 1) paginationHtml += `<button class="page-btn page-ellipsis" disabled>...</button>`;
                   paginationHtml += `<button class="page-btn page-num" data-page="${totalPages}">${totalPages}</button>`;
               }

               // Next Button
               paginationHtml += `<button class="page-btn next-btn" ${currentPage >= totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">下一页</button>`;

               paginationHtml += '</div>';
               return paginationHtml;
           }

           // Bind events delegated to the app container
           function bindAppContainerEvents() {
                if (!app) return;

                // Remove previous listeners first to prevent duplicates if called multiple times
                if (appKeydownHandler) app.removeEventListener('keydown', appKeydownHandler);
                if (appClickHandler) app.removeEventListener('click', appClickHandler);

                // Keyboard accessibility for fav items
                appKeydownHandler = function(e) {
                   if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('fav-item')) {
                       e.preventDefault();
                       // Find the closest fav-item and trigger its click logic (handled by appClickHandler)
                        const favItem = e.target.closest('.fav-item');
                        if(favItem) {
                            handleFavItemClick(favItem);
                        }
                   }
                };
                app.addEventListener('keydown', appKeydownHandler);

                // Main click handler using event delegation
                appClickHandler = async function(e) {
                   const target = e.target;
                   const REFRESH_COOLDOWN = 60 * 1000; // 60 seconds cooldown

                   // Refresh button (Check isAdmin again for safety, though button shouldn't exist if not admin)
                   const refreshBtn = target.closest('.refresh-btn');
                   if (isAdmin && refreshBtn && !refreshBtn.classList.contains('refreshing')) {
                       const lastRefreshTs = parseInt(localStorage.getItem('bilibili_last_refresh_ts') || '0', 10);
                       const now = Date.now();
                       const remainingTime = REFRESH_COOLDOWN - (now - lastRefreshTs);
                       const refreshTextSpan = refreshBtn.querySelector('.refresh-text');

                       if (remainingTime > 0) {
                           // console.log(`刷新冷却中，剩余 ${Math.ceil(remainingTime / 1000)} 秒`);
                           if (refreshTextSpan) {
                               const originalText = refreshTextSpan.textContent;
                               refreshTextSpan.textContent = `请稍后 (${Math.ceil(remainingTime / 1000)}s)`;
                               // Temporarily disable? Or just show text. Let's just show text.
                               setTimeout(() => {
                                   // Check if the button still exists and text hasn't changed
                                   const currentBtn = app.querySelector('.refresh-btn');
                                   const currentTextSpan = currentBtn?.querySelector('.refresh-text');
                                   if (currentTextSpan && currentTextSpan.textContent.startsWith('请稍后')) {
                                       currentTextSpan.textContent = '刷新';
                                   }
                               }, remainingTime);
                           }
                           return; // Exit if in cooldown
                       }

                       // console.log('点击强制刷新按钮');
                       localStorage.setItem('bilibili_last_refresh_ts', now.toString()); // Set cooldown timestamp
                       refreshBtn.classList.add('refreshing');
                       if (refreshTextSpan) refreshTextSpan.textContent = '刷新中...';

                       try {
                           // Clear relevant localStorage and memory cache
                           localStorage.removeItem('bilibili_favlist_folders');
                           if (state.currentFolder) {
                               // Clear cache for all pages of the current folder? Or just current page?
                               // Let's clear all for simplicity on manual refresh
                               for (let i = 1; i <= state.totalPages; i++) {
                                    localStorage.removeItem(`bilibili_favlist_${state.currentFolder}_${i}`);
                                    state.cache.delete(cache.getKey(state.currentFolder, i));
                               }
                               // Also clear the current page just in case totalPages was 0
                               localStorage.removeItem(`bilibili_favlist_${state.currentFolder}_${state.currentPage}`);
                               state.cache.delete(cache.getKey(state.currentFolder, state.currentPage));
                           }
                           state.cache = new Map(); // Clear memory cache completely

                           await fetchAllFolders(true); // Force refresh folders and first page
                       } catch (error) {
                           // console.error('强制刷新失败:', error);
                           showError('刷新失败，请稍后重试');
                           renderApp(); // Re-render to show error
                       } finally {
                           // Ensure button state is reset even if renderApp was called
                           const currentRefreshBtn = app.querySelector('.refresh-btn');
                           if (currentRefreshBtn) {
                               currentRefreshBtn.classList.remove('refreshing');
                               const currentTextSpan = currentRefreshBtn.querySelector('.refresh-text');
                               if (currentTextSpan) currentTextSpan.textContent = '刷新';
                           }
                       }
                       return;
                   }

                   // Folder tab
                   const tabEl = target.closest('.fav-tab:not(.refresh-btn)');
                   if (tabEl) {
                       const folderId = parseInt(tabEl.dataset.folderId, 10);
                       if (folderId !== state.currentFolder && !state.loading) {
                           // console.log('切换收藏夹:', folderId);
                           await fetchFolderItems(folderId, 1);
                           return;
                       }
                       return;
                   }

                   // Pagination buttons (prev, next, page number)
                   const pageBtn = target.closest('.page-btn[data-page]');
                   if (pageBtn && !pageBtn.disabled && !pageBtn.classList.contains('active')) {
                       const page = parseInt(pageBtn.dataset.page, 10);
                        if (page !== state.currentPage && !state.loading) {
                           await fetchFolderItems(state.currentFolder, page);
                           scrollToTop();
                       }
                       return;
                   }

                   // Retry button
                   const retryBtn = target.closest('.retry-btn');
                   if (retryBtn) {
                       // console.log('点击重试按钮');
                       state.error = null;
                       state.loading = true;
                       renderApp(); // Show loading state
                       try {
                           // Re-run the initialization logic for the current state or full init?
                           // Let's try fetching folders again.
                           await fetchAllFolders(false); // Try fetching folders (will use cache if valid)
                       } catch (error) {
                           // console.error('重试失败:', error);
                           showError(`重试失败: ${error.message}`);
                           renderApp(); // Show error again
                       }
                       return;
                   }

                    // Favorite item click (handled by global listener now)
                    // Moved to setupVideoItemsClickEvent
                };
                app.addEventListener('click', appClickHandler);
           }

            // Separate function to bind non-delegated events (window, document)
           function bindGlobalEvents() {
                // Visibility change
                let lastVisibilityChange = Date.now();
                let needReloadOnReturn = false;
                const RELOAD_THRESHOLD = 5 * 60 * 1000; // 5 minutes threshold for reload on return

                visibilityHandler = function() {
                    const now = Date.now();
                    const app = document.getElementById('bilibili-favlist-app'); // Get app element reference inside handler

                    if (document.visibilityState === 'hidden') {
                        lastVisibilityChange = now;
                    } else if (document.visibilityState === 'visible') {
                        // Ensure app exists in the current document before proceeding
                        if (!app || !document.body.contains(app)) {
                            return; // App element not found or detached, likely during PJAX transition
                        }

                        const timeAway = now - lastVisibilityChange;
                        // Check initialization, app presence, loading state, and time threshold
                        if (isInitialized && !state.loading && state.folders.length > 0 && (timeAway > RELOAD_THRESHOLD || needReloadOnReturn)) {
                            // console.log('页面返回，重新加载当前收藏夹内容', { timeAway: timeAway / 1000 + '秒' });
                            // Fetch current folder/page, force refresh = false (use cache if valid)
                            fetchFolderItems(state.currentFolder, state.currentPage, false);
                            needReloadOnReturn = false;
                        }
                    }
                };
                document.addEventListener('visibilitychange', visibilityHandler);

                // Scroll animations (handled by setupScrollAnimations)

                // ESC key for modal (handled by setupVideoModal)
           }

           // Bind all events
           function bindEvents() {
               bindAppContainerEvents(); // Bind events delegated to the app container
               bindGlobalEvents(); // Bind window/document level events
           }

           // Helper to scroll to the top of the content area
           function scrollToTop() {
               const contentArea = app.querySelector('.fav-section'); // Or app itself
               if (contentArea) {
                   window.scrollTo({
                       top: contentArea.offsetTop - 80, // Adjust offset as needed
                       behavior: 'smooth'
                   });
               }
           }

           // --- Effects and Lazy Loading ---

           function setupScrollEffects() {
                if (!app) return;
                // Simple fade-in effect using Intersection Observer
                const itemObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('visible');
                            itemObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

                const items = app.querySelectorAll('.fav-item:not(.visible)');
                items.forEach((item, index) => {
                    item.style.animationDelay = `${index * 0.05}s`; // Keep delay
                    itemObserver.observe(item);
                });

                // Store observer reference if needed for cleanup, though unobserve might be enough
                // If items are added dynamically, this needs to be called again.
           }

           const appMutationCallback = (mutationsList, observer) => {
                for(const mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        // New nodes added?
                        mutation.addedNodes.forEach(node => {
                            // If new fav-items were added, apply scroll effects and lazy loading
                            if (node.nodeType === 1) {
                                if (node.classList.contains('fav-item')) {
                                    setupScrollEffects(); // Re-apply to potentially new items
                                }
                                // Check for images within the added node
                                node.querySelectorAll('img.fav-thumb-img[data-src]').forEach(img => {
                                    if (imgObserverInstance) imgObserverInstance.observe(img);
                                });
                            }
                        });
                    }
                }
           };


           // Debounce function
           function debounce(func, wait = 50) {
               let timeout;
               return function(...args) {
                   clearTimeout(timeout);
                   timeout = setTimeout(() => func.apply(this, args), wait);
               };
           }

           function setupScrollAnimations() {
               // Remove previous handler if exists
               if (scrollHandler) {
                   window.removeEventListener('scroll', scrollHandler);
               }

               scrollHandler = debounce(() => {
                   if (!app) return;
                   // 选择没有 'fav-item-exit' 类的项目来应用 'visible'
                   const items = app.querySelectorAll('.fav-item:not(.visible):not(.fav-item-exit)');
                   const viewportHeight = window.innerHeight;
                   items.forEach(item => {
                       const rect = item.getBoundingClientRect();
                       // Trigger when item is 85% in view from the bottom
                       if (rect.top < viewportHeight * 0.90 && rect.bottom > viewportHeight * 0.1) {
                            // .visible 类现在可以只用于标记是否已滚动到视图，而不是控制入场动画
                            item.classList.add('visible');
                       }
                   });
               }, 50); // Adjust debounce wait time as needed

               window.addEventListener('scroll', scrollHandler);
               // Initial check
               requestAnimationFrame(scrollHandler); // 使用 rAF 确保在布局后执行初始检查
           }


           function setupImageLazyLoading() {
               // Disconnect previous observer if exists
               if (imgObserverInstance) {
                   imgObserverInstance.disconnect();
               }

               const observer = new IntersectionObserver((entries, obs) => {
                   entries.forEach(entry => {
                       if (entry.isIntersecting) {
                           const img = entry.target;
                           const src = img.getAttribute('data-src');
                           if (src) {
                               const placeholder = img.previousElementSibling; // Assuming placeholder is sibling

                               img.onload = () => {
                                   img.classList.add('loaded');
                                   if (placeholder && placeholder.classList.contains('fav-item-thumb-placeholder')) {
                                       placeholder.style.display = 'none'; // Hide placeholder
                                   }
                               };
                               img.onerror = () => {
                                   // console.warn('图片加载失败:', src);
                                   img.classList.add('loaded', 'error'); // Mark as loaded but with error
                                    if (placeholder && placeholder.classList.contains('fav-item-thumb-placeholder')) {
                                        placeholder.innerHTML = '<svg fill="#ccc" width="32" height="32" viewBox="0 0 24 24"><path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/></svg>'; // Show error icon
                                        placeholder.style.display = 'flex'; // Ensure placeholder is visible
                                    }
                                   // Optionally set a fallback image src
                                   // img.src = 'path/to/fallback.jpg';
                               };
                               img.src = src;
                               img.removeAttribute('data-src');
                           }
                           obs.unobserve(img); // Unobserve after processing
                       }
                   });
               }, { threshold: 0.05, rootMargin: '150px' }); // Increased rootMargin

               if (app) {
                   app.querySelectorAll('img.fav-thumb-img[data-src]').forEach(img => observer.observe(img));
               }
               return observer; // Return the observer instance
           }


           // --- Video Modal ---
            function setupVideoModal() {
                // Remove existing modal first during re-init
                const existingModal = document.querySelector('.video-modal');
                if (existingModal) {
                    existingModal.remove();
                }

                videoModalInstance = document.createElement('div');
                videoModalInstance.className = 'video-modal';
                videoModalInstance.innerHTML = `
                   <div class="video-modal-container">
                       <div class="video-modal-header">
                           <h3 class="video-modal-title"></h3>
                           <div class="video-modal-close" role="button" aria-label="关闭视频播放器">
                               <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                           </div>
                       </div>
                       <div class="video-modal-body">
                           <iframe class="video-modal-iframe" src="about:blank" frameborder="0" scrolling="no" sandbox="allow-scripts allow-same-origin allow-presentation allow-forms" allow="autoplay; fullscreen" allowfullscreen></iframe>
                       </div>
                       <div class="video-modal-info">
                           <div class="video-modal-up">
                               <span class="video-modal-up-name"></span>
                           </div>
                           <a class="video-modal-open" href="" target="_blank" rel="noopener noreferrer">
                               <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                               在B站打开
                           </a>
                       </div>
                   </div>
                `;
                document.body.appendChild(videoModalInstance);

                const closeVideoModal = () => {
                    if (!videoModalInstance) return;
                    const container = videoModalInstance.querySelector('.video-modal-container');
                    const iframe = videoModalInstance.querySelector('.video-modal-iframe');

                    container.style.transform = 'translateY(20px)';
                    container.style.opacity = '0';

                    setTimeout(() => {
                        if (videoModalInstance) { // Check again as it might be cleaned up
                           videoModalInstance.classList.remove('active');
                           document.body.style.overflow = '';
                           if (iframe) iframe.src = "about:blank"; // Stop video by resetting src
                        }
                    }, 300);
                };

                videoModalInstance.querySelector('.video-modal-close').addEventListener('click', closeVideoModal);
                videoModalInstance.addEventListener('click', (e) => {
                    if (e.target === videoModalInstance) {
                        closeVideoModal();
                    }
                });

                // Remove previous ESC handler if exists
                if (escHandler) {
                    document.removeEventListener('keydown', escHandler);
                }
                escHandler = (e) => {
                    if (e.key === 'Escape' && videoModalInstance && videoModalInstance.classList.contains('active')) {
                        closeVideoModal();
                    }
                };
                document.addEventListener('keydown', escHandler);

                return videoModalInstance; // Return the created modal element
            }

            // Centralized function to handle fav item click/activation
            function handleFavItemClick(favItem) {
                const bvid = favItem.getAttribute('data-bvid');
                if (bvid && videoModalInstance) { // Ensure modal exists
                    const title = favItem.getAttribute('data-title');
                    const upName = favItem.getAttribute('data-up');

                    videoModalInstance.querySelector('.video-modal-title').textContent = title;
                    videoModalInstance.querySelector('.video-modal-up-name').textContent = 'UP: ' + upName;
                    videoModalInstance.querySelector('.video-modal-open').href = `https://www.bilibili.com/video/${bvid}`;

                    const iframe = videoModalInstance.querySelector('.video-modal-iframe');
                    // Use HTTPS for player URL, add autoplay=1
                    iframe.src = `https://player.bilibili.com/player.html?bvid=${bvid}&page=1&autoplay=1&danmaku=1`;

                    videoModalInstance.classList.add('active');
                    document.body.style.overflow = 'hidden'; // Prevent background scroll

                    // Trigger animation
                    setTimeout(() => {
                        if (videoModalInstance) { // Check if modal still exists
                           const container = videoModalInstance.querySelector('.video-modal-container');
                           if (container) {
                               container.style.transform = 'translateY(0)';
                               container.style.opacity = '1';
                           }
                        }
                    }, 10); // Small delay for transition
                }
            }


            function setupVideoItemsClickEvent() {
                // Remove previous listener if exists
                if (videoClickHandler) {
                    document.removeEventListener('click', videoClickHandler);
                }

                // Use event delegation on the document body for fav item clicks
                videoClickHandler = (e) => {
                    const favItem = e.target.closest('.fav-item');
                    if (favItem) {
                        e.preventDefault(); // Prevent default action if it's a link/button
                        handleFavItemClick(favItem);
                    }
                };
                document.addEventListener('click', videoClickHandler);
            }

           // --- Initialization ---
           await initApp(); // Start the application logic

           // Setup MutationObserver to watch for dynamic content changes (if needed)
           // Disconnect previous observer if exists
           if (appObserverInstance) {
               appObserverInstance.disconnect();
           }
           appObserverInstance = new MutationObserver(appMutationCallback);
           if (app) {
               appObserverInstance.observe(app, { childList: true, subtree: true });
           }


       } catch (error) {
           // console.error('初始化过程中发生顶层错误:', error);
           const app = document.getElementById('bilibili-favlist-app');
           if (app) {
               app.innerHTML = `
                   <div class="fav-empty">
                       <p>加载收藏夹时发生严重错误: ${error.message || '未知错误'}</p>
                       <button class="page-btn retry-btn">重试</button>
                   </div>
               `;
                // Bind retry button listener even in case of top-level error
                app.querySelector('.retry-btn')?.addEventListener('click', () => {
                    // console.log('Retrying after top-level error...');
                    initBilibiliFavList(); // Attempt re-initialization
                });
           }
           isInitialized = false; // Reset flag on error
       }
   };

   // --- PJAX Integration ---
   const init = () => {
       // Initial load
       if (document.readyState === 'loading') {
           document.addEventListener('DOMContentLoaded', initBilibiliFavList);
       } else {
           initBilibiliFavList(); // Already loaded
       }

       // PJAX listeners
       document.addEventListener('pjax:send', () => {
           // console.log('PJAX send: Cleaning up...');
           cleanup(); // Clean up before navigating away
       });

       document.addEventListener('pjax:complete', () => {
           // console.log('PJAX complete: Initializing...');
           // Use setTimeout to ensure the DOM is fully ready after PJAX replaces content
           setTimeout(() => {
                initBilibiliFavList();
           }, 100); // Delay might need adjustment
       });
   };

   // Start
   init();

})();