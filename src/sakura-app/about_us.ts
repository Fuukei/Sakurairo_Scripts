export default function about_us() {
    console.log('Sakurairo', 'https://github.com/mirai-mamori/Sakurairo')
    //hitokoto
    const lang =  navigator.language
    if (lang.match(/^zh/)) console.log("「人生的每个阶段的结束，是另一段漂流的开始。」")
    else if (lang.match(/^en/)) console.log("「The end of each stage of life is the beginning of another drifting.」")
    else if (lang.match(/^ja/)) console.log("「人生の各段階の終わりは、別の漂流の始まりです。」")
    /* console.log("%c Mashiro %c", "background:#24272A; color:#ffffff", "", "https://2heng.xin/");
    console.log("%c Github %c", "background:#24272A; color:#ffffff", "", "https://github.com/mashirozx"); */
}