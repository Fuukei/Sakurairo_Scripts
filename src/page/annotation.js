// 初始化注释功能
export default function initAnnotations() {
    createAnnotationPopup();
    
    // 检查注释数据
    if (!_iro.have_annotation) return;
    
    if (typeof _iro.page_annotation === 'string') {
        _iro.page_annotation = JSON.parse(_iro.page_annotation);
    }        
    
    if (!_iro.page_annotation || Object.keys(_iro.page_annotation).length === 0) {
        return;
    }
    
    // 查找注释标记
    let annotationMarks = document.querySelectorAll('.iro-term-annotation');
    const processedTerms = new Set(); // 用于跟踪已处理的术语

    // 为每个术语的第一个注释标记添加点击事件
    annotationMarks.forEach(mark => {
        const term = mark.getAttribute('data-term');

        // 如果该术语尚未处理
        if (term && !processedTerms.has(term)) {
            mark.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();

                if (_iro.page_annotation && _iro.page_annotation[term]) {
                    let explanation = _iro.page_annotation[term];
                    let popup = document.getElementById('iro-annotation-popup');

                    popup.querySelector('.term').textContent = term;
                    popup.querySelector('.explanation').textContent = explanation;

                    let rect = this.getBoundingClientRect();
                    popup.style.top = (window.pageYOffset + rect.bottom + 10) + 'px';
                    popup.style.left = (rect.left - 50) + 'px'; // 调整弹窗位置以更好地适应
                    popup.style.display = 'block';
                }
            });
            processedTerms.add(term); // 将该术语标记为已处理
        }
    });
    
    // 点击其他区域关闭弹窗
    document.addEventListener('click', function(event) {
        let popup = document.getElementById('iro-annotation-popup');
        // 确保 popup 存在并且点击事件的目标不是注释标记或弹窗本身
        if (popup && popup.style.display === 'block' && !event.target.closest('.iro-term-annotation, .iro-annotation-popup')) {
            popup.style.display = 'none';
        }
    });
}

// 创建注释弹出层
function createAnnotationPopup() {
    let popup = document.getElementById('iro-annotation-popup');
    if (popup) return popup;
    
    popup = document.createElement('div');
    popup.id = 'iro-annotation-popup';
    popup.className = 'iro-annotation-popup';
    popup.innerHTML = '<span class="close">×</span><div class="term"></div><div class="explanation"></div>';
    document.body.appendChild(popup);
    
    popup.querySelector('.close').addEventListener('click', function() {
        popup.style.display = 'none';
    });
    
    return popup;
}