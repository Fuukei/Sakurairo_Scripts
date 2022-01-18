import { getFileNameMain } from '../common/util';
import { __ } from '../common/sakurairo_global';
import { importExternal } from '../common/npmLib';
const bgvideo = document.getElementById<HTMLVideoElement>("bgvideo");
const videoList: Array<string> = Poi.movies.name?.split(",") || []// 视频列表
let unplayedIndex = new Array(videoList.length).fill(0).map((_, index) => index)
let aplayersToResume: any[] = []
//from Siren
declare global {
    interface Window {
        Hls: any
    }
    const Hls: any
}
//#region 背景视频
const _getNextRandomVideo = () => {
    if (unplayedIndex.length == 0) {
        unplayedIndex = new Array(videoList.length).fill(0).map((_, index) => index)
    }
    const nextIndex = Math.floor(Math.random() * unplayedIndex.length)
    return videoList[unplayedIndex.splice(nextIndex, 1)[0]]
}

function getVideo() {
    const video_stu = document.getElementsByClassName("video-stu")[0] as HTMLElement;
    const fileName = _getNextRandomVideo()// 随机抽取视频
    video_stu.innerHTML = __("正在载入视频 ...");
    video_stu.style.bottom = "0px";
    //这里不需要检验Poi.movies是不是字符串，因为应该在前边检查
    bgvideo.setAttribute("src", new URL(fileName, Poi.movies.url || location.origin).toString());
    bgvideo.setAttribute("video-name", getFileNameMain(fileName));
}
/**
 * 播放
 */
function splay() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) {
        video_btn.classList.add("video-pause");
        video_btn.classList.remove("video-play");
        video_btn.style.display = "";
    }
    try {
        document.querySelector<HTMLElement>(".video-stu").style.bottom = "-100px";
        document.querySelector<HTMLElement>(".focusinfo").style.top = "-999px";
        if (mashiro_option.float_player_on) {
            import('./aplayer').then(({ pauseAllPlayer }) => {
                aplayersToResume = pauseAllPlayer()
                bgvideo.play();
            })
            return
        }
    } catch (e) {
        console.warn(e)
    }
    bgvideo.play();
}
/**
 * 暂停
 */
function spause() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) {
        video_btn.classList.add("video-play");
        video_btn.classList.remove("video-pause");
    }
    try {
        document.querySelector<HTMLElement>(".focusinfo").style.top = "49.3%";
    } catch { }
    bgvideo.pause();
    for (const player of aplayersToResume) {
        player.play()
    }
}
/**
 * 自动续播 - 播放
 */
export function liveplay() {
    if (bgvideo && bgvideo.oncanplay != undefined && document.querySelector(".haslive")) {// 检查视频数据
        if (document.querySelector(".videolive")) {// 检查播放状态
            splay();
        }
    }
}
export function livepause() {
    if (bgvideo && bgvideo.oncanplay != undefined && document.querySelector(".haslive")) {// 检查视频数据
        spause();
        let video_stu = document.getElementsByClassName("video-stu")[0] as HTMLElement;
        video_stu.style.bottom = "0px";
        video_stu.innerHTML = __("已暂停...");
    }
}
export function coverVideo() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) video_btn.addEventListener("click", function () {
        if (this.classList.contains("loadvideo")) {
            this.classList.add("video-pause");
            this.classList.remove("loadvideo");
            getVideo();
            bgvideo.oncanplay = () => {// 数据可用时
                splay();
                document.getElementById("video-add").style.display = "block";
                video_btn.classList.add("videolive", "haslive");// MDZZ
            }
        } else {
            if (this.classList.contains("video-pause")) {
                spause();
                video_btn.classList.remove("videolive");
                (document.getElementsByClassName("video-stu")[0] as HTMLElement).style.bottom = "0px";
                document.getElementsByClassName("video-stu")[0].innerHTML = __("已暂停...");
            } else {
                splay();
                video_btn.classList.add("videolive");// 用于判断切换页面时的状态
            }
        }
        bgvideo.onended = function () {// 播放结束后 
            bgvideo.setAttribute("src", "");
            document.getElementById("video-add").style.display = "none";
            document.querySelector<HTMLElement>(".focusinfo").style.top = "49.3%";
            if (video_btn) {
                video_btn.classList.add("loadvideo");
                video_btn.classList.remove("video-pause", "videolive", "haslive");
                if (Poi.movies.loop) {
                    video_btn.click()
                }
            }
        }
    });
    const video_add = document.getElementById("video-add")
    if (video_add) video_add.addEventListener("click", getVideo);
}
//#endregion
export async function coverVideoIni() {
    initHLS()
    lazyloadPatch()
}
function canPlayHandler(this: HTMLVideoElement) {
    this.poster = ''
}
/**
 * 用户代理可能会禁止自动播放，此时需要撤掉poster
 */
async function lazyloadPatch() {
    document.querySelectorAll<HTMLVideoElement>('video.lazyload')
        .forEach(
            video => video.addEventListener('canplay', canPlayHandler)
        )
}
async function initHLS() {
    const videos = document.querySelectorAll<HTMLVideoElement>('video.hls');
    if (videos.length == 0) return
    //检查浏览器是否原生支持
    if (videos[0].canPlayType('application/vnd.apple.mpegurl')) {
        for (const video of videos) {
            video.src = video.dataset.src || video.src;
            video.autoplay = true
        }
    } else {
        if (!window.Hls) {
            try {
                if (mashiro_option.ext_shared_lib) {
                    await importExternal('dist/hls.light.min.js', 'hls.js')
                } else {
                    //@ts-ignore
                    const { default: Hls } = await import('hls.js/dist/hls.light.js')
                    window.Hls = Hls
                }
            } catch (reason) {
                console.warn('Hls load failed: ', reason)
            }
        }
        if (!Hls.isSupported()) console.error('Hls: Media Source Extensions is unsupported.')
        for (const video of videos) {
            const hls = new Hls();
            hls.loadSource(video.dataset.src || video.src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play();
            });
        }
    }
}