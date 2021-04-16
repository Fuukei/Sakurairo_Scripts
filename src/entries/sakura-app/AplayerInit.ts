//可能存在的全局变量
declare var meting_api: string;
declare var APlayer: new (...args: any[]) => void
interface C {
    container?: HTMLElement;
    audio?: string | any[];
    mini?: any;
    fixed?: any;
    autoplay?: boolean;
    mutex?: boolean;
    lrcType?: number;
    listFolded?: number;
    preload?: string;
    theme?: string;
    loop?: string;
    order?: string,
    volume?: any,
    listMaxHeight?: any,
    customAudioType?: any,
    storageName?: string;
}
export function aplayerF() {
    document.addEventListener('DOMContentLoaded', loadMeting, /* !1 *//**false与什么都不传递作用相等 */);
}
let aplayers: any[] = []
function a(a: HTMLElement, b: string | any[]) {
    let c: C = {
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
        b[0].lrc || (c.lrcType = 0);

        let d:C = {};
        for (const e in c) {
            let f = e.toLowerCase();
            if (a.dataset.hasOwnProperty(f) || a.dataset.hasOwnProperty(e) || c[e] !== null) {
                d[e] = a.dataset[f] || a.dataset[e] || c[e]
                    if('true' === d[e] || 'false' === d[e]){
                        d[e] = 'true' == d[e]
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
function loadMeting() {
    const meting_api_path = typeof meting_api == 'string' ? meting_api :
        mashiro_option.meting_api_url + '?server=:server&type=:type&id=:id&_wpnonce=' + Poi.nonce

    for (let f = 0; f < aplayers.length; f++) try {
        aplayers[f].destroy()
    } catch (a) {
        console.log(a)
    }

    aplayers = [];

    let collection = document.getElementsByClassName('aplayer') as HTMLCollectionOf<HTMLElement>
    for (let e = 0; e < collection.length; e++) {
        let element = collection[e],
            id = element.dataset.id;
        if (id) {
            let api_path = element.dataset.api || meting_api_path;
            api_path = api_path.replace(':server', element.dataset.server)
            api_path = api_path.replace(':type', element.dataset.type)
            api_path = api_path.replace(':id', element.dataset.id);
            if (fetch) {
                fetch(api_path).then(async(resp) => {
                    if (resp.ok) {
                        a(element, await resp.json())
                    }
                })
            } else {
                const xhr = new XMLHttpRequest;
                xhr.onreadystatechange = function () {
                    if (4 === xhr.readyState && (200 <= xhr.status && 300 > xhr.status || 304 === xhr.status)) {
                        const b = JSON.parse(xhr.responseText);
                        a(element, b)
                    }
                },
                    xhr.open('get', api_path, !0)
                xhr.send()
            }
        } else if (element.dataset.url) {
            const playlist_info = [{
                name: element.dataset.name || element.dataset.title || 'Audio name',
                artist: element.dataset.artist || element.dataset.author || 'Audio artist',
                url: element.dataset.url,
                cover: element.dataset.cover || element.dataset.pic,
                lrc: element.dataset.lrc,
                type: element.dataset.type || 'auto'
            }];
            a(element, playlist_info)
        }
    }
};
