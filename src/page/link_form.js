/**
 * 友情链接提交功能
 * 
 * 处理友情链接提交表单的前端逻辑，包括表单验证、提交和用户反馈
 */

// 多语言翻译
function i18n_form() {
    let sakura_links = {
        // 简体中文
        'zh_CN': {
            // 按钮文本
            submitting: '提交中...',

            // 常规错误提示
            server_error: '服务器错误：',
            connection_error: '连接错误，请稍后重试',
            timeout_error: '请求超时，请稍后重试',

            // 验证错误提示
            invalid_url: '请输入有效的网站地址',
            invalid_email: '请输入有效的邮箱地址',
            security_error: '安全验证失败，请刷新页面后重试',

            // 验证码相关
            captcha_load_error: '验证码加载失败，请刷新重试',
            refresh_captcha: '刷新验证码'
        },

        // 繁体中文
        'zh_TW': {
            // 按钮文本
            submitting: '提交中...',

            // 常规错误提示
            server_error: '伺服器錯誤：',
            connection_error: '連接錯誤，請稍後重試',
            timeout_error: '請求超時，請稍後重試',

            // 验证错误提示
            invalid_url: '請輸入有效的網站地址',
            invalid_email: '請輸入有效的郵箱地址',
            security_error: '安全驗證失敗，請刷新頁面後重試',

            // 验证码相关
            captcha_load_error: '驗證碼加載失敗，請刷新重試',
            refresh_captcha: '刷新驗證碼'
        },

        // 日语
        'ja': {
            // 按钮文本
            submitting: '送信中...',

            // 常规错误提示
            server_error: 'サーバーエラー：',
            connection_error: '接続エラー、後でもう一度お試しください',
            timeout_error: 'リクエストがタイムアウトしました、後でもう一度お試しください',

            // 验证错误提示
            invalid_url: '有効なURLを入力してください',
            invalid_email: '有効なメールアドレスを入力してください',
            security_error: 'セキュリティ検証に失敗しました、ページを更新して再試行してください',

            // 验证码相关
            captcha_load_error: '認証コードの読み込みに失敗しました、更新して再試行してください',
            refresh_captcha: '認証コードを更新'
        }
    };

    // 获取页面语言，默认简体中文
    let currentLang = 'zh_CN';
    try {
        // 优先从全局变量获取
        if (_iro.language) {
            currentLang = _iro.language;
        }
        // 从HTML标签获取
        else if (document.documentElement.lang) {
            let htmlLang = document.documentElement.lang;
            currentLang = htmlLang.replace(/-/g, '_');
        }
    } catch (e) {
        // 出错时使用默认语言
    }

    let validLangs = ['zh_CN', 'zh_TW', 'ja'];
    let lang = validLangs.includes(currentLang) ? currentLang : 'zh_CN';
    let i18n = sakura_links[lang] || sakura_links['zh_CN'];

    return i18n;
}

// 全局初始化函数，支持PJAX环境
export default function initLinkSubmission() {

    let i18n = i18n_form();
    let submitButton = document.getElementById('openLinkModal');
    let linkModal = document.getElementById('linkModal');
    let closeButton = document.querySelector('.link-modal-close');
    let linkForm = document.getElementById('linkSubmissionForm');
    let captchaImg = document.getElementById('captchaImg');

    // 如果相关元素不存在
    if (!linkForm || !submitButton || !linkModal || !closeButton || !captchaImg) {
        if (!linkForm) { // 检查是否曾初始化
            document.removeEventListener('pjax:complete', initLinkSubmission);
        }
        return;
    }

    let patternTitle = document.querySelector('.pattern-header span'); // 检查页面头图
    if (patternTitle) { // 移动按钮到标题后方
        patternTitle.parentNode.insertBefore(submitButton, patternTitle.nextElementSibling);
    }

    // 初始化行为
    submitButton.addEventListener('click', handleModalOpen); // 呼出
    closeButton.addEventListener('click', handleModalClose); // 关闭
    document.addEventListener('mousedown', handleOutsideClick); // 点击外部关闭
    captchaImg.addEventListener('click', loadCaptcha);

    // 清理函数
    document.addEventListener('pjax:complete', cleanup);
    function cleanup() {
        // 移除所有事件监听器
        submitButton.removeEventListener('click', handleModalOpen);
        closeButton.removeEventListener('click', handleModalClose);
        document.removeEventListener('mousedown', handleOutsideClick);
        captchaImg.removeEventListener('click', loadCaptcha);

        linkForm.removeEventListener('submit', handleFormSubmit);

        enableScroll();
        document.removeEventListener('pjax:complete', cleanup); // 清理自身
    };

    function handleModalOpen(e) { // 点击展开
        e.preventDefault();
        disableScroll();
        linkModal.style.display = 'flex';
        loadCaptcha();
    }

    function handleModalClose() { // 点击关闭
        enableScroll();
        linkModal.style.display = 'none';
    }

    function handleOutsideClick(e) { // 点击外部关闭
        if (e.target === linkModal) {
            linkModal.style.display = 'none';
            enableScroll();
        }
    }

    // 滚动行为
    function disableScroll() {
        document.documentElement.style.overflow = 'hidden';
    }

    function enableScroll() {
        document.documentElement.style.overflowY = 'unset';
    }

    // 表单提交
    let isSubmitting = false;
    let submissionTimeout = null;
    let submissionLock = false; // 添加提交锁，防止重复提交

    // 添加表单提交事件监听器
    linkForm.addEventListener('submit', handleFormSubmit);

    // 定义表单提交处理函数
    async function handleFormSubmit(e) {
        e.preventDefault();

        // 防止重复提交 - 使用双重锁定机制
        if (isSubmitting || submissionLock) {
            console.log('防止重复提交');
            return;
        }

        // 设置提交锁
        submissionLock = true;

        // 延迟执行，确保UI有时间响应
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            // 重置状态
            clearTimeout(submissionTimeout);

            //开始提交
            isSubmitting = true;

            // 验证表单
            if (!validateForm()) {
                isSubmitting = false;
                submissionLock = false;
                return;
            }

            // 禁用提交按钮
            let submitButton = linkForm.querySelector('.link-form-submit');
            if (submitButton) {
                submitButton.disabled = true;
            }

            displayStatus('info', i18n.submitting);

            // 准备表单数据
            let formData = new FormData(linkForm);
            formData.append('action', 'link_submission');

            let ajaxUrl = _iro.ajaxurl;

            // 设置提交超时
            let fetchPromise = fetch(ajaxUrl, {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });
            let timeoutPromise = new Promise((_, reject) => {
                submissionTimeout = setTimeout(() => {
                    reject(new Error(i18n.timeout_error));
                }, 15000);
            });

            let response = await Promise.race([fetchPromise, timeoutPromise]);
            clearTimeout(submissionTimeout);

            if (!response.ok) {
                throw new Error(`${i18n.server_error} ${response.status}`);
            }

            // 捕获响应
            let text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                throw new Error('服务器返回了无效的JSON响应');
            }

            // 根据返回结果进行处理
            if (data.success) {
                displayStatus('success', data.data.message);
                linkForm.reset();
            } else {
                displayStatus('error', data.data.message);
                loadCaptcha();
            }
        } catch (error) {
            displayStatus('error', error.message || i18n.connection_error);
            loadCaptcha();
        } finally {
            // 恢复提交状态及按钮，确保最终释放锁
            isSubmitting = false;
            const submitButton = linkForm.querySelector('.link-form-submit');
            if (submitButton) {
                submitButton.disabled = false;
            }
            // 延迟释放提交锁，防止快速连续点击
            setTimeout(() => {
                submissionLock = false;
            }, 1000);
        }
    }
}

// 验证表单
function validateForm() {
    let i18n = i18n_form(); // 确保获取正确的翻译
    let siteName = document.getElementById('siteName');
    let siteUrl = document.getElementById('siteUrl');
    let siteDescription = document.getElementById('siteDescription');
    let siteImage = document.getElementById('siteImage');
    let contactEmail = document.getElementById('contactEmail');
    let captcha = document.getElementById('yzm');
    let timestampInput = document.getElementById('timestamp');
    let idInput = document.getElementById('captchaId');
    let nonceInput = document.querySelector('input[name="link_submission_nonce"]');

    // 检查是否所有必要元素都存在
    if (!siteName || !siteUrl || !siteDescription || !siteImage || !contactEmail || !captcha || !timestampInput || !idInput || !nonceInput.value) {
        displayStatus('error', i18n.security_error);
        return false;
    }

    if (!timestampInput.value || !idInput.value) {
        displayStatus('error', i18n.captcha_load_error);
        return false;
    }

    // 检查URL格式 - 确保以http或https开头
    let siteUrlValue = siteUrl.value.trim();
    if (!/^https?:\/\//i.test(siteUrlValue)) {
        siteUrlValue = 'https://' + siteUrlValue;
        siteUrl.value = siteUrlValue;
    }

    let urlPattern = /^https?:\/\/([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
    if (!urlPattern.test(siteUrlValue)) {
        displayStatus('error', i18n.invalid_url);
        return false;
    }

    // 检查图片URL格式 - 确保以http或https开头
    let siteImageValue = siteImage.value.trim();
    if (!/^https?:\/\//i.test(siteImageValue)) {
        siteImageValue = 'https://' + siteImageValue;
        siteImage.value = siteImageValue;
    }

    if (!urlPattern.test(siteImageValue)) {
        displayStatus('error', i18n.invalid_url);
        return false;
    }

    // 检查邮箱格式
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(contactEmail.value.trim())) {
        displayStatus('error', i18n.invalid_email);
        return false;
    }

    // 防止XSS攻击 - 检查输入值是否包含可疑内容
    let xssPattern = /<script[^>]*>[\s\S]*?<\/script>|<[^>]*on\w+\s*=|javascript:|data:/i;
    if (
        xssPattern.test(siteName.value) ||
        xssPattern.test(siteDescription.value) ||
        xssPattern.test(siteUrlValue) ||
        xssPattern.test(siteImageValue) ||
        xssPattern.test(contactEmail.value)
    ) {
        displayStatus('error', i18n.security_error);
        return false;
    }

    return true;
}

// 加载验证码
function loadCaptcha() {
    let i18n = i18n_form(); // 确保获取正确的翻译
    let captchaImg = document.getElementById('captchaImg');
    let captchaInput = document.getElementById('yzm');
    let timestampInput = document.getElementById('timestamp');
    let idInput = document.getElementById('captchaId');

    // 元素检查
    if (!captchaImg || !captchaInput || !timestampInput || !idInput) {
        return;
    }

    // 显示加载中状态
    captchaImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMCIgaGVpZ2h0PSIzMCIgdmlld0JveD0iMCAwIDM4IDM4IiBzdHJva2U9IiM2NjYiPjxnIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMSAxKSIgc3Ryb2tlLXdpZHRoPSIyIj48Y2lyY2xlIHN0cm9rZS1vcGFjaXR5PSIuMyIgY3g9IjE4IiBjeT0iMTgiIHI9IjE4Ii8+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4Ij48YW5pbWF0ZVRyYW5zZm9ybSBhdHRyaWJ1dGVOYW1lPSJ0cmFuc2Zvcm0iIHR5cGU9InJvdGF0ZSIgZnJvbT0iMCAxOCAxOCIgdG89IjM2MCAxOCAxOCIgZHVyPSIxcyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz48L3BhdGg+PC9nPjwvZz48L3N2Zz4=';
    captchaInput.value = '';

    // 获取验证码API地址
    let endpointUrl = _iro.captcha_endpoint || '';
    if (!endpointUrl) {
        displayStatus('error', i18n.captcha_load_error);
        return;
    }

    // 添加时间戳防止缓存
    let timestamp = Date.now();
    let endpoint = endpointUrl + (endpointUrl.includes('?') ? '&' : '?') + 't=' + timestamp;

    fetch(endpoint, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(i18n.captcha_load_error);
            }
            return response.text();
        })
        .then(responseText => {
            try {
                let data = JSON.parse(responseText);

                // 首先检查API返回的code，不为0表示API自身报错
                if (data.code !== undefined && data.code !== 0) {
                    throw new Error(data.msg || i18n.captcha_load_error);
                }

                // 检查必要字段是否存在
                if (!data.data || !data.id || !data.time) {
                    throw new Error(i18n.captcha_load_error);
                }

                // 设置验证码图片
                captchaImg.src = data.data;
                captchaImg.classList.remove('error');

                // 设置ID和时间戳
                timestampInput.value = String(data.time);
                idInput.value = String(data.id);
            } catch (e) {
                throw new Error(i18n.captcha_load_error);
            }
        })
        .catch(error => {
            captchaImg.classList.add('error');
            captchaImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNlNzRjM2MiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCI+PC9jaXJjbGU+PGxpbmUgeDE9IjE1IiB5MT0iOSIgeDI9IjkiIHkyPSIxNSI+PC9saW5lPjxsaW5lIHgxPSI5IiB5MT0iOSIgeDI9IjE1IiB5Mj0iMTUiPjwvbGluZT48L3N2Zz4=';
            displayStatus('error', i18n.captcha_load_error);
            setTimeout(loadCaptcha, 3000);
        });
}

// 显示状态消息
function displayStatus(type, message) {
    let statusElement = document.getElementById('formStatus');

    if (!statusElement || !message) {
        return;
    }

    // 防抖：如果已经有计划的状态更新，取消它
    if (window._statusUpdateTimeout) {
        clearTimeout(window._statusUpdateTimeout);
    }

    // 延迟执行状态更新，避免快速连续调用
    window._statusUpdateTimeout = setTimeout(() => {
        // 清理消息内容，防止XSS
        let sanitizedMessage = message.replace(/[<>"'&]/g, (c) => {
            return { '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '&': '&amp;' }[c];
        });

        // 设置消息类型和内容
        statusElement.className = 'form-status';
        statusElement.classList.add(type === 'success' ? 'success-msg' : 'error-msg');
        statusElement.textContent = sanitizedMessage;
        statusElement.style.display = 'block';

        // 成功消息自动隐藏
        if (type === 'success') {
            setTimeout(() => {
                if (statusElement) {
                    statusElement.style.display = 'none';
                }
            }, 5000);
        }
    }, 50); // 50ms的防抖延迟
}

// 页面加载完成时初始化链接提交功能
document.addEventListener('DOMContentLoaded', initLinkSubmission);
document.addEventListener('pjax:complete', initLinkSubmission);