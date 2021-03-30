export type window = Window & typeof globalThis & {
    webkitAudioContext:{
        new (contextOptions?: AudioContextOptions | undefined): AudioContext;
        prototype: AudioContext;
    }
}