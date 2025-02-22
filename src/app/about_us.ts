export default function about_us() {
    const c1 = "#e7c944"
    const c2 = "#5abce0"
    const cp = "#ff2291"
    const getTextStyle = (color: string) => {
        return `color:${color};font-size:16px;font-family:sans-serif;font-weight:bold`
    }
    console.log(
        `%c君を待った
僕は待った
途切れない明日も過ぎて行って
僕は今日も掻きむしって
忘れない傷をつけているんだよ
君じゃないとさ` +
        '\n%c—⌜Re:Re⌟\n\n%c Sakura%cir%co %c https://github.com/mirai-mamori/Sakurairo',
        'font-family:sans-serif',
        "font-family:sans-serif;color:#777",
        getTextStyle(cp),
        getTextStyle(c1),
        getTextStyle(c2),
        ''
    )
}