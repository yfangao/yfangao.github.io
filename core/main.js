/**
 * core/main.js
 * 专注逻辑：1. 初始化信息 2. 异步加载 Markdown 3. 执行 GSAP 动画
 */

const app = {
    // 页面启动入口
    init() {
        this.renderProfile();
        this.initGlobalEvents();
        
        // 🚀 关键：初始加载 'home'，确保首屏触发动画
        this.switchTab('home'); 
    },

    // 渲染左侧名片信息
    renderProfile() {
        // 渲染基础文本
        const elements = {
            avatar: document.getElementById('js-avatar'),
            name: document.getElementById('js-name'),
            subtitle: document.getElementById('js-subtitle'),
            socials: document.getElementById('js-socials')
        };

        if (elements.avatar) elements.avatar.src = CONFIG.avatar;
        if (elements.name) elements.name.innerText = CONFIG.name;
        if (elements.subtitle) elements.subtitle.innerText = CONFIG.subtitle;

        // 动态生成左侧社交链接按钮
        if (elements.socials && CONFIG.socials) {
            elements.socials.innerHTML = CONFIG.socials.map(item => `
                <a href="${item.url}" class="social-btn" target="_blank">
                    <span class="icon">${item.icon}</span>
                    <span class="label">${item.label}</span>
                </a>
            `).join('');
        }
    },

    /**
     * 核心切换函数
     * @param {string} tabId - 对应 data.js 中的 id (如 'home', 'blog')
     */
    async switchTab(tabId) {
        const target = document.getElementById('render-target');
        const config = CONFIG.menu.find(item => item.id === tabId);
        
        if (!config) return;

        // 1. 更新顶部按钮激活状态 (基于 onclick 属性匹配)
        document.querySelectorAll('.switch-btn').forEach(btn => {
            const isMatch = btn.getAttribute('onclick').includes(`'${tabId}'`);
            btn.classList.toggle('active', isMatch);
        });

        // 2. 执行内容切换动画序列
        // A. 离场：旧内容向下沉并消失
        gsap.to(target, { 
            opacity: 0, 
            y: 20, 
            duration: 0.25, 
            ease: "power2.in",
            onComplete: async () => {
                try {
                    // B. 异步读取文件
                    const response = await fetch(config.file);
                    if (!response.ok) throw new Error(`无法找到文件: ${config.file}`);
                    const markdownText = await response.text();

                    // C. 注入新内容并回到顶部
                    target.innerHTML = `<div class="markdown-body">${marked.parse(markdownText)}</div>`;
                    document.querySelector('.scroll-area').scrollTop = 0;

                    // D. 进场：新内容从下方滑入
                    gsap.fromTo(target, 
                        { opacity: 0, y: 30 }, 
                        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                } catch (error) {
                    console.error(error);
                    target.innerHTML = `<div style="text-align:center; padding:50px; color:#999;">
                        <p>⚠️ 内容加载失败</p>
                        <small>${config.file}</small>
                    </div>`;
                    gsap.to(target, { opacity: 1, y: 0 });
                }
            }
        });
    },

    // 交互动效：按钮点击时的 Q 弹反馈
    initGlobalEvents() {
        const handleScale = (e, scaleValue) => {
            const btn = e.target.closest('.switch-btn, .social-btn');
            if (btn) gsap.to(btn, { scale: scaleValue, duration: 0.2 });
        };

        document.addEventListener('mousedown', (e) => handleScale(e, 0.96));
        document.addEventListener('mouseup', (e) => handleScale(e, 1));
    }
};

// 监听窗口加载
window.onload = () => app.init();