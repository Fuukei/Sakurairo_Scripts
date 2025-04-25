import initFooter from "../app/footer"

export default function prepareEmoji() {
    const emojiPanelButton = document.getElementById('emotion-toggle');
    const emojiPanel = document.querySelector('.emotion-box');
    const header = document.querySelector('.emotion-header');
    const commentTextArea = document.querySelector('.comment-textarea');

    if (!emojiPanelButton) {
        document.removeEventListener('click', closeEmojiPanel );
        document.removeEventListener('mousemove', moveDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', moveDrag);
        document.removeEventListener('touchend', endDrag);
        if (header) {
            header.removeEventListener('touchstart', startDrag);
            header.removeEventListener('mousedown', startDrag);
        }
        return
    }

    if (emojiPanelButton) {
        emojiPanelButton.addEventListener('click', openEmoji);
    }

    function openEmoji() {
        if (!emojiPanel) return;
      
        // 判断是否已经拖动过
        const dragged = emojiPanel.getAttribute('dragged');
      
        if (!dragged) {
            const btnRect = emojiPanelButton.getBoundingClientRect();
            const panelWidth = emojiPanel.offsetWidth;
            const panelHeight = emojiPanel.offsetHeight;

            let leftPos = btnRect.left + window.scrollX + (btnRect.width / 2) - (panelWidth / 2);
            const isFixed = window.getComputedStyle(emojiPanel).position === "fixed";
            // let topPos = isFixed ? (btnRect.top - panelHeight) : (btnRect.top - panelHeight + window.scrollY);

            let topPos = btnRect.bottom;
            // 若下方空间不足，则放在按钮上方
            if (topPos + panelHeight > window.innerHeight) {
                topPos = btnRect.top - panelHeight;
            }

            emojiPanel.style.left = `${leftPos}px`;
            emojiPanel.style.top = `${topPos}px`;
        }
      
        // 立即呼出
        if (emojiPanel.classList.contains("open")) {
            emojiPanel.classList.toggle('open');
            initFooter("check");
        } else {
            emojiPanel.classList.toggle('open');
            initFooter("hide");
        }
      
        // 初始化拖拽监听器
        if (!emojiPanel.hasAttribute('initialized')) {
            initEmojiPanel();
            emojiPanel.setAttribute('initialized', 'true'); // 标记已初始化
        }
      }

    function initEmojiPanel() {
        if (!emojiPanel || !header) return;
        
        // 监听鼠标事件
        header.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', moveDrag);
        document.addEventListener('mouseup', endDrag);
        
        // 监听触摸事件
        header.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', moveDrag, { passive: false });
        document.addEventListener('touchend', endDrag);
        
        // 点击外部关闭面板
        if (emojiPanelButton) {
            document.addEventListener('click', closeEmojiPanel );
        }
    }

    // 不处于输入框、表情面板、表情开关时，关闭
    function closeEmojiPanel (e) {
        const target = e.target;
        if (
            !emojiPanel.contains(target) && 
            !emojiPanelButton.contains(target) &&
            !commentTextArea.contains(target) ) 
        {
            if (emojiPanel.classList.contains("open")) {
                emojiPanel.classList.remove('open');
                initFooter("check");
            }
        }
    }

    let offsetX = 0, offsetY = 0, isDragging = false;
      
    function startDrag(e) {
        isDragging = true;
        const event = (e).touches ? (e).touches[0] : (e);
        offsetX = event.clientX - emojiPanel.offsetLeft;
        offsetY = event.clientY - emojiPanel.offsetTop;
        emojiPanel.style.transition = "none"; // 拖拽时禁用动画
    
        if ((e).touches) e.preventDefault();
    }
    
    function moveDrag(e) {
        if (!isDragging) return;
        const event = (e).touches ? (e).touches[0] : (e);
        const left = event.clientX - offsetX;
        const top = event.clientY - offsetY;
        emojiPanel.style.left = `${left}px`;
        emojiPanel.style.top = `${top}px`;
        emojiPanel.setAttribute('dragged', 'true'); // 标记为已拖拽
    
        if ((e).touches) e.preventDefault();
    }
    
    function endDrag() {
        isDragging = false;
        emojiPanel.style.transition = "";
    }

    const row = document.querySelector('.emotion-box>table tr')
    if (!row) return

    //表情栏切换
    row.addEventListener('click', (e) => {
        if ((e.target).tagName === 'TH') {
            for (const element of row.querySelectorAll('th')) {
                const match = element.className.match(/(\S+)-bar/);
                if (!match) return;
                /** @type {HTMLElement|null} */
                const container = document.querySelector(`.${match[1]}-container`);
                if (element === e.target) {
                    element.classList.add('on-hover')
                    container.style.display = 'block'
                } else {
                    element.classList.remove('on-hover')
                    container.style.display = 'none'
                }
            }
        }
    })
}
