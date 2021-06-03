function imgError(ele, type) {
    switch (type) {
        case 1:
            ele.src = 'https://view.moezx.cc/images/2017/12/30/Transparent_Akkarin.th.jpg';
            break;
        case 2:
            ele.src = 'https://sdn.geekzu.org/avatar/?s=80&d=mm&r=g';
            break;
        default:
            ele.src = 'https://view.moezx.cc/images/2018/05/13/image-404.png';
    }
}
function cmt_showPopup(ele) {
    let popup = ele.querySelector("#thePopup");
    popup.classList.add("show");
    ele.querySelector("input").onblur = () => {
        popup.classList.remove("show");
    }
}
/*视频feature*/
function coverVideo() {
    let video = document.getElementById("coverVideo"),
        btn = document.getElementById("coverVideo-btn");

    if (video.paused) {
        video.play();
        try {
            btn.innerHTML = '<i class="fa fa-pause" aria-hidden="true"></i>';
        } catch { };
        //console.info('play:coverVideo()');
    } else {
        video.pause();
        try {
            btn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
        } catch { };
        //console.info('pause:coverVideo()');
    }
}

function killCoverVideo() {
    var video = document.getElementById("coverVideo");
    var btn = document.getElementById("coverVideo-btn");

    if (video.paused) {
        //console.info('none:killCoverVideo()');
    } else {
        video.pause();
        try {
            btn.innerHTML = '<i class="fa fa-play" aria-hidden="true"></i>';
        } catch (e) { };
        //console.info('pause:killCoverVideo()');
    }
}
function mail_me() {
    var mail = "mailto:" + mashiro_option.email_name + "@" + mashiro_option.email_domain;
    window.open(mail);
}
/* 首页下拉箭头 */
function headertop_down() {
    let coverOffset = document.getElementById("content").getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
        top: coverOffset,
        behavior: "smooth"
    });
}
window.imgError = imgError
window.cmt_showPopup = cmt_showPopup
window.coverVideo = coverVideo
window.killCoverVideo = killCoverVideo
window.mail_me = mail_me
window.headertop_down = headertop_down