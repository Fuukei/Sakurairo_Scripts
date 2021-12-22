const mainContainer = document.getElementById("main-container")

function toggle() {
    document.body.classList.toggle("navOpen");
    mainContainer.classList.toggle("open");
    document.getElementById("mo-nav").classList.toggle("open");
    document.querySelector(".openNav").classList.toggle("open");
    document.querySelector(".site-header").classList.toggle("open")
}
export function open() {
    toggle()
    document.documentElement.style.overflow = "hidden"
    mainContainer.addEventListener('click', close)
}
export function close() {
    toggle()
    document.documentElement.style.overflow = "unset"
    mainContainer.removeEventListener('click', close)
}