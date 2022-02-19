import { createButterbar } from "../common/butterbar";
import { lazyload } from 'lazyload'

const bgmlistener = (e: any) => {
    const target: HTMLElement = e.target;
    if (target === document.querySelector("#bangumi-pagination a")) {
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
                    document.getElementById("bangumi-pagination").remove();
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
                target.innerHTML = '<i class="fa fa-exclamation-triangle" aria-hidden="true"></i> ERROR ';
            })
    }
}

export default function load_bangumi() {
    const sections = document.getElementsByTagName("section")
    let _flag = false;
    for (let i = 0; i < sections.length; i++) {
        if (sections[i].classList.contains("bangumi")) {
            _flag = true;
            break
        }
    }
    if (_flag) {
        document.addEventListener('click', bgmlistener);
    }
}