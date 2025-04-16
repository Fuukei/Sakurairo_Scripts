import PromiseWorker from '@kotorik/promise-worker';
import { isInDarkMode } from '../darkmode';
//@ts-ignore
import 'color-space/hsl'
//@ts-ignore
import rgb from 'color-space/rgb'
import { ThemeColorWorkerReq, ThemeColorWorkerResp } from './interface';
import { awaitImage, readImageDownsampling, Vector4 } from '@kotorik/palette';
const originalThemeSkinMatcing = getComputedStyle(document.documentElement).getPropertyValue('--theme-skin-matching')
const proc = (async () => {
    try {
        const worker = new PromiseWorker<ThemeColorWorkerReq, ThemeColorWorkerResp>(
            // Pass options to the Worker constructor to specify robustness level
            new Worker(new URL('./worker.ts', import.meta.url), {
                // This will be used during worker initialization
                name: 'theme-color-worker',
                // 添加 robustness level 参数
                type: 'module',
                // 指定 robustness 级别为 "enforce"，确保即使跨域也能安全工作
                credentials: 'omit'
            })
        )
        // Return a modified postMessage function to always include transfer and robustness level
        return (data: Uint8ClampedArray, options: any) => {
            // @ts-ignore - Add robustness level to prevent browser warning
            return worker.postMessage(data, {
                transfer: options?.transfer || [],
                // 添加 robustness level 参数
                transferList: options?.transfer || [],
                robustness: "enforce", // 指定 robustness 级别
                // Force TypeScript to accept this property by using any type
            } as any);
        }
    } catch (error) {
        console.warn('主题色计算已回退到主线程进行，性能可能会有轻微影响')
        const module = import('./calc')
        return async (data: Uint8ClampedArray, options: any) => {
            const { default: calc } = await module
            return calc(data)
        }
    }
})()
let currentColor = [0, 0, 0, 0] as Vector4
export function hslaCSSText([h, s, l, a]: readonly [number, number, number, number?]) {
    if (a) {
        return "hsla(" + h + "deg," + s + "%," + l + "%," + a + ")"
    } else {
        return "hsl(" + h + "deg," + s + "%," + l + "%)"
    }
}

export async function getThemeColorFromImageElement(imgElement: HTMLImageElement): Promise<Vector4> {
    try {
        await awaitImage(imgElement)
        const imageData = readImageDownsampling(imgElement, 10000)
        // Use the modified postMessage function
        const result = await (await proc)(imageData.data, { 
            transfer: [imageData.data.buffer]
        })
        return result
    } catch (e) {
        console.error(e)
        return null
    }
}
function _updateThemeColorMeta(color_css: string) {
    const meta = document.querySelector<HTMLMetaElement>('meta[name=theme-color]');
    meta && (meta.content = color_css)
}
export async function updateThemeSkin(coverBGUrl: string) {
    // 如果未启用封面取色功能，直接返回
    if (!_iro.extract_theme_skin) return;

    const imgElement = document.createElement('img')
    imgElement.src = coverBGUrl
    imgElement.crossOrigin = "anonymous";

    const rgba = await getThemeColorFromImageElement(imgElement)
    if (rgba) {
        currentColor = rgba
        _setColor()
    } else {
        _updateThemeColorMeta(originalThemeSkinMatcing)//回滚
    }
}
function _setColor(darkmode?: boolean) {
    // 如果未启用封面取色功能，直接返回
    if (!_iro.extract_theme_skin) return;

    // Convert the RGB color to HSL
    let hsl = rgb.hsl(currentColor);
    
    // Ensure base color isn't too extreme - more strict bounds
    hsl[1] = Math.min(Math.max(hsl[1], 30), 85); // Keep saturation in reasonable range
    hsl[2] = Math.min(Math.max(hsl[2], 35), 65); // Keep lightness in middle range
    
    // Create a darker version for theme-skin-matching
    const matchingColor = [...hsl, currentColor[3]] as Vector4;
    // No saturation adjustment, keep original
    matchingColor[1] = hsl[1]; 
    // Ensure it doesn't go too dark or too light, stricter bounds
    matchingColor[2] = Math.min(Math.max(hsl[2] * 0.85, 30), 55); // Reduced lightness multiplier
    
    // Create a lighter version for theme-skin-dark (despite the name)
    const lightColor = [...hsl, currentColor[3]] as Vector4;
    // No saturation adjustment, keep original
    lightColor[1] = hsl[1];
    // Controlled lightness adjustment with stricter bounds, reduced multiplier
    lightColor[2] = Math.min(Math.max(hsl[2] * 1.15, 45), 70); // Further reduced multiplier from 1.3 to 1.15
    
    // Select the appropriate color based on dark mode state
    let hsla = (typeof darkmode == 'undefined' ? isInDarkMode() : darkmode) ? lightColor : matchingColor;
    
    // Update the theme color meta tag
    _updateThemeColorMeta(hslaCSSText(hsla));

    // 这里不需要再检查 extract_theme_skin，因为函数开头已经检查过了
    document.documentElement.style.setProperty('--theme-skin-matching', hslaCSSText(matchingColor));
    document.documentElement.style.setProperty('--theme-skin-dark', hslaCSSText(lightColor));
}

export function initThemeColor() {

    // 监听封面背景变化事件
    document.addEventListener('coverBG_change', (({ detail: coverBGUrl }: CustomEvent<string>) => updateThemeSkin(coverBGUrl)) as any)
    // 监听暗色模式变化事件
    document.addEventListener('darkmode', (({ detail: next }: CustomEvent<boolean>) => _setColor(next)) as any)
}

// export function getForeground(rgba: Vector4) {
//     const hsl = rgb.hsl(rgba);
//     // Use a more conservative threshold to determine text color
//     // This helps ensure text remains readable regardless of background
//     return hsl[2] > 60 ? [0, 0, 0, 1] as Vector4 : [0, 0, 100, 1] as Vector4; // Increased threshold for better contrast
// }

export function getHighlight(rgba: Vector4) {
    const hsl = rgb.hsl(rgba);
    // Create a highlight with more controlled adjustments
    const highlightHsl = [...hsl] as [number, number, number];
    
    // First ensure base values are in good ranges - stricter bounds
    highlightHsl[1] = Math.min(Math.max(highlightHsl[1], 30), 85); // Maintain saturation range
    highlightHsl[2] = Math.min(Math.max(highlightHsl[2], 40), 65); // Tighter lightness range, reduced upper bound
    
    // No saturation adjustments at all
    // No lightness adjustments beyond the bounds check
    
    return [...highlightHsl, rgba[3]] as Vector4;
}