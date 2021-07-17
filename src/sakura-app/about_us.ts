export default function about_us() {
    console.log('Sakurairo', 'https://github.com/mirai-mamori/Sakurairo')
    //hitokoto
    const lang = navigator.language
    /**
     * @seealso https://www.iana.org/assignments/language-subtag-registry/language-subtag-registry
     */
    const matchResult = lang.match(/^([a-z]+)(?:-Han(s|t))?(?:-(\S+))?/i)
    if (matchResult) {
        const lang_prefix = matchResult[1]
        if (lang_prefix.toLowerCase() == 'zh') {
            const han_suffix = matchResult[2]
            switch (han_suffix) {
                case 's':
                    console.log(zhHans)
                    return
                case 't':
                    console.log(zhHant)
                    return
                default:
                    if (matchResult[3].toLowerCase() == 'cn') {
                        console.log(zhHans)
                    } else {
                        console.log(zhHant)
                    }
            }
        } else {
            console.log(VersionHitokoto[lang_prefix.toLowerCase()] || VersionHitokoto.en)
        }
    }
    /* console.log("%c Mashiro %c", "background:#24272A; color:#ffffff", "", "https://2heng.xin/");
    console.log("%c Github %c", "background:#24272A; color:#ffffff", "", "https://github.com/mashirozx"); */
}

const zhHans = "「人生的每个阶段的结束，是另一段漂流的开始。」"
const zhHant = "「人生的每個階段的結束，是另一段漂流的開始。」"

const VersionHitokoto: Record<string, string> = {
    ja: "「人生の各段階の終わりは、別の漂流の始まりです。」",
    en: "「The end of each stage of life is the beginning of another drifting.」",
}