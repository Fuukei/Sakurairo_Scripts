import { sakurairoGlobal } from "../common/sakurairo_global";
export function web_audio() {
    if (!_iro.audio) return
    //@ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (AudioContext) {
        let i = 0
        const o = 1
        const t = getSheet()
        const selects = document.querySelectorAll(".site-title, #moblieGoTop, .site-branding, .searchbox, .changeSkin-gear, .menu-list li");
        const notes = "♪♩♫♬♭€§¶♯"

        const gainValueMax = sakurairoGlobal.opt.web_audio?.main_gain || 1
        const ctx: AudioContext = new AudioContext
        const l = ctx.createGain()
        const c = ctx.createOscillator()
        l.connect(ctx.destination)
        c.connect(l)
        c.type = "sine"
        c.start(ctx.currentTime)

        let _t: ReturnType<typeof setTimeout>
        function suspendContextWhenIdle() {
            clearTimeout(_t)
            _t = setTimeout(() => {
                ctx.suspend()
                _t = undefined
            }, 1000)
        }
        let lastTarget: HTMLElement | null = null
        const listener = (e: MouseEvent) => {
            if (e.currentTarget === lastTarget) return
            ctx.resume()
            lastTarget = e.currentTarget as HTMLElement
            const d = Math.round(notes.length * Math.random());
            const h = e.pageX
            const p = e.pageY - 5
            const dom = document.createElement("b");
            dom.textContent = notes[d]
            dom.style.zIndex = "99999";
            dom.style.top = p - 100 + "px";
            dom.style.left = h + "px";
            dom.style.position = "absolute";
            dom.style.color = "#FF6EB4";
            dom.style.pointerEvents = "none";
            document.body.appendChild(dom);
            dom.animate([
                { top: p + "px" },
                { opacity: 0 }
            ], {
                duration: 500
            })

            const r = t[i] || t[i = 0]
            i += o
            l.gain.cancelScheduledValues(ctx.currentTime)
            c.frequency.setValueAtTime(r as unknown as number, ctx.currentTime)
            l.gain.exponentialRampToValueAtTime(gainValueMax, ctx.currentTime + .01)
            l.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + 2)
            l.gain.setValueAtTime(0, ctx.currentTime + 2.1)

            setTimeout(() => {
                dom.remove();
                if (lastTarget === e.currentTarget) lastTarget = null
                suspendContextWhenIdle()
            }, 500)
        }
        selects.forEach(s => (s as HTMLElement).addEventListener('pointerenter', listener))
    }
}

function getSheet() {
    const sheet = sakurairoGlobal.opt.web_audio?.sheet
    if (typeof sheet == 'string') {
        return sheet.split(' ')
    } else if (sheet instanceof Array) {
        return sheet
    } else {
        //欢乐颂
        /*t = "329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 329.628 293.665 293.665 329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 293.665 261.626 261.626 293.665 293.665 329.628 261.626 293.665 329.628 349.228 329.628 261.626 293.665 329.628 349.228 329.628 293.665 261.626 293.665 195.998 329.628 329.628 349.228 391.995 391.995 349.228 329.628 293.665 261.626 261.626 293.665 329.628 293.665 261.626 261.626".split(" ")*/
        //天空之城
        return "880 987 1046 987 1046 1318 987 659 659 880 784 880 1046 784 659 659 698 659 698 1046 659 1046 1046 1046 987 698 698 987 987 880 987 1046 987 1046 1318 987 659 659 880 784 880 1046 784 659 698 1046 987 1046 1174 1174 1174 1046 1046 880 987 784 880 1046 1174 1318 1174 1318 1567 1046 987 1046 1318 1318 1174 784 784 880 1046 987 1174 1046 784 784 1396 1318 1174 659 1318 1046 1318 1760 1567 1567 1318 1174 1046 1046 1174 1046 1174 1567 1318 1318 1760 1567 1318 1174 1046 1046 1174 1046 1174 987 880 880 987 880".split(" ")
    }
}