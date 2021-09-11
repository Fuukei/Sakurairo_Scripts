import { getFileNameMain } from '../common/util';
const videoList = Poi.movies.name.split(",")
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
function getVideo() {
    const video_stu = document.getElementsByClassName("video-stu")[0] as HTMLElement;
    const fileName = videoList[Math.floor(Math.random() * videoList.length)],
        bgvideo = document.getElementById("bgvideo");
    video_stu.innerHTML = "正在载入视频 ...";
    video_stu.style.bottom = "0px";
    bgvideo.setAttribute("src", new URL(fileName, Poi.movies.url || location.origin).toString());
    bgvideo.setAttribute("video-name", getFileNameMain(fileName));
}
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
export function liveplay() {
    if (s && s.oncanplay != undefined && document.querySelector(".haslive")) {
        if (document.querySelector(".videolive")) {
            splay();
        }
    }
}
export function livepause() {
    if (s && s.oncanplay != undefined && document.querySelector(".haslive")) {
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
            s.oncanplay = function () {
                splay();
                document.getElementById("video-add").style.display = "block";
                video_btn.classList.add("videolive", "haslive");
            }
        } else {
            if (this.classList.contains("video-pause")) {
                spause();
                video_btn.classList.remove("videolive");
                (document.getElementsByClassName("video-stu")[0] as HTMLElement).style.bottom = "0px";
                document.getElementsByClassName("video-stu")[0].innerHTML = "已暂停 ...";
            } else {
                splay();
                video_btn.classList.add("videolive");
            }
        }
        s.onended = function () {
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