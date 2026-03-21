/**
 * core/main.js
 * 核心逻辑：负责数据渲染、外部Markdown加载、以及GSAP动画交互
 */

const app = {
    init() {
        this.renderSidebar();
        this.switchTab('home'); 
        this.initGlobalEvents();
    },

    renderSidebar() {
        const avatarEl = document.getElementById('js-avatar');
        const nameEl = document.getElementById('js-name');
        const subtitleEl = document.getElementById('js-subtitle');
        const menuContainer = document.getElementById('js-menu');

        if (avatarEl) avatarEl.src = CONFIG.avatar;
        if (nameEl) nameEl.innerText = CONFIG.name;
        if (subtitleEl) subtitleEl.innerText = CONFIG.subtitle;

        // 动态生成菜单
        const menuHtml = CONFIG.menu.map(item => `
            <div class="nav-item" id="nav-${item.id}" onclick="app.switchTab('${item.id}')">
                <span class="nav-icon">${item.icon}</span> 
                <span class="nav-label">${item.label}</span>
            </div>
        `).join('');
        
        if (menuContainer) menuContainer.innerHTML = menuHtml;
    },

    /**
     * 核心切换逻辑
     * @param {string} tabId - 对应 CONFIG.menu 中的 id (如 'home', 'blog')
     */
    async switchTab(tabId) {
        const target = document.getElementById('render-target');
        const menuItem = CONFIG.menu.find(m => m.id === tabId);
        
        // 如果找不到配置，默认尝试读取根目录的 resume.md
        const filePath = menuItem ? menuItem.file : 'resume.md';

        // --- 1. 离场动画 ---
        gsap.to(target, { 
            opacity: 0, 
            y: 20, 
            duration: 0.2, 
            ease: "power2.in",
            onComplete: async () => {
                try {
                    // --- 2. 异步获取外部 Markdown 文件 ---
                    const response = await fetch(filePath);
                    if (!response.ok) throw new Error(`无法读取文件: ${filePath}`);
                    const rawMarkdown = await response.text();

                    // --- 3. 转换 Markdown 并注入 HTML ---
                    // 使用 marked.parse 将纯文本转为 HTML，并包裹在 .markdown-body 中
                    target.innerHTML = `<div class="markdown-body">${marked.parse(rawMarkdown)}</div>`;

                    // 重置滚动条到顶部
                    document.querySelector('.scroll-area').scrollTop = 0;

                    // --- 4. 进场动画 ---
                    gsap.fromTo(target, 
                        { opacity: 0, y: 40 }, 
                        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
                    );
                } catch (err) {
                    console.error(err);
                    target.innerHTML = `<div class="error-msg">⚠️ 内容加载失败: ${err.message}</div>`;
                    gsap.to(target, { opacity: 1, y: 0 });
                }
            }
        });

        // --- 5. UI 状态更新：切换按钮激活样式 ---
        this.updateUIStatus(tabId);
    },

    // 更新按钮和菜单的选中状态
    updateUIStatus(tabId) {
        // 更新顶部切换按钮 (针对 首页/博文 两个大分类)
        const topBtns = document.querySelectorAll('.switch-btn');
        topBtns.forEach(btn => {
            const isHome = tabId === 'home' && (btn.innerText.includes('首页') || btn.innerText.includes('Resume'));
            const isBlog = tabId === 'blog' && (btn.innerText.includes('博文') || btn.innerText.includes('Blog'));
            btn.classList.toggle('active', isHome || isBlog);
        });

        // 更新左侧菜单项
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.id === `nav-${tabId}`);
        });
    },

    // 初始化全局交互（Q弹效果等）
    initGlobalEvents() {
        // 点击时的缩放反馈（Q弹感）
        document.addEventListener('mousedown', (e) => {
            const el = e.target.closest('.nav-item, .switch-btn');
            if (el) gsap.to(el, { scale: 0.94, duration: 0.1 });
        });

        document.addEventListener('mouseup', (e) => {
            const el = e.target.closest('.nav-item, .switch-btn');
            if (el) gsap.to(el, { 
                scale: 1, 
                duration: 0.4, 
                ease: "elastic.out(1.2, 0.5)" 
            });
        });
    }
};

// 页面加载完成后启动
window.onload = () => app.init();