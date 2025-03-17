/**
 * 文章特色图片取色模块
 * 处理文章特色图片取色的所有功能，包括计算、缓存、应用等
 */
import { getHighlight, getThemeColorFromImageElement } from "../theme-color";
import type { Vector4 } from "@kotorik/palette";
//@ts-ignore
import rgb from 'color-space/rgb';

// 常量定义
const THEME_CACHE_KEY_PREFIX = 'article_theme_color_';
const THEME_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小时过期时间

// 默认的高亮色值
const DEFAULT_HIGHLIGHT = 'hsl(0deg, 0%, 50%)';

/**
 * HSL颜色值转换为CSS文本
 */
export const hslaCSSText = ([h, s, l, a]: Vector4) => {
    const hsl = `${h}deg,${s}%,${l}%`;
    return a && a !== 1 ? `hsla(${hsl},${a})` : `hsl(${hsl})`;
};

/**
 * 缓存文章主题高亮色到localStorage
 */
export function cacheArticleThemeColor(articleId: string, highlightColor: string) {
    if (!articleId || !highlightColor) return;
    
    try {
        const cacheData = {
            highlight: highlightColor,
            timestamp: Date.now()
        };
        localStorage.setItem(THEME_CACHE_KEY_PREFIX + articleId, JSON.stringify(cacheData));
    } catch (e) {
        // 静默处理错误
    }
}

/**
 * 从localStorage获取缓存的文章主题高亮色
 */
export function getCachedArticleThemeColor(articleId: string): string | null {
    if (!articleId) return null;
    
    try {
        const cacheJson = localStorage.getItem(THEME_CACHE_KEY_PREFIX + articleId);
        if (!cacheJson) return null;

        const cacheData = JSON.parse(cacheJson);
        
        // 检查缓存是否过期
        if (Date.now() - cacheData.timestamp > THEME_CACHE_EXPIRY) {
            localStorage.removeItem(THEME_CACHE_KEY_PREFIX + articleId);
            return null;
        }
        
        return cacheData.highlight;
    } catch (e) {
        return null;
    }
}

/**
 * 计算高亮色并应用到元素
 * 完全遵循 theme-color 的 getHighlight 函数的调配方式
 */
export function applyHighlightColorToElement(element: HTMLElement, rgba: number[] | Uint8ClampedArray): string | null {
    if (!element || !rgba || rgba.length < 4) return null;
    
    // 将 rgba 转换为标准格式
    const rgbaVector = [
        rgba[0], 
        rgba[1], 
        rgba[2], 
        rgba[3] / 255
    ] as Vector4;
    
    // 直接使用 theme-color 的 getHighlight 函数获取高亮色
    const highlightVector = getHighlight(rgbaVector);
    const highlightColor = hslaCSSText(highlightVector);
    
    // 设置高亮色CSS变量
    element.style.setProperty('--article-theme-highlight', highlightColor);
    
    return highlightColor;
}

/**
 * 从元素中提取文章ID
 */
export function extractArticleId(element: Element): string | null {
    if (!element) return null;
    
    // 尝试多种方式提取文章ID
    return element.getAttribute('data-post-id') || 
           element.getAttribute('id')?.replace('post-', '') ||
           element.querySelector('a[href*="p="]')?.getAttribute('href')?.match(/p=(\d+)/)?.[1] ||
           element.querySelector('a[href*=".html"]')?.getAttribute('href')?.match(/\/(\d+)\.html/)?.[1] ||
           null;
}

/**
 * 寻找文章特色图片
 */
export function findFeatureImage(): HTMLImageElement | null {
    // 按优先级尝试多种可能的特色图片选择器
    const featureImageSelectors = [
        '.pattern-center .pattern-img img', // 最常见的布局
        '.pattern-attachment img',
        '.pattern-attachment .pattern-img img',
        '.post-thumb img',
        '.entry-header .entry-thumbnail img',
        '.post-thumbnail img',
        '.entry-featured-image img',
        '.entry-content img:first-of-type',
        '.featured-image img',
        'article.post img:first-of-type',
        '.entry-thumb img'
    ];
    
    for (const selector of featureImageSelectors) {
        const img = document.querySelector(selector) as HTMLImageElement;
        if (img && img.src && !img.src.endsWith('svg')) { // 过滤掉SVG图标等
            // 确保图片有 crossorigin 属性
            if (!img.hasAttribute('crossorigin')) {
                img.setAttribute('crossorigin', 'anonymous');
            }
            return img;
        }
    }
    
    // 如果通过选择器没找到，尝试直接获取第一个符合条件的图片
    const allArticleImages = document.querySelectorAll('article img');
    for (let i = 0; i < allArticleImages.length; i++) {
        // 显式转换为 HTMLImageElement 类型
        const img = allArticleImages[i] as HTMLImageElement;
        if (img.src && !img.src.endsWith('svg') && 
            img.width > 100 && img.height > 100) { // 确保图片足够大
            img.setAttribute('crossorigin', 'anonymous');
            return img;
        }
    }
    
    return null;
}

/**
 * 获取当前页面文章ID
 */
export function getCurrentArticleId(): string | null {
    // 从URL获取ID
    const idFromPath = window.location.pathname.match(/\/(\d+)\.html/)?.[1];
    const idFromQuery = new URLSearchParams(window.location.search).get('p');
    
    // 从文章元素获取ID
    const singleArticle = document.querySelector('article.post, article.type-post');
    const idFromArticle = singleArticle ? extractArticleId(singleArticle) : null;
    
    return idFromArticle || idFromPath || idFromQuery;
}

/**
 * 应用高亮色到页面上的各个元素
 */
export function applyHighlightColorToPage(highlightColor: string) {
    if (!highlightColor) return;
    
    // 应用到根元素和body元素，确保全局可用
    document.documentElement.style.setProperty('--article-theme-highlight', highlightColor);
    document.body.style.setProperty('--article-theme-highlight', highlightColor);
    
    // 应用到文章元素
    const articleElements = document.querySelectorAll('article.post, article.type-post, .pattern-attachment');
    articleElements.forEach(el => {
        (el as HTMLElement).style.setProperty('--article-theme-highlight', highlightColor);
    });
    
    // 创建全局样式元素，确保变量在整个页面范围内可用
    let styleEl = document.getElementById('article-highlight-styles');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'article-highlight-styles';
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `:root { --article-theme-highlight: ${highlightColor}; }`;
}

/**
 * 设置全局默认高亮色变量
 */
export function setupDefaultThemeColors() {
    applyHighlightColorToPage(DEFAULT_HIGHLIGHT);
}

/**
 * 处理文章列表中的文章特色图片取色
 */
export function processArticlesList() {
    if (!_iro.extract_article_highlight) return;
    
    const articlesList = document.querySelectorAll('article.post-list-thumb,article.shuoshuo-item');
    
    articlesList.forEach(article => {
        const htmlArticle = article as HTMLElement;
        const thumbImage = htmlArticle.querySelector('.post-thumb img') as HTMLImageElement;
        if (!thumbImage) return;
        
        // 提取文章ID
        const articleId = extractArticleId(htmlArticle);
        
        // 确保图片有 crossorigin 属性
        if (!thumbImage.hasAttribute('crossorigin')) {
            thumbImage.setAttribute('crossorigin', 'anonymous');
        }

        // 如果有文章ID，先尝试从缓存获取
        if (articleId) {
            const cachedHighlightColor = getCachedArticleThemeColor(articleId);
            if (cachedHighlightColor) {
                htmlArticle.style.setProperty('--article-theme-highlight', cachedHighlightColor);
                return;
            }
        }
        
        // 缓存未命中，重新计算
        let finalImageElement = thumbImage;
        if (thumbImage.classList.contains('lazyload')) {
            finalImageElement = document.createElement('img');
            finalImageElement.src = thumbImage.getAttribute('data-src') || thumbImage.src;
            finalImageElement.crossOrigin = "anonymous";
        }
        
        getThemeColorFromImageElement(finalImageElement)
            .then(rgba => {
                if (!rgba) return;
                const highlightColor = applyHighlightColorToElement(htmlArticle, rgba);
                
                // 如果有文章ID且成功应用了颜色，缓存起来
                if (articleId && highlightColor) {
                    cacheArticleThemeColor(articleId, highlightColor);
                }
            })
            .catch(() => {
                // 静默处理错误，使用默认值
                htmlArticle.style.setProperty('--article-theme-highlight', DEFAULT_HIGHLIGHT);
            });
    });
}

/**
 * 处理单篇文章页面的主题色
 */
export function processArticlePage() {
    if (!_iro.extract_article_highlight) return;
    
    // 判断当前是否在文章页 - 增加更多可能的选择器
    const singleArticle = document.querySelector('article.post, article.type-post, .pattern-attachment');
    if (!singleArticle) return;
    
    // 获取文章ID
    const articleId = getCurrentArticleId();
    
    if (articleId) {
        // 尝试从缓存获取主题高亮色
        const cachedHighlightColor = getCachedArticleThemeColor(articleId);
        if (cachedHighlightColor) {
            applyHighlightColorToPage(cachedHighlightColor);
            return; // 应用缓存成功，直接返回
        }
    }
    
    // 没有缓存或ID，尝试从特色图片获取颜色
    const featureImage = findFeatureImage();
    if (featureImage) {
        try {
            let finalImageElement = featureImage;
            
            // 处理懒加载图片的情况
            if (featureImage.classList.contains('lazyload')) {
                finalImageElement = document.createElement('img');
                finalImageElement.src = featureImage.getAttribute('data-src') || featureImage.src;
                finalImageElement.crossOrigin = "anonymous";
            } else {
                // 不是懒加载图片但需要确保有crossorigin属性
                finalImageElement.crossOrigin = "anonymous";
            }
            
            // 处理图片并提取颜色
            const processImage = () => {
                getThemeColorFromImageElement(finalImageElement)
                    .then(rgba => {
                        if (!rgba) {
                            setupDefaultThemeColors();
                            return;
                        }
                        
                        const articleElement = singleArticle as HTMLElement;
                        const highlightColor = applyHighlightColorToElement(articleElement, rgba);
                        
                        if (highlightColor) {
                            // 应用到整个页面
                            applyHighlightColorToPage(highlightColor);
                            
                            // 如果有文章ID，缓存这个颜色
                            if (articleId) {
                                cacheArticleThemeColor(articleId, highlightColor);
                            }
                        }
                    })
                    .catch(() => {
                        // 出错时使用默认值
                        setupDefaultThemeColors();
                    });
            };
            
            // 如果图片已经加载完成，直接处理
            if (finalImageElement.complete) {
                processImage();
            } else {
                // 设置加载事件并手动触发加载
                finalImageElement.onload = processImage;
                finalImageElement.onerror = () => setupDefaultThemeColors();
                
                // 确保图片开始加载
                const originalSrc = finalImageElement.src;
                if (originalSrc) {
                    finalImageElement.src = '';
                    finalImageElement.src = originalSrc;
                } else {
                    setupDefaultThemeColors();
                }
            }
        } catch (error) {
            // 出错时使用默认值
            setupDefaultThemeColors();
        }
    } else {
        // 找不到特色图片，使用默认值
        setupDefaultThemeColors();
    }
}

/**
 * 重新应用文章特色图片取色
 * 处理所有可能的页面类型，包括文章列表和文章详情页
 */
export function applyArticleHighlights() {
    if (!_iro.extract_article_highlight) return;
    
    // 确保默认颜色变量总是被设置
    setupDefaultThemeColors();
    
    // 处理文章列表
    processArticlesList();
    
    // 处理文章页面
    processArticlePage();
}