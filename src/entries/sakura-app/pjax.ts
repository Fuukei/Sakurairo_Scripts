import Pjax from 'pjax';
const pjax = Poi.pjax && new Pjax({
    selectors: ["#page", "title", ".footer-device"],
    //@ts-ignore
    elements: [
        "a:not([target='_top']):not(.comment-reply-link):not(#pagination a):not(#comments-navi a):not(.user-menu-option a):not(.header-user-avatar a):not(.emoji-item):not(.no-pjax)",
        ".search-form",
        ".s-search",
    ],
    timeout: 8000,
    history: true,
    cacheBust: false,
});
export { pjax }