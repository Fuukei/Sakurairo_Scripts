import { getFileNameMain } from '../common/util';
const videoList = Poi.movies.name && Poi.movies.name.split(",")// 视频列表
//from Siren
declare global {
    interface Window {
        Hls: any
    }
    const Hls: any
}
const s = document.getElementById<HTMLVideoElement>("bgvideo");

function loadHls() {
    const video = document.getElementById<HTMLVideoElement>('coverVideo'),
        video_src = video.dataset.src;
    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(video_src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = video_src;
        video.addEventListener('loadedmetadata', function () {
            video.play();
        });
    }
}
//#region 背景视频

function getVideo() {
    const video_stu = document.getElementsByClassName("video-stu")[0] as HTMLElement;
    const fileName = videoList[Math.floor(Math.random() * videoList.length)],// 随机抽取视频
        bgvideo = document.getElementById("bgvideo");
    video_stu.innerHTML = "正在载入视频 ...";
    video_stu.style.bottom = "0px";
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
            import('./aplayer').then(({ destroyAllAplayer }) => {
                destroyAllAplayer()
                s.play();
            })
            return
        }
    } catch (e) {
        console.warn(e)
    }
    s.play();
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
    s.pause();
}
/**
 * 自动续播 - 播放
 */
export function liveplay() {
    if (s && s.oncanplay != undefined && document.querySelector(".haslive")) {// 检查视频数据
        if (document.querySelector(".videolive")) {// 检查播放状态
            splay();
        }
    }
}
export function livepause() {
    if (s && s.oncanplay != undefined && document.querySelector(".haslive")) {// 检查视频数据
        spause();
        let video_stu = document.getElementsByClassName("video-stu")[0] as HTMLElement;
        video_stu.style.bottom = "0px";
        video_stu.innerHTML = "已暂停 ...";
    }
}
export function coverVideo() {
    let video_btn = document.getElementById("video-btn");
    if (video_btn) video_btn.addEventListener("click", function () {
        if (this.classList.contains("loadvideo")) {
            this.classList.add("video-pause");
            this.classList.remove("loadvideo");
            getVideo();
            s.oncanplay = function () {// 数据可用时
                splay();
                document.getElementById("video-add").style.display = "block";
                video_btn.classList.add("videolive", "haslive");// MDZZ
            }
        } else {
            if (this.classList.contains("video-pause")) {
                spause();
                video_btn.classList.remove("videolive");
                (document.getElementsByClassName("video-stu")[0] as HTMLElement).style.bottom = "0px";
                document.getElementsByClassName("video-stu")[0].innerHTML = "已暂停 ...";
            } else {
                splay();
                video_btn.classList.add("videolive");// 用于判断切换页面时的状态
            }
        }
        s.onended = function () {// 播放结束后
            s.setAttribute("src", "");
            document.getElementById("video-add").style.display = "none";
            video_btn && video_btn.classList.add("loadvideo");
            video_btn && video_btn.classList.remove("video-pause", "videolive", "haslive");
            document.querySelector<HTMLElement>(".focusinfo").style.top = "49.3%";
        }
    });
    const video_add = document.getElementById("video-add")
    if (video_add) video_add.addEventListener("click", function () {
        getVideo();
    });
}
//#endregion
export function coverVideoIni() {
    let video = document.getElementsByTagName('video')[0];
    if (video && video.classList.contains('hls')) {
        if (window.Hls) {
            loadHls();
        } else {
            import('hls.js')
                .then(hls => {
                    //export to GLOBAL
                    window.Hls = hls.default
                    loadHls();
                })
                .catch(reason => console.warn('Hls load failed: ', reason))
        }
    }
}