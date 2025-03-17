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
    
    // 为所有注释标记添加点击事件
    annotationMarks.forEach(mark => {
        mark.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            
            let term = this.getAttribute('data-term');
            if (_iro.page_annotation && _iro.page_annotation[term]) {
                let explanation = _iro.page_annotation[term];
                let popup = document.getElementById('iro-annotation-popup');
                
                popup.querySelector('.term').textContent = term;
                popup.querySelector('.explanation').textContent = explanation;
                
                let rect = this.getBoundingClientRect();
                popup.style.top = (window.pageYOffset + rect.bottom + 10) + 'px';
                popup.style.left = (rect.left - 50) + 'px';
                popup.style.display = 'block';
            }
        });
    });
    
    // 点击其他区域关闭弹窗
    document.addEventListener('click', function(event) {
        let popup = document.getElementById('iro-annotation-popup');
        if (popup && !event.target.closest('.iro-term-annotation, .iro-annotation-popup')) {
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