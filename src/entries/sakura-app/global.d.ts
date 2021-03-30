import FontControl from "./font-control"

declare namespace mashiro_option{
    const NProgressON: boolean
    const audio: boolean
    const author_name: string
    const baguetteBoxON: boolean
    const clipboardCopyright: boolean
    const cookie_version_control: string
    const cover_api: string
    const darkmode: boolean
    const email_domain: string
    const email_name: string
    const entry_content_style: string
    const entry_content_style_src: string
    const jsdelivr_css_src: string
    const land_at_home: boolean
    const live_search: boolean
    const qq_api_url: string
    const qzone_autocomplete: boolean
    const random_graphs_mts: boolean
    const site_name: string
    const site_url: string
    const skin_bg0: string
    const skin_bg1: string
    const skin_bg2: string
    const skin_bg3: string
    const skin_bg4: string
    const template_url: string
    const windowheight: string
}
declare namespace mashiro_global{
let font_control:FontControl
let ini:{
    normalize()
    pjax()
}
let variables:{
    has_hls:boolean
    skinSecter:boolean
}
}