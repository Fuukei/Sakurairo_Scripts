import { createButterbar } from "../common/butterbar";
import lazyload from "../common/lazyload"

const PaginationListener = (e: any) => {
    const target: HTMLElement = e.target;
    if (target === document.querySelector("#template-pagination a")) {
        e.preventDefault();
        e.stopPropagation();
        if (target.classList.contains("loading")) return;
        target.classList.add("loading");
        target.textContent = "";

        fetch(target.dataset.href + "&_wpnonce=" + _iro.nonce, {
            method: "POST"
        }
        )
            .then(async res => {
                const data = await res.json();
                if (res.ok) {
                    document.getElementById("template-pagination").remove();
                    document.querySelector(".row").insertAdjacentHTML('beforeend', data);
                    //@ts-ignore
                    lazyload()
                } else {
                    throw Error(`Error，Status：${res.status}`);
                }
            })
            .catch(e => {
                console.error(e);
                createButterbar(e);
                target.classList.remove("loading");
                target.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> ERROR ';
            })
    }
}

export default function LoadNextPage() {
    const sections = document.getElementsByTagName("section")
    let _flag = false;
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].classList.contains("have-columns")) {
            _flag = true;
            break
        }
    }
    if (_flag) {
        document.addEventListener('click', PaginationListener);
    }
}