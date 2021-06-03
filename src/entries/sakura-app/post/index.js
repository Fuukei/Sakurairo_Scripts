async function IA() {
    const POWERMODE = (await import('activate-power-mode')).default
    POWERMODE.colorful = true;
    POWERMODE.shake = false;
    document.body.addEventListener('input', POWERMODE)
}
    IA()
