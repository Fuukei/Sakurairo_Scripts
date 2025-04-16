function imgError(ele, type) {
    svg404 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150"><rect width="200" height="150" fill="#f8f8f8"/><text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" dominant-baseline="middle" fill="#888">404</text><path d="M75,55 L125,95 M125,55 L75,95" stroke="#888" stroke-width="4"/></svg>');
    switch (type) {
        case 1:
        case 2:
            ele.onerror = "";
            if (_iro.missing_avatars != "") {
                ele.src = _iro.missing_avatars;
            } else {
                ele.src = 'https://weavatar.com/avatar/?s=80&d=mm&r=g';
            }
            break;
        default:
            ele.onerror = "";
            if (_iro.missing_images != ""){
                ele.src = _iro.missing_images;
            } else {
                ele.src = svg404;
            }
            break;
    }
}
/*视频feature*/
function coverVideo() {
    let video = document.getElementById("coverVideo"),
        btn_playControl = document.getElementById("cv-pc");

    if (video.paused) {
        video.play();
        try {
            btn_playControl.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } catch { }
        //console.info('play:coverVideo()');
    } else {
        video.pause();
        try {
            btn_playControl.innerHTML = '<i class="fa-solid fa-play"></i>';
        } catch { }
        //console.info('pause:coverVideo()');
    }
}
function coverVideoMute() {
    const video = document.getElementById("coverVideo")
    const btn_volumeControl = document.getElementById("cv-vc");
    if (video.muted) {
        video.muted = false
        btn_volumeControl.innerHTML = '<i class="fa-solid fa-volume-high"></i>'
    } else {
        video.muted = true
        btn_volumeControl.innerHTML = '<i class="fa-solid fa-volume-off"></i>'
    }
}
function killCoverVideo() {
    var video = document.getElementById("coverVideo");
    var btn_playControl = document.getElementById("cv-pc");

    if (video.paused) {
        //console.info('none:killCoverVideo()');
    } else {
        video.pause();
        try {
            btn_playControl.innerHTML = '<i class="fa-solid fa-play"></i>';
        } catch (e) { }
        //console.info('pause:killCoverVideo()');
    }
}

function mail_me() {
    window.open("mailto:" + _iro.email_name + "@" + _iro.email_domain);
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
window.coverVideo = coverVideo
window.coverVideoMute = coverVideoMute
window.killCoverVideo = killCoverVideo
window.mail_me = mail_me
window.headertop_down = headertop_down