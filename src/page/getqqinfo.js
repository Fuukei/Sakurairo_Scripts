import buildAPI from '../common/api'
import {get_gravatar} from './gravatar'

export default function getqqinfo() {
    let is_get_by_qq = false;
    const i_author = document.querySelector("input#author"),
        i_qq = document.querySelector("input#qq"),
        i_email = document.querySelector("input#email"),
        i_url = document.querySelector("input#url"),
        qq_check = document.querySelector(".qq-check"),
        gravatar_check = document.querySelector(".gravatar-check"),
        user_avatar_img = document.querySelector("div.comment-user-avatar img");
    if (i_author == null) return;
    if (!localStorage.getItem('user_qq') && !localStorage.getItem('user_qq_email') && !localStorage.getItem('user_author')) {
        i_qq.value = i_author.value = i_email.value = i_url.value = "";
    }
    if (localStorage.getItem('user_avatar') && localStorage.getItem('user_qq') && localStorage.getItem('user_qq_email')) {
        user_avatar_img.setAttribute('src', localStorage.getItem('user_avatar'));
        i_author.value = localStorage.getItem('user_author');
        i_email.value = localStorage.getItem('user_qq') + '@qq.com';
        i_qq.value = localStorage.getItem('user_qq');
        if (mashiro_option.qzone_autocomplete) {
            i_url.value = 'https://user.qzone.qq.com/' + localStorage.getItem('user_qq');
        }
        if (i_qq.value) {
            qq_check.style.display = "block";
            gravatar_check.style.display = "none";
        }
    }
    let emailAddressFlag = i_email.value;
    //var emailAddressFlag = cached.filter('#email').val();
    i_author.addEventListener('blur', () => {
        // })
        //cached.filter('#author').on('blur', function () {
        const qq = i_author.value,
            reg_QQ = /^[1-9]\d{4,9}$/;
        if (reg_QQ.test(qq)) {
            const whileFailed = () => {
                i_qq.value = '';
                qq_check.style.display = 'none';
                gravatar_check.style.display = 'block';
                user_avatar_img.setAttribute('src', get_gravatar(i_email.value, 80));
                localStorage.setItem('user_qq', '');
                localStorage.setItem('user_email', i_email.value);
                localStorage.setItem('user_avatar', get_gravatar(i_email.value, 80));
                /***/
                /*         qq.value = email.value = url.value = "";
                        if (!qq.value) {
                            qq_check.style.display = 'none';
                            gravatar_check.style.display = 'block';
                            setCookie('user_qq', '', 30);
                            user_avatar_img.setAttribute('src', get_gravatar(email.value, 80));
                            setCookie('user_avatar', get_gravatar(email.value, 80), 30);
                        } */
            }
            fetch(buildAPI(mashiro_option.qq_api_url, { qq: qq }))
                .then(async resp => {
                    if (resp.ok) {
                        //success
                        try {
                            const data = await resp.json()
                            i_author.value = data.name;
                            i_email.value = qq.trim() + '@qq.com';
                            if (mashiro_option.qzone_autocomplete) {
                                i_url.value = 'https://user.qzone.qq.com/' + qq.trim();
                            }
                            user_avatar_img.setAttribute('src', 'https://q2.qlogo.cn/headimg_dl?dst_uin=' + qq + '&spec=100');
                            is_get_by_qq = true;
                            i_qq.value = qq.trim();
                            if (i_qq.value) {
                                qq_check.style.display = 'block';
                                gravatar_check.style.display = 'none';
                            }
                            localStorage.setItem('user_author', data.name);
                            localStorage.setItem('user_qq', qq);
                            localStorage.setItem('is_user_qq', 'yes');
                            localStorage.setItem('user_qq_email', qq + '@qq.com');
                            localStorage.setItem('user_email', qq + '@qq.com');
                            emailAddressFlag = i_email.value;
                            /***/
                            user_avatar_img.setAttribute('src', data.avatar);
                            localStorage.setItem('user_avatar', data.avatar);
                        } catch (e) {
                            console.warn(e)
                            whileFailed()
                        }
                    } else {
                        whileFailed()
                    }
                })
        }
    });
    if (localStorage.getItem('user_avatar') && localStorage.getItem('user_email') && localStorage.getItem('is_user_qq') == 'no' && !localStorage.getItem('user_qq_email')) {
        user_avatar_img.setAttribute("src", localStorage.getItem('user_avatar'));
        i_email.value = localStorage.getItem('user_mail');
        i_qq.value = '';
        if (!i_qq.value) {
            qq_check.style.display = "none";
            gravatar_check.style.display = "block";
        }
        // $('div.comment-user-avatar img').attr('src', getCookie('user_avatar'));
        // cached.filter('#email').val(getCookie('user_email'));
        // cached.filter('#qq').val('');
        // if (!cached.filter('#qq').val()) {
        //     $('.qq-check').css('display', 'none');
        //     $('.gravatar-check').css('display', 'block');
        // }
    }
    i_email.addEventListener("blur", function () {
        //cached.filter('#email').on('blur', function () {
        let emailAddress = i_email.value;
        // var emailAddress = cached.filter('#email').val();
        if ((is_get_by_qq == false || emailAddressFlag != emailAddress) && emailAddress != '') {
            user_avatar_img.setAttribute("src", get_gravatar(emailAddress, 80));
            //$('div.comment-user-avatar img').attr('src', get_gravatar(emailAddress, 80));
            localStorage.setItem('user_avatar', get_gravatar(emailAddress, 80));
            localStorage.setItem('user_email', emailAddress);
            localStorage.setItem('user_qq_email', '');
            localStorage.setItem('is_user_qq', 'no');
            i_qq.value = '';
            // cached.filter('#qq').val('');
            if (!i_qq.value) {
                qq_check.style.display = "none";
                gravatar_check.style.display = "block";
                // $('.qq-check').css('display', 'none');
                // $('.gravatar-check').css('display', 'block');
            }
        }
    });
    if (localStorage.getItem('user_url')) {
        i_url.value = localStorage.getItem("user_url");
        // cached.filter('#url').val(getCookie('user_url'));
    }
    i_url.addEventListener("blur", function () {
        //cached.filter('#url').on('blur', function () {
        let URL_Address = i_url.value;
        i_url.value = URL_Address;
        // var URL_Address = cached.filter('#url').val();
        // cached.filter('#url').val(URL_Address);
        localStorage.setItem('user_url', URL_Address);
    });
    if (localStorage.getItem('user_author')) {
        i_author.value = localStorage.getItem('user_author');
        // cached.filter('#author').val(getCookie('user_author'));
    }
    i_author.addEventListener("blur", function () {
        // cached.filter('#author').on('blur', function () {
        let user_name = i_author.value;
        i_author.value = user_name;
        // var user_name = cached.filter('#author').val();
        // cached.filter('#author').val(user_name);
        localStorage.setItem('user_author', user_name);
    });
}