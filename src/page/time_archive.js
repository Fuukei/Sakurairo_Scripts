class Timeline {
    constructor() {
        this.timelineRoot = null;
        this.modalMask = null;
        this.modalContent = null;
        this.modalClose = null;
        this.boundHandleClick = this.handleClick.bind(this);
        this.boundHandleModalClose = this.handleModalClose.bind(this);
        this.boundHandleMaskClick = this.handleMaskClick.bind(this);

        // 改进语言检测逻辑
        const htmlLang = (document.documentElement.lang || '').toLowerCase();
        // console.log('Detected HTML lang:', htmlLang);
        
        // 支持更多中文变体
        const zhVariants = ['zh-hans', 'zh-cn', 'zh', 'zh-hans-cn'];
        const twVariants = ['zh-hant', 'zh-tw', 'zh-hant-tw'];
        
        // 更新语言匹配逻辑
        if (zhVariants.some(variant => htmlLang.includes(variant))) {
            this.currentLang = 'zh-CN';
        } else if (twVariants.some(variant => htmlLang.includes(variant))) {
            this.currentLang = 'zh-TW';
        } else if (htmlLang.startsWith('ja')) {
            this.currentLang = 'ja';
        } else if (htmlLang.startsWith('fr')) {
            this.currentLang = 'fr';
        } else {
            this.currentLang = 'en';
        }
            
        // console.log('Selected language:', this.currentLang);
    }

    init() {
        this.timelineRoot = document.getElementById('timeline-root');
        this.categoryRoot = document.getElementById('category-root');
        this.modalMask = document.getElementById('timeline-modal-mask');
        this.modalContent = document.getElementById('timeline-modal-content');
        this.modalClose = document.getElementById('timeline-modal-close');
        this.modalMain = document.querySelector("#timeline-modal-mask")

        if (!this.timelineRoot || !this.modalMask || !this.modalContent || !this.modalClose) {
            document.documentElement.style.overflowY = 'auto';
            return;
        }

        this.contentAPI = this.modalContent.dataset.archiveapi;
        this.contents = ''; //内容标志
        (async function(){await timelineInstance.FetchContents()}()) ;

        this.bindEvents();
    }

    async FetchContents() {
        try {
            const response = await fetch(this.contentAPI);
            this.contents = await response.json();
        } catch (error) {
            console.warn("获取内容失败，重试中...", error);
            try {
                const response = await fetch(this.contentAPI);
                this.contents = await response.json();
            } catch (retryError) {
                console.error("获取内容失败:", retryError);
                this.contents = {};
            }
        }
    }

    destroy() {
        if (this.timelineRoot) {
            this.timelineRoot.removeEventListener('click', this.boundHandleClick);
        }
        if (this.categoryRoot) {
            this.categoryRoot.removeEventListener('click', this.boundHandleClick)
        }
        if (this.modalClose) {
            this.modalClose.removeEventListener('click', this.boundHandleModalClose);
        }
        if (this.modalMask) {
            this.modalMask.removeEventListener('click', this.boundHandleMaskClick);
        }
        document.documentElement.style.overflowY = 'auto';
    }

    bindEvents() {
        this.timelineRoot.addEventListener('click', this.boundHandleClick);
        this.categoryRoot.addEventListener('click', this.boundHandleClick)
        this.modalClose.addEventListener('click', this.boundHandleModalClose);
        this.modalMask.addEventListener('click', this.boundHandleMaskClick);
    }

    handleClick(e) {
        if (!this.contents) return; // 异步内容请求未完成
        if (e.target.matches('a')) return; // 点击对象为卡片内文章链接
        
        const yearCard = e.target.closest('.timeline-year-card');
        if (yearCard && !e.target.matches('a')) {
            let year = yearCard.dataset.year;
            let yearData = this.filterByYear(year);
            this.renderModal(`${year}`, yearData, 'year');
    
            this.modalMain.showModal();
            document.documentElement.style.overflow = 'hidden';
        }

        const categoryCard = e.target.closest('.category-card');
        if (categoryCard) {
            const catId = parseInt(categoryCard.dataset.categoryid, 10);
            const categoryData = this.filterByCategory(catId);
            this.renderModal(categoryCard.querySelector('.category-name').innerHTML, categoryData, 'category');

            this.modalMain.showModal();
            document.documentElement.style.overflow = 'hidden';
        }
    }

    handleModalClose() {
        this.modalMask.classList.remove('active');
        this.modalMain.close();
        document.documentElement.style.overflowY = 'auto';
    }

    handleMaskClick(e) {
        if (e.target === this.modalMask) {
            this.modalMask.classList.remove('active');
            this.modalMain.close();
            document.documentElement.style.overflowY = 'auto';
        }
    }

    filterByYear(year) {
        if (this.contents[year]) {
            return {
                [year]: this.contents[year]
            };
        }
        return {};
    }

    filterByCategory(catId) {
        const result = {};
        for (const [year, months] of Object.entries(this.contents)) {
        for (const [month, posts] of Object.entries(months)) {
            const matched = posts.filter(post =>
            Array.isArray(post.categories) && post.categories.includes(catId)
            );
            if (matched.length) {
            result[year] = result[year] || {};
            result[year][month] = matched;
            }
        }
        }
        return result;
    }

    renderModal(label, data, type) {
        let totalStats = {
            posts: 0,
            views: 0,
            words: 0,
            comments: 0
        };
        
        let typeStats = {
            shuoshuo: {
                posts: 0,
                views: 0,
                words: 0,
                comments: 0
            },
            article: {
                posts: 0,
                views: 0,
                words: 0,
                comments: 0
            },
        };

        // 计算统计数据
        Object.values(data).forEach(monthObj => {
            Object.values(monthObj).forEach(posts => {
                posts.forEach(post => {
                    if (post.meta.type == "page") {
                        return;
                    }

                    const type = post.meta.type || 'article';
                    const views = parseInt(post.meta.views) || 0;
                    const words = parseInt(post.meta.words) || 0;
                    const comments = parseInt(post.comment_count) || 0;

                    totalStats.posts++;
                    totalStats.views += views;
                    totalStats.words += words;
                    totalStats.comments += comments;

                    typeStats[type].posts++;
                    typeStats[type].views += views;
                    typeStats[type].words += words;
                    typeStats[type].comments += comments;
                });
            });
        });
        // 多语言翻译对象
        let timelineTranslations = {
            'zh-CN': {
                yearOverview: '年度总览',
                categoryOverview: '分类总览',
                articleCount: '投稿数',
                articles: '文章',
                shuoshuo: '说说',
                readCount: '阅读量',
                times: '次',
                wordCount: '字数',
                characters: '字',
                commentCount: '评论数',
                comments: '条',
                month: '月'
            },
            'zh-TW': {
                yearOverview: '年度總覽',
                categoryOverview: '分類總覽',
                articleCount: '投稿數',
                articles: '文章',
                shuoshuo: '說說',
                readCount: '閱讀量',
                times: '次',
                wordCount: '字數',
                characters: '字',
                commentCount: '評論數',
                comments: '條',
                month: '月'
            },
            'en': {
                yearOverview: 'Year Overview',
                categoryOverview: 'Category Overview',
                articleCount: 'Posts',
                articles: 'Articles',
                shuoshuo: 'Shuoshuo',
                readCount: 'Views',
                times: 'times',
                wordCount: 'Words',
                characters: 'chars',
                commentCount: 'Comments',
                comments: '',
                month: ''
            },
            'ja': {
                yearOverview: '年間概要',
                categoryOverview: 'カテゴリ概要',
                articleCount: '投稿数',
                articles: '記事',
                shuoshuo: 'つぶやき',
                readCount: '閲覧数',
                times: '回',
                wordCount: '文字数',
                characters: '字',
                commentCount: 'コメント数',
                comments: '件',
                month: '月'
            },    
            'fr': {
                yearOverview: 'Aperçu annuel',
                categoryOverview: 'Aperçu des catégories',
                articleCount: 'Articles',
                articles: 'Articles',
                shuoshuo: 'Shuoshuo',
                readCount: 'Vues',
                times: 'fois',
                wordCount: 'Mots',
                characters: 'caractères',
                commentCount: 'Commentaires',
                comments: '',
                month: ''
            }
        };

        let t = timelineTranslations[this.currentLang];
        let typeTitle = type=='year' ? t.yearOverview : t.categoryOverview;
        let html = `
            <h2 class="timeline-modal-title">${label} ${typeTitle}</h2>
            <div class="timeline-modal-stats-grid">
                <div class="timeline-modal-statbox">
                    <i class="stat-icon fas fa-file-alt"></i>
                    <span class="stat-label">${t.articleCount}</span>
                    <span class="stat-value">${totalStats.posts}</span>                    
                    <div class="stat-tooltip">
                        ${t.articles}：${typeStats.article.posts}<br>
                        ${t.shuoshuo}：${typeStats.shuoshuo.posts}
                    </div>
                </div>
                <div class="timeline-modal-statbox">
                    <i class="stat-icon fas fa-eye"></i>
                    <span class="stat-label">${t.readCount}</span>
                    <span class="stat-value">${toFixNum(totalStats.views)}</span>
                    <div class="stat-tooltip">
                        ${t.articles}：${typeStats.article.views} ${t.times}<br>
                        ${t.shuoshuo}：${toFixNum(typeStats.shuoshuo.views)} ${t.times}
                    </div>
                </div>
                <div class="timeline-modal-statbox">
                    <i class="stat-icon fas fa-font"></i>
                    <span class="stat-label">${t.wordCount}</span>
                    <span class="stat-value">${toFixNum(totalStats.words)}</span>
                    <div class="stat-tooltip">
                        ${t.articles}：${toFixNum(typeStats.article.words)} ${t.characters}<br>
                        ${t.shuoshuo}：${toFixNum(typeStats.shuoshuo.words)} ${t.characters}
                    </div>
                </div>
                <div class="timeline-modal-statbox">
                    <i class="stat-icon fas fa-comments"></i>
                    <span class="stat-label">${t.commentCount}</span>
                    <span class="stat-value">${totalStats.comments}</span>                    
                    <div class="stat-tooltip">
                        ${t.articles}：${typeStats.article.comments} ${t.comments}<br>
                        ${t.shuoshuo}：${typeStats.shuoshuo.comments} ${t.comments}
                    </div>
                </div>
            </div>`;
        
        const monthsDesc = Object.entries(data)
            .sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));

        for (const [year, monthsObj] of monthsDesc) {
            const months = Object.entries(monthsObj)
                .sort((a, b) => parseInt(b[0], 10) - parseInt(a[0], 10));
            
            for (const [month, posts] of months) {
                let monthTitle = type=='year' ? `${month}${t.month}` : `${year}-${month}${t.month}`
                html += `
                <div class="timeline-modal-month-group">
                    <h3 class="timeline-modal-month-title">${monthTitle}</h3>
                    <div class="timeline-modal-post-list">
                `;

                posts
                    .slice()
                    .sort((a, b) => new Date(b.post_date) - new Date(a.post_date))
                    .forEach(post => {
                        if (post.meta.type === 'page') return; // 页面不列出
                        const date = new Date(post.post_date);
                        const formattedDate = `${date.getMonth() + 1}-${date.getDate()}`;
                        const postType = post.meta.type === 'shuoshuo' ? ` [${t.shuoshuo}]` : '';
                        html += `
                            <a href="${post.link}" class="timeline-modal-post-item">
                                <span class="timeline-modal-post-title">${post.post_title}${postType}</span>
                                <span class="timeline-modal-post-date">${formattedDate}</span>
                            </a>`;
                    });
                html += `</div></div>`;
            }
        }

        this.modalContent.innerHTML = html;
        this.modalMask.classList.add('active');
    }
}

// 创建单例实例
let timelineInstance = null;

export default function initTimeArchive() {
    if (timelineInstance) {
        timelineInstance.destroy();
        timelineInstance = null;
    }
    timelineInstance = new Timeline();
    timelineInstance.init();
}

function toFixNum(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'm';
    } else {
      return num;
    }
  }
