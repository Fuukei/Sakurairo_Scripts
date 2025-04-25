export default function initFooter(action = 'init') {
  let footer = document.getElementById('colophon');
  let emojiPanel = document.querySelector('.emotion-box');
  if (!footer) return;

  // 隐藏 footer
  function hideFooter() {
    let footer = document.getElementById('colophon');
    footer.classList.remove('show');
  }

  function adjustWrapperPadding() {
    const wrapper = document.querySelector('.site.wrapper');
    if (!wrapper) return;
    const footerHeight = footer.offsetHeight;
    const paddingValue = footerHeight * 1.3;
    wrapper.style.paddingBottom = `${paddingValue}px`;
  }

  function checkFooterVisibility() {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    const windowHeight   = window.innerHeight;
    const documentHeight = document.body.scrollHeight;
    const showThreshold  = documentHeight - 100;

    if (scrollPosition + windowHeight >= showThreshold) {
      if (!footer.classList.contains('show')) {
        if (emojiPanel && emojiPanel.classList.contains("open") && window.outerWidth < 860) {
          return;
        }
        requestAnimationFrame(() => footer.classList.add('show'));
      }
    } else {
      if (footer.classList.contains('show')) {
        requestAnimationFrame(() => footer.classList.remove('show'));
      }
    }
  }

  function initialize() {
    footer = document.getElementById('colophon');
    emojiPanel = document.querySelector('.emotion-box');
    // 初始化隐藏
    hideFooter();
    adjustWrapperPadding();

    // 解绑旧的监听，避免重复
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', checkFooterVisibility);

    // 首次检查（延迟100ms，保证页面渲染完成后也能正确显示）
    checkFooterVisibility();
    setTimeout(checkFooterVisibility, 100);

    // 节流滚动监听
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkFooterVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll);
    window.addEventListener('resize', checkFooterVisibility);
  }

  // 监听 PJAX 完成后再次初始化
  document.addEventListener('pjax:complete', initialize);

  // ———— 根据 action 分发 ————
  switch (action) {
    case 'init':
      initialize();
      break;
    case 'hide':
      hideFooter();
      break;
    case 'check':
      checkFooterVisibility();
      break;
    default:
      initialize();
  }
}
