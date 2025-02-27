/**
 * 显示关于我们的控制台信息
 * 包含歌词和版本信息的格式化输出
 */
export default function about_us(): void {
    const c_bocchi = "#ff6496"
    const c_ichika = "#fabe03"
    const c_ryo = "#006ebe"
    const c_ikuyo = "#e60046"
    const getTextStyle = (color: string): string => {
        return `color:${color};font-size:12px;font-family:"Tahoma Bold", "San Francisco";font-weight:900`
    }
    const getLyricStyle = () => {
        return `font-family:"BIZ UDMincho","Hiragino Mincho ProN";font-size:14px`
    }
    const getQuoteStyle = () => {
        return `color:#b4b4b4;font-family:"Tahoma Bold", "San Francisco";font-size:12px`
    }
    
    // 歌词部分
    console.log(
        `%c君を待った
僕は待った
途切れない明日も過ぎて行って
僕は今日も掻きむしって
忘れない傷をつけているんだよ
君じゃないとさ
%c— ⌜Re:Re:⌟`,
        getLyricStyle(),
        getQuoteStyle()
    )

    // 版本信息部分
    console.log(
        `%cTHE%cM%cE \n%cSAKURAIR%cO%c \n%cVE%cR%cSION \n%c3%c.0 \n%chttps://github.com/mirai-mamori/Sakurairo`,
        getTextStyle('inherit'),
        getTextStyle(c_bocchi),
        getTextStyle('inherit'),
        getTextStyle('inherit'),
        getTextStyle(c_ichika),
        getTextStyle('inherit'),
        getTextStyle('inherit'),
        getTextStyle(c_ryo),
        getTextStyle('inherit'),
        getTextStyle(c_ikuyo),
        getTextStyle('inherit'),
        getTextStyle('inherit')
    )
}