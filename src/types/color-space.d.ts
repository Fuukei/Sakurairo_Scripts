declare module 'color-space/rgb' {
    const rgb: {
        hsl: (rgb: readonly [number, number, number, number?]) => [number, number, number]
    }
    export default rgb;
}

declare module 'color-space/hsl' {
    const hsl: {
        rgb: (hsl: readonly [number, number, number]) => [number, number, number]
    }
    export default hsl;
}
