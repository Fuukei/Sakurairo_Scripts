import { ready } from "./common/util";

ready(() => {
    function updateMaxHeightOfFolder(folder: HTMLElement) {
        const folderStyle = getComputedStyle(folder);
        const folderContent = folder.querySelector(".folder-content");
        folder.style.maxHeight = parseInt(folderStyle.maxHeight) + folderContent.scrollHeight + 'px';
    }
    function handleClick({ currentTarget }: MouseEvent) {
        const folder: HTMLElement = (currentTarget as HTMLElement).closest('.folder');
        const folderStyle = getComputedStyle(folder);
        if (folderStyle.maxHeight === '200px') {
            (currentTarget as HTMLElement).innerText = '收起';
            updateMaxHeightOfFolder(folder)
        } else {
            (currentTarget as HTMLElement).innerText = '展开';
            folder.style.maxHeight = '200px';
        }
    }
    document.querySelectorAll('.expand-button').forEach((elem) => {
        (elem as HTMLElement).addEventListener('click', handleClick, true);
    });
    /* 				window.addEventListener('resize', function() {
            expandButton.forEach(function(elem) {
                let folder = elem.closest('.folder');
                let folderStyle = getComputedStyle(folder);
                if (folderStyle.maxHeight !== '200px'){
                    let folderContent = folder.querySelector(".folder-content");
                    folder.style.maxHeight = parseInt(folderStyle.maxHeight) + folderContent.scrollHeight + 'px';
                }
            });
        }, true); */

    document.addEventListener('click', async (e) => {
        const elem = e.target as HTMLElement | undefined;
        if (elem?.classList.contains('load-more')) {
            const resp = await fetch(elem.getAttribute('data-href') + "&_wpnonce=" + _iro.nonce, { method: 'POST' })
            const html = (await resp.json())
            const htmlObject = document.createElement('div')
            htmlObject.innerHTML = html;
            while (htmlObject.childNodes.length > 0) {
                elem.parentNode.appendChild(htmlObject.childNodes[0]);
            }
            updateMaxHeightOfFolder(elem.closest('.folder'))
            elem.remove();
        }
    });
})
