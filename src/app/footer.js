export default function initFooter() {

  initFooterVisibility();

  document.addEventListener('pjax:complete', function () {
    initFooterVisibility();
  });

  function initFooterVisibility() {
    const footer = document.getElementById('colophon');
    if (!footer) return;

    // 初始状态设置为隐藏
    footer.classList.remove('show');

    // 计算footer高度并设置wrapper的padding-bottom
    const footerHeight = footer.offsetHeight;
    const paddingValue = footerHeight * 1.3;
    const wrapper = document.querySelector('.site.wrapper');
    if (wrapper) {
      wrapper.style.paddingBottom = `${paddingValue}px`;
    }

    function checkFooterVisibility() {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.scrollHeight;
      const showThreshold = documentHeight - 100;

      // 当滚动到接近页面底部时显示footer，否则隐藏
      if (scrollPosition + windowHeight >= showThreshold) {
        if (footer && !footer.classList.contains('show')) {
          // 添加show类来显示footer
          requestAnimationFrame(() => {
            footer.classList.add('show');
          });
        }
      } else {
        if (footer && footer.classList.contains('show')) {
          // 移除show类来隐藏footer
          requestAnimationFrame(() => {
            footer.classList.remove('show');
          });
        }
      }
    }

    // 移除之前可能添加的事件监听器，避免重复
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', checkFooterVisibility);

    // 初始检查 - 使用setTimeout确保在页面完全加载后再次检查，解决初始状态问题
    checkFooterVisibility();
    setTimeout(checkFooterVisibility, 100);

    // 滚动事件节流处理
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          checkFooterVisibility();
          ticking = false;
        });
        ticking = true;
      }
    }

    // 滚动时检查
    window.addEventListener('scroll', onScroll);

    // 窗口大小变化时检查
    window.addEventListener('resize', checkFooterVisibility);
  }
}