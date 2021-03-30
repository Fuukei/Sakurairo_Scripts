/**
 * sakura-app.js L224-309
 */
 function attach_image() {
    let cached = document.getElementsByClassName("insert-image-tips")[0],
        upload_img = document.getElementById('upload-img-file');
    upload_img?.addEventListener("change", (function () {
        if (this.files.length > 10) {
            addComment.createButterbar("每次上传上限为10张.<br>10 files max per request.");
            return 0;
        }
        for (let i = 0; i < this.files.length; i++) {
            if (this.files[i].size >= 5242880) {
                alert('图片上传大小限制为5 MB.\n5 MB max per file.\n\n「' + this.files[i].name + '」\n\n这张图太大啦~请重新上传噢！\nThis image is too large~Please reupload!');
                return;
            }
        }
        for (let i = 0; i < this.files.length; i++) {
            let f = this.files[i],
                formData = new FormData(),
                xhr = new XMLHttpRequest();
            formData.append('cmt_img_file', f);
            xhr.addEventListener('loadstart', function () {
                cached.innerHTML = '<i class="fa fa-spinner rotating" aria-hidden="true"></i>';
                addComment.createButterbar("上传中...<br>Uploading...");
            });
            xhr.open("POST", Poi.api + 'sakura/v1/image/upload?_wpnonce=' + Poi.nonce, true);
            xhr.send(formData);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 304)) {
                    cached.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
                    setTimeout(function () {
                        cached.innerHTML = '<i class="fa fa-picture-o" aria-hidden="true"></i>';
                    }, 1000);
                    let res = JSON.parse(xhr.responseText);
                    if (res.status == 200) {
                        let get_the_url = res.proxy;
                        document.getElementById("upload-img-show").insertAdjacentHTML('afterend', '<img class="lazyload upload-image-preview" src="https://cdn.jsdelivr.net/gh/Fuukei/Public_Repository@latest/vision/theme/colorful/load/inload.svg" data-src="' + get_the_url + '" onclick="window.open(\'' + get_the_url + '\')" onerror="imgError(this)" />');
                        lazyload();
                        addComment.createButterbar("图片上传成功~<br>Uploaded successfully~");
                        grin(get_the_url, type = 'Img');
                    } else {
                        addComment.createButterbar("上传失败！<br>Uploaded failed!<br> 文件名/Filename: " + f.name + "<br>code: " + res.status + "<br>" + res.message, 3000);
                    }
                } else if (xhr.readyState == 4) {
                    cached.innerHTML = '<i class="fa fa-times" aria-hidden="true" style="color:red"></i>';
                    alert("上传失败，请重试.\nUpload failed, please try again.");
                    setTimeout(function () {
                        cached.innerHTML = '<i class="fa fa-picture-o" aria-hidden="true"></i>';
                    }, 1000);
                }
            }
        };
    }));
}


function clean_upload_images() {
    document.getElementById("upload-img-show").innerHTML = '';
}

function add_upload_tips() {
    let form_subit = document.querySelector('.form-submit #submit');
    if (form_subit == null) return;
    form_subit.insertAdjacentHTML('afterend', '<div class="insert-image-tips popup"><i class="fa fa-picture-o" aria-hidden="true"></i><span class="insert-img-popuptext" id="uploadTipPopup">上传图片</span></div><input id="upload-img-file" type="file" accept="image/*" multiple="multiple" class="insert-image-button">');
    attach_image();
    let file_subit = document.getElementById('upload-img-file'),
        hover = document.getElementsByClassName('insert-image-tips')[0],
        Tip = document.getElementById('uploadTipPopup');
    file_subit?.addEventListener("mouseenter", function () {
        hover.classList.toggle('insert-image-tips-hover');
        Tip.classList.toggle('show');
    });
    file_subit?.addEventListener("mouseleave", function () {
        hover.classList.toggle('insert-image-tips-hover');
        Tip.classList.toggle('show');
    });
}

function click_to_view_image() {
    let comment_inline = document.getElementsByClassName('comment_inline_img');
    if (comment_inline.length == 0) return;
    document.getElementsByClassName("comments-main")[0]?.addEventListener("click", function (e) {
        if (e.target.classList.contains("comment_inline_img")) {
            let temp_url = e.target.src;
            window.open(temp_url);
        }
    })
}
