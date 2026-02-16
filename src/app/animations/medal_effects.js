import { animateModalState, loadAnime } from './anime_runtime'

let animePromise = null

function getAnime() {
    if (!animePromise) {
        animePromise = loadAnime().catch((error) => {
            animePromise = null
            throw error
        })
    }
    return animePromise
}

function runAnime(targets, params) {
    void getAnime().then((anime) => {
        anime.remove(targets)
        anime.animate(targets, params)
    }).catch(() => void 0)
}

export default function init_medal_effects() {
    document.addEventListener('DOMContentLoaded', async () =>{await init_medal_effects_main()});
    document.addEventListener('pjax:complete', async () =>{await init_medal_effects_main()});
}

// 初始化函数：同时支持DOMContentLoaded和PJAX加载情况
async function init_medal_effects_main() {
    try {
        document.documentElement.style.overflowY = 'unset';
        setTimeout(function(){
            initMedalEffects();
            initParallaxEffect();
            addShineEffect();
        }, 0) // 恢复到默认的0延迟
    } catch (e) {
        console.error('Medal effects initialization error:', e);
    }
}

function initMedalEffects() {
    const medals = document.querySelectorAll('.medal-capsule');
    
    if (!medals.length) return;
      // 初始化每个徽章
    medals.forEach(medal => {
        // 创建粒子效果
        createParticles(medal);
        
        // 添加点击事件，显示成就详细信息
        medal.addEventListener('click', function() {
            showMedalDetails(this);
            document.documentElement.style.overflow = 'hidden';
        });
    });
}

// 创建粒子效果
function createParticles(medal) {
    const container = medal.querySelector('.medal-particles');
    if (!container) return;

    if (container.dataset.iroParticleInit === '1') return;
    container.dataset.iroParticleInit = '1'
    
    const medalType = medal.getAttribute('data-medal-level') || 'bronze';
    let particleColor;
    
    // 根据徽章类型设置粒子颜色
    switch(medalType) {
        case 'gold':
            particleColor = 'rgba(255, 215, 0, 0.8)';
            break;
        case 'silver':
            particleColor = 'rgba(192, 192, 192, 0.8)';
            break;
        case 'bronze':
        default:
            particleColor = 'rgba(205, 127, 50, 0.8)';
            break;
    }
    
    // 创建10-15个粒子
    const particleCount = 10 + Math.floor(Math.random() * 5);
    const particles = []
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'medal-particle';
        
        // 设置粒子样式
        Object.assign(particle.style, {
            position: 'absolute',
            width: (2 + Math.random() * 3) + 'px',
            height: (2 + Math.random() * 3) + 'px',
            background: particleColor,
            borderRadius: '50%',
            opacity: 0.3 + Math.random() * 0.7,
            top: Math.random() * 100 + '%',
            left: Math.random() * 100 + '%',
            pointerEvents: 'none',
            boxShadow: '0 0 3px ' + particleColor
        });
        
        container.appendChild(particle);
        particles.push(particle)
    }
        
    // 设置粒子悬浮动画
    medal.addEventListener('mouseenter', () => {
        runAnime(particles, {
            translateX: () => -20 + Math.random() * 40,
            translateY: () => -20 + Math.random() * 40,
            opacity: () => 0.1 + Math.random() * 0.5,
            scale: () => 0.92 + Math.random() * 0.2,
            duration: () => 900 + Math.random() * 1100,
            delay: () => Math.random() * 120,
            easing: 'easeOutCubic',
        })
    });

    medal.addEventListener('mouseleave', () => {
        runAnime(particles, {
            translateX: 0,
            translateY: 0,
            opacity: () => 0.3 + Math.random() * 0.7,
            scale: 1,
            duration: 820,
            delay: () => Math.random() * 80,
            easing: 'easeOutQuad',
        });
    });
}

// 显示徽章详细信息的交互
function showMedalDetails(medal) {
    // 获取徽章数据
    const medalType = medal.getAttribute('data-medal-type');
    const medalLevel = medal.getAttribute('data-medal-level');
    const achievement = medal.getAttribute('data-achievement');
    const nextLevel = medal.getAttribute('data-next-level');
    const progress = medal.getAttribute('data-progress');
    
    // 给徽章一个"按下"的视觉反馈
    runAnime(medal, {
        scale: [1, 0.98, 1],
        duration: 220,
        easing: 'easeOutQuad',
    })
    
    // 如果目标浏览器支持，添加触觉反馈
    if ('vibrate' in navigator) {
        navigator.vibrate(30);
    }
    
    // 检查是否已存在模态框，如果存在则移除
    let existingModal = document.getElementById('medal-detail-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.id = 'medal-detail-modal';
    modal.className = 'medal-detail-modal ' + medalLevel;
    
    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'medal-modal-content';
    
    // 添加徽章图标
    const medalIcon = document.createElement('div');
    medalIcon.className = 'modal-medal-icon';
    medalIcon.innerHTML = '<i class="fa-solid fa-medal"></i>';
    // 添加标题和成就描述
    const medalTitle = document.createElement('div');
    medalTitle.className = 'modal-medal-title';
    
    // 添加标题内容
    medalTitle.innerHTML = `
        <h2>${medal.querySelector('.capsule-label').textContent}</h2>
    `;
    // 添加成就描述
    const achievementElem = document.createElement('div');
    achievementElem.className = 'modal-medal-achievement';
    
    // 使用PHP传递的achievement内容
    achievementElem.textContent = achievement || '';
    
    // 添加进度信息
    const progressContainer = document.createElement('div');
    progressContainer.className = 'modal-medal-progress-container';
      if (progress && progress < 100) {
        const roundedProgress = Math.round(progress);
        progressContainer.innerHTML = `
            <div class="modal-medal-progress">
                <div class="modal-medal-progress-bar" style="width: ${progress}%"></div>
                <span class="progress-percentage">${roundedProgress}%</span>
            </div>
            <div class="modal-medal-next-level">${nextLevel || ''}</div>
        `;    } else if (medalLevel === 'gold') {
            let text = 'Maximum level reached';
            switch (_iro.language) {
                case "zh_CN":
                    text = "已达到最高等级";
                    break;
                case "zh_TW":
                    text = "已達最高等級";
                    break;
                case "ja":
                    text = "最大レベルに到達";
                    break;
                case "fr":
                    text = "Niveau maximum atteint";
                    break;
                default:
                    text = 'Maximum level reached';
                    break;
            }
        progressContainer.innerHTML = `
            <div class="modal-medal-max-level">${text}</div>
        `;
    }
    
    // 添加粒子效果背景
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'modal-particles-container';
    
    // 组装模态框
    modalContent.appendChild(medalIcon);
    modalContent.appendChild(medalTitle);
    modalContent.appendChild(achievementElem);
    modalContent.appendChild(progressContainer);
    
    modal.appendChild(particlesContainer);
    modal.appendChild(modalContent);
    
    // 添加关闭按钮
    const closeButton = document.createElement('button');
    closeButton.className = 'modal-close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = function() {
        closeModal(modal);
    };
    modalContent.appendChild(closeButton);
    
    // 添加到页面
    document.body.appendChild(modal);
    
    // 创建模态框背景粒子
    createModalParticles(particlesContainer, medalLevel);
    
    // 动画显示模态框
    setTimeout(() => {
        modal.classList.add('active');
        void animateModalState(modal, true)
    }, 10);
    
    // 点击模态框外部关闭
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
}

// 关闭模态框
async function closeModal(modal) {
    modal.classList.remove('active');
    modal.classList.add('closing');
    document.documentElement.style.overflowY = 'unset';
    await animateModalState(modal, false)
    modal.remove();
}

// 为模态框创建粒子效果
function createModalParticles(container, medalType) {
    let particleColor;
    let particleCount = 20;
    
    switch(medalType) {
        case 'gold':
            particleColor = 'rgba(255, 215, 0, 0.8)';
            particleCount = 30; // 金牌特殊效果，更多粒子
            break;
        case 'silver':
            particleColor = 'rgba(192, 192, 192, 0.8)';
            break;
        case 'bronze':
        default:
            particleColor = 'rgba(205, 127, 50, 0.8)';
            break;
    }

    void getAnime().then((anime) => {
        const particleNodes = []
    
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('span');
            particle.className = 'modal-particle';

            const size = 3 + Math.random() * 5;
            const xMove = -20 + Math.random() * 40;
            const yMove = -20 + Math.random() * 40;

            Object.assign(particle.style, {
                position: 'absolute',
                width: size + 'px',
                height: size + 'px',
                background: particleColor,
                borderRadius: '50%',
                opacity: 0.1 + Math.random() * 0.5,
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                boxShadow: '0 0 ' + (size / 2) + 'px ' + particleColor,
                pointerEvents: 'none',
            });

            container.appendChild(particle);
            particleNodes.push({ particle, xMove, yMove })
        }

        for (const { particle, xMove, yMove } of particleNodes) {
            anime.animate(particle, {
                translateX: [0, xMove],
                translateY: [0, yMove],
                opacity: [particle.style.opacity || 0.3, 0.7, 0.2],
                duration: 3000 + Math.random() * 5000,
                delay: -Math.random() * 5000,
                easing: 'easeInOutSine',
                direction: 'alternate',
                loop: true,
            })
        }
    }).catch(() => void 0)
}

// 初始化视差效果
function initParallaxEffect() {
    const medals = document.querySelectorAll('.medal-capsule');

    void getAnime().then((anime) => {
        medals.forEach(medal => {
            medal.style.transform = 'perspective(1000px)';
            medal.style.transformStyle = 'preserve-3d';

            const icon = medal.querySelector('i');
            const content = medal.querySelector('.capsule-content');
            const particles = medal.querySelector('.medal-particles');

            medal.addEventListener('mousemove', function (e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;

                anime.remove(this)
                anime.animate(this, {
                    rotateY: deltaX * 5,
                    rotateX: -deltaY * 5,
                    scale: 1.05,
                    duration: 120,
                    easing: 'easeOutQuad',
                })

                if (icon) {
                    anime.remove(icon)
                    anime.animate(icon, {
                        translateX: deltaX * 6,
                        translateY: deltaY * 4,
                        duration: 130,
                        easing: 'easeOutQuad',
                    })
                }

                if (content) {
                    anime.remove(content)
                    anime.animate(content, {
                        translateX: deltaX * 3,
                        translateY: deltaY * 2,
                        duration: 130,
                        easing: 'easeOutQuad',
                    })
                }

                if (particles) {
                    anime.remove(particles)
                    anime.animate(particles, {
                        translateX: -deltaX * 2,
                        translateY: -deltaY * 2,
                        duration: 130,
                        easing: 'easeOutQuad',
                    })
                }
            });

            medal.addEventListener('mouseleave', function () {
                anime.animate(this, {
                    rotateY: 0,
                    rotateX: 0,
                    scale: 1,
                    duration: 260,
                    easing: 'easeOutCubic',
                })
                if (icon) {
                    anime.animate(icon, {
                        translateX: 0,
                        translateY: 0,
                        duration: 260,
                        easing: 'easeOutCubic',
                    })
                }
                if (content) {
                    anime.animate(content, {
                        translateX: 0,
                        translateY: 0,
                        duration: 260,
                        easing: 'easeOutCubic',
                    })
                }
                if (particles) {
                    anime.animate(particles, {
                        translateX: 0,
                        translateY: 0,
                        duration: 260,
                        easing: 'easeOutCubic',
                    })
                }
            });
        });
    }).catch(() => void 0)
}

// 为徽章添加自然光效果
function addShineEffect() {
    // 检查是否为 Safari 浏览器
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // Safari 浏览器不支持某些特定效果，直接退出函数
    if (isSafari) {
        console.log('Safari browser detected, disabling medal shine effects for compatibility');
        return; // 在 Safari 浏览器中不启用光效
    }
    
    const goldMedals = document.querySelectorAll('.medal-capsule.gold');
    const supportsMixBlendMode = window.CSS && CSS.supports && CSS.supports('mix-blend-mode', 'multiply');

    if (!supportsMixBlendMode) {
        console.log('Browser does not support required CSS features for medal effects');
        return;
    }

    void getAnime().then((anime) => {
        goldMedals.forEach(medal => {
            if (window.getComputedStyle(medal).position === 'static') {
                medal.style.position = 'relative';
            }

            const existingEffects = medal.querySelectorAll('.medal-shine, .medal-ambient, .medal-glow, .medal-fleck, .medal-pulse');
            existingEffects.forEach(effect => effect.remove());

            const ambient = document.createElement('div');
            ambient.className = 'medal-ambient';
            Object.assign(ambient.style, {
                position: 'absolute',
                top: '-20%',
                left: '-20%',
                width: '140%',
                height: '140%',
                background: 'radial-gradient(circle at 30% 30%, rgba(255,236,150,0.75) 0%, rgba(255,220,100,0.35) 35%, rgba(255,215,0,0.15) 65%, rgba(255,215,0,0) 80%)',
                borderRadius: 'inherit',
                pointerEvents: 'none',
                zIndex: '2',
                mixBlendMode: 'color-dodge',
                opacity: '0.75',
            });
            medal.appendChild(ambient);

            anime.animate(ambient, {
                opacity: [0.45, 0.78, 0.55, 0.82, 0.45],
                scale: [1, 1.08, 1.03, 1.1, 1],
                duration: 9000,
                easing: 'easeInOutSine',
                loop: true,
            })

            const fleckPositions = [
                { top: '25%', left: '20%', size: '15%' },
                { top: '65%', left: '70%', size: '13%' },
            ];

            const flecks = []
            fleckPositions.forEach((pos, i) => {
                const fleck = document.createElement('div');
                fleck.className = 'medal-fleck';
                Object.assign(fleck.style, {
                    position: 'absolute',
                    top: pos.top,
                    left: pos.left,
                    width: pos.size,
                    height: pos.size,
                    borderRadius: '50%',
                    background: 'radial-gradient(ellipse at center, rgba(255,255,220,0.9) 0%, rgba(255,255,200,0.4) 40%, rgba(255,255,200,0) 100%)',
                    pointerEvents: 'none',
                    zIndex: '3',
                    filter: 'blur(1.8px)',
                    opacity: '0.75',
                    mixBlendMode: 'lighten',
                    boxShadow: '0 0 10px rgba(255, 255, 200, 0.45)',
                });
                medal.appendChild(fleck);
                flecks.push(fleck)

                anime.animate(fleck, {
                    opacity: [0.4, 0.75, 0.45, 0.7, 0.4],
                    scale: [1, 1.04, 0.98, 1.03, 1],
                    duration: 7000 + i * 2000,
                    easing: 'easeInOutSine',
                    loop: true,
                })
            });

            if (!medal.style.boxShadow) {
                medal.style.boxShadow = 'inset 0 0 20px rgba(255, 215, 0, 0.55), 0 7px 15px rgba(0, 0, 0, 0.2)';
            }

            const pulseEffect = document.createElement('div');
            pulseEffect.className = 'medal-pulse';
            Object.assign(pulseEffect.style, {
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '120%',
                height: '120%',
                borderRadius: 'inherit',
                background: 'radial-gradient(circle at 35% 35%, rgba(255,236,150,0.2) 0%, rgba(255,215,0,0.1) 60%, rgba(255,215,0,0) 85%)',
                pointerEvents: 'none',
                zIndex: '1',
                mixBlendMode: 'screen',
                opacity: '0.75',
                filter: 'blur(4px)',
            });
            medal.appendChild(pulseEffect);

            anime.animate(pulseEffect, {
                scale: [1, 1.04, 1.06, 1.03, 1],
                opacity: [0.6, 0.72, 0.82, 0.68, 0.6],
                duration: 5000,
                easing: 'easeInOutSine',
                loop: true,
            })

            medal.addEventListener('mousemove', (e) => {
                const rect = medal.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPercent = Math.round((x / rect.width) * 100);
                const yPercent = Math.round((y / rect.height) * 100);

                ambient.style.background = `radial-gradient(circle at ${xPercent}% ${yPercent}%, rgba(255,246,180,0.9) 0%, rgba(255,226,100,0.45) 30%, rgba(255,215,0,0.2) 60%, rgba(255,215,0,0) 85%)`;

                anime.remove(ambient)
                anime.animate(ambient, {
                    scale: 1.15,
                    translateX: (xPercent - 50) / 2,
                    translateY: (yPercent - 50) / 2,
                    duration: 180,
                    easing: 'easeOutQuad',
                })

                flecks.forEach((fleck, idx) => {
                    const xFactor = idx === 0 ? 0.05 : 0.03;
                    const yFactor = idx === 0 ? 0.02 : 0.04;
                    anime.remove(fleck)
                    anime.animate(fleck, {
                        translateX: (xPercent - 50) * xFactor,
                        translateY: (yPercent - 50) * yFactor,
                        duration: 200,
                        easing: 'easeOutQuad',
                    })
                });
            });

            medal.addEventListener('mouseleave', () => {
                ambient.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,236,150,0.75) 0%, rgba(255,220,100,0.35) 35%, rgba(255,215,0,0.15) 65%, rgba(255,215,0,0) 80%)';
                anime.animate(ambient, {
                    scale: 1,
                    translateX: 0,
                    translateY: 0,
                    duration: 280,
                    easing: 'easeOutCubic',
                })
                flecks.forEach((fleck) => {
                    anime.animate(fleck, {
                        translateX: 0,
                        translateY: 0,
                        duration: 280,
                        easing: 'easeOutCubic',
                    })
                });
            });
        });
    }).catch(() => void 0)
}