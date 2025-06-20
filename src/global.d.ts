declare namespace _iro {
    // Poi
    let pjax: boolean
    const movies: {
        url: string,
        name: string,
        /**自动续播 */
        live: boolean,
        /**列表循环 */
        loop: boolean
    }/*  | 'close' */
    const windowheight: string
    const codeLamp: string
    const ajaxurl: string
    const language: string
    const captcha_endpoint: string
    const order: string
    const formpostion: string
    const api: string
    const iro_api: string
    const nonce: string
    const google_analytics_id: string
    const gravatar_url: string
    // options
    const NProgressON: boolean
    const audio: boolean
    const author_name: string
    const baguetteBox: boolean
    const fancybox: boolean
    const lightGallery:  Record<string, unknown> | false | undefined
    const clipboardRef: boolean
    const cookie_version_control: string
    const cover_api: string
    /**
     * darmode
     */
    const darkmode: boolean
    const dm_strategy: 'client' | 'time' | 'eien'
    /**************************** */
    /**
     * preload blur
     * 为0时功能关闭，单位ms
     * @seealso https://developer.mozilla.org/en-US/docs/Web/API/EffectTiming/duration
     */
    const preload_blur: number
    const email_domain: string
    const email_name: string
    const effect: Effect
    const entry_content_style: 'sakurairo' | 'github'
    const entry_content_style_src: string
    /**
     * 是否从封面图像提取主题色
     */
    const extract_theme_skin: boolean
    const jsdelivr_css_src: string
    const land_at_home: boolean
    const live_search: boolean
    /**
     * 文章特色图取色
     */
    const post_theme_color: string // rgba/'false'
    const extract_article_highlight: boolean
    const post_cover_as_bg: boolean
    const post_feature_img: string
    /**
     * 图片加载占位符
     */
    const missing_avatars: string
    const missing_images: string
    const loading_ph:string
    const qq_api_url: string
    const qzone_autocomplete: boolean
    const random_graphs_mts: boolean
    const site_name: string
    const skin_bg0: string
    const site_url: string
    const skin_bg1: string
    const skin_bg2: string
    const skin_bg3: string
    const skin_bg4: string
    const meting_api_url: string | undefined
    const code_highlight: "prism" | "hljs" | "custom"
    const code_highlight_prism: {
        line_number_all: boolean
        autoload_path: string,
        theme: {
            light: string,
            dark: string
        }
    }
    /**
     * 开启评论上传图片功能
     */
    const comment_upload_img: boolean
    const img_upload_max_size: number
    /**
     * 
     */
    const cache_cover: boolean
    const site_bg_as_cover: boolean
    const float_player_on: boolean
    const yiyan_api: Array<string>
    /**
     * 是否从CDN源加载第三方库
     */
    const ext_shared_lib: boolean
    const dev_mode: boolean
    const is_admin: boolean | string
    const page_annotation: string | string[]
    const have_annotation: boolean
}
declare namespace mashiro_global {
    //let font_control:FontControl
    /*     let ini: {
            normalize()
            pjax()
        } */
    let variables: {
        skinSecter: boolean
    }
}
interface Document {
    /**
     * getElementById的泛型版本
     */
    getElementById<E extends HTMLElement = HTMLElement>(elementId: string): E | null;
}
interface Effect {
    amount: number | string
    type: 'sakura' | 'yuki'
}
//#region define const
declare const BUILD_INFO: { hash: string, date: string }
declare const PKG_INFO:Record<string,string>
//#endregion