function post_list_show_animation() {
    if (document.getElementsByTagName('article')[0]?.classList.contains("post-list-thumb")) {
        const options = {
            root: null,
            threshold: [0.66]
        }
        const io = new IntersectionObserver((entries) =>
            entries.forEach(/* !window.IntersectionObserver ? (article) => {
                article.target.style.willChange = 'auto';
                if (article.target.classList.contains("post-list-show") === false) {
                    article.target.classList.add("post-list-show");
                }
            } : */ //review: 没有必要检查IntersectionObserver，如果失败则在new IntersectionObserver()时就会抛出错误
                (article) => {
                    if (article.target.classList.contains("post-list-show")) {
                        (article.target as HTMLElement).style.willChange = 'auto';
                        io.unobserve(article.target)
                    } else {
                        if (article.isIntersecting) {
                            article.target.classList.add("post-list-show");
                            (article.target as HTMLElement).style.willChange = 'auto';
                            io.unobserve(article.target)
                        }
                    }
                })
            , options)
        const articles = document.getElementsByClassName('post-list-thumb');
        for (let a = 0; a < articles.length; a++) {
            io.observe(articles[a]);
        }
    }
}