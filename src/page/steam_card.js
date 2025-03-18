// 存储原始样式值
let defaultStyles = {
    profile: {
        display: 'block'
    },
    header: {
        minWidth: '',
        margin: '',
        background: '',
        borderBottom: '1px solid rgba(232, 232, 232, 0.8)',
        padding: '16px'
    },
    username: {
        fontSize: '18px'
    },
    avatar: {
        width: '64px',
        height: '64px'
    }
}

export default function init_steamCard() {
    let steamProfiles = document.querySelectorAll('.steam-profile');
    if (!steamProfiles) {
        resize_SteamCard(false);
        return;
    } else {
        applySteamProfileStyles();
        resize_SteamCard(true);
    }
}

// 应用Steam个人资料样式的函数
function applySteamProfileStyles() {
    let steamProfiles = document.querySelectorAll('.steam-profile');

    steamProfiles.forEach(profile => {
        // 获取所有需要操作的元素
        let gameInfo = profile.querySelector('.steam-game-info');
        let profileHeader = profile.querySelector('.steam-profile-header');
        let username = profile.querySelector('.steam-username');
        
        // 检查是否满足应用样式的条件
        let shouldApplyStyles = profile.offsetWidth > 700 && gameInfo;
        
        if (shouldApplyStyles) {
            // 应用增强样式
            profile.style.display = 'flex';
            
            if (profileHeader) {
                profileHeader.style.minWidth = '50%';
                profileHeader.style.margin = '0 auto';
                profileHeader.style.background = 'none';
                profileHeader.style.borderBottom = 'unset';
                profileHeader.style.padding = '24px';
            }

            if (username) {
                username.style.fontSize = '30px';
            }
        } else {
            // 重置为默认样式
            profile.style.display = defaultStyles.profile.display;
            
            if (profileHeader) {
                profileHeader.style.minWidth = defaultStyles.header.minWidth;
                profileHeader.style.margin = defaultStyles.header.margin;
                profileHeader.style.background = defaultStyles.header.background;
                profileHeader.style.borderBottom = defaultStyles.header.borderBottom;
                profileHeader.style.padding = defaultStyles.header.padding;
            }

            if (username) {
                username.style.fontSize = defaultStyles.username.fontSize;
            }

        }
    });
}

// 监听窗口大小变化，使用防抖
function resize_SteamCard (init = false) {
    let resizeTimer;
    function resizeCard() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(applySteamProfileStyles, 250);
    };
    if (init) {
        window.addEventListener('resize', resizeCard);
    } else {
        window.removeEventListener('resize', resizeCard);
    }
}
    