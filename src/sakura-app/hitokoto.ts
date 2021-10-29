export default async function hitokoto() {
    if (mashiro_option.yiyan) {
        const yiyan = document.getElementById("footer_yiyan");
        const api_group = mashiro_option.yiyan_api ?? ["https://api.maho.cc/yiyan/"]
        if (api_group.length == 0) {
            console.warn('一言API路径为空')
        } else if (yiyan) {
            for (const api_path of mashiro_option.yiyan_api) {
                try {
                    const txt = await request(api_path)
                    yiyan.innerText = txt
                    break
                } catch (e) {
                    console.warn(`一言api: 尝试联系"${api_path}"时出错。\n`, e)
                    continue
                }
            }
        }
    }
}
const request = async (api: string) => {
    const res = await fetch(api, { headers: { Accept: "application/json" } })
    if (res.ok) {
        const data = await res.json()
        const from_who = (data.from_who == 'null' ? null : data.from_who) || ''
        const from = data.from != data.from_who ? `「${data['from']}」` : ''
        const hitokoto = data.hitokoto
        return hitokoto + '——' + from_who + from
    } else {
        throw res.status
    }
}