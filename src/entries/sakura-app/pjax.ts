import Pjax from 'pjax';
import { setCookie } from '../../module/cookie';

//检查是否应当开启Poi.pjax
const UA = navigator.userAgent
const version_list: Record<string, number> = { Firefox: 84, Edg: 88, Chrome: 88, Opera: 74, Version: 9 };
const reg = UA.indexOf('Chrome') != -1?/(Chrome)\/(\d+)/i:/(Firefox|Chrome|Version|Opera)\/(\d+)/i
const version = UA.match(reg);
Poi.pjax = version && (parseInt(version[2]) >= version_list[version[1]]) && Poi.pjax;
if (document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0)
    setCookie('su_webp', '1', 114514)

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