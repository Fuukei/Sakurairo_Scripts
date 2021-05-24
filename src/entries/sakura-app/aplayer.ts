//可能存在的全局变量
declare var meting_api: string;
//@ts-ignore
import APlayer from 'aplayer'
import { loadCSS } from 'fg-loadcss';
let aplayers: any[] = []
function initAplayer(a: HTMLElement, b: string | any[]) {
    const default_option: Record<string, any> = {
        container: a,
        audio: b,
        mini: null,
        fixed: null,
        autoplay: !1,
        mutex: !0,
        lrcType: 3,
        listFolded: 1,
        preload: 'auto',
        theme: '#2980b9',
        loop: 'all',
        order: 'list',
        volume: null,
        listMaxHeight: null,
        customAudioType: null,
        storageName: 'metingjs'
    };
    if (b.length) {
        b[0].lrc || (default_option.lrcType = 0);

        let d: Record<string, any> = {};
        for (const key in default_option) {
            let key_lowercase = key.toLowerCase();
            if (a.dataset.hasOwnProperty(key_lowercase) || a.dataset.hasOwnProperty(key) || default_option[key] !== null) {
                d[key] = a.dataset[key_lowercase] || a.dataset[key] || default_option[key]
                if ('true' === d[key] || 'false' === d[key]) {
                    d[key] = 'true' == d[key]
                }
            }
        }
        aplayers.push(new APlayer(d))
    }
    for (let f = 0; f < aplayers.length; f++) try {
        aplayers[f].lrc.hide();
    } catch (a) {
        console.log(a)
    }
    let lrcTag = 1;
    document.querySelector(".aplayer.aplayer-fixed").addEventListener("click", () => {
        if (lrcTag == 1) {
            for (let f = 0; f < aplayers.length; f++) try {
                aplayers[f].lrc.show();
            } catch (a) {
                console.log(a)
            }
        }
        lrcTag = 2;
    });
    let apSwitchTag = 0,
        aplayer_body = document.querySelector(".aplayer.aplayer-fixed .aplayer-body"),
        aplayer_minisw = document.querySelector(".aplayer-miniswitcher");

    aplayer_body && aplayer_body.classList.add("ap-hover");
    aplayer_minisw && aplayer_minisw.addEventListener("click", () => {
        if (apSwitchTag == 0) {
            aplayer_body && aplayer_body.classList.remove("ap-hover");
            document.getElementById("secondary") && document.getElementById("secondary").classList.add("active");
            apSwitchTag = 1;
        } else {
            aplayer_body && aplayer_body.classList.add("ap-hover");
            document.getElementById("secondary") && document.getElementById("secondary").classList.remove("active");
            apSwitchTag = 0;
        }
    });
}
export function destroyAllAplayer() {
    try {
        for (let i = 0; i < aplayers.length; i++) {
            aplayers[i].destroy()
        }
        aplayers = [];
    } catch (reason) {
        console.warn(reason)
    }
}
export function aplayerInit() {
    //document.addEventListener('DOMContentLoaded', loadMeting, /* !1 *//**false与什么都不传递作用相等 */);
    loadCSS("https://cdn.jsdelivr.net/npm/aplayer@1.10.1/dist/APlayer.min.css");
    let meting_api_path: URL
    if (typeof meting_api == 'string') {
        meting_api_path = new URL(meting_api)
    } else {
        meting_api_path = new URL(mashiro_option.meting_api_url)
        meting_api_path.searchParams.set('_wpnonce', Poi.nonce)
    }

    destroyAllAplayer()

    let collection = document.getElementsByClassName('aplayer') as HTMLCollectionOf<HTMLElement>
    for (let e = 0; e < collection.length; e++) {
        let element = collection[e],
            id = element.dataset.id;
        if (id) {
            const api_path = element.dataset.api ? new URL(element.dataset.api) : meting_api_path;
            const params = api_path.searchParams
            params.set('server', element.dataset.server)
            params.set('type', element.dataset.type)
            params.set('id', element.dataset.id);
            fetch(api_path.toString())
                .then(async (resp) => {
                    if (resp.ok) {
                        initAplayer(element, await resp.json())
                    } else {
                        console.warn(`(APlayer) HTTP ${resp.status}:${resp.statusText}`)
                    }
                })
                .catch(console.error)
        } else if (element.dataset.url) {
            const playlist_info = [{
                name: element.dataset.name || element.dataset.title || 'Audio name',
                artist: element.dataset.artist || element.dataset.author || 'Audio artist',
                url: element.dataset.url,
                cover: element.dataset.cover || element.dataset.pic,
                lrc: element.dataset.lrc,
                type: element.dataset.type || 'auto'
            }];
            initAplayer(element, playlist_info)
        }
    }
}