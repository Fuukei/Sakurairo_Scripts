export default function applyShowUpAnimation(elements: Iterable<Element> | null, callback?: (target: HTMLElement) => void) {
    if (!elements) return
    const io = new IntersectionObserver((entries) => {
        for (const entry of entries) {
            if (entry.isIntersecting) {
                entry.target.classList.add("post-list-show");
            } else {
                continue
            }
            const target = entry.target as HTMLElement
            io.unobserve(target)
            callback?.(target)
        }
    }, {
        threshold: [0.42]
    })
    for (const article of elements) {
        io.observe(article)
    }
}