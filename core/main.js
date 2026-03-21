// core/main.js
const app = {
    init() {
        this.renderBasicInfo();
        this.switchTab('home'); // 默认加载首页
        this.initGlobalEvents();
    },

    // 渲染左侧头像、名字等
    renderBasicInfo() {
        document.getElementById('js-avatar').src = CONFIG.avatar;
        document.getElementById('js-name').innerText = CONFIG.name;
        document.getElementById('js-subtitle').innerText = CONFIG.subtitle;
    },

    async switchTab(type) {
        const target = document.getElementById('render-target');
        
        // 1. 按钮状态切换
        document.querySelectorAll('.switch-btn').forEach(btn => {
            const isTarget = (type === 'home' && btn.innerText.includes('首页')) || 
                             (type === 'blog' && btn.innerText.includes('文章'));
            btn.classList.toggle('active', isTarget);
        });

        // 2. 找到对应的文件路径 (从 CONFIG.menu 中找)
        const menuItem = CONFIG.menu.find(m => m.id === type);
        if (!menuItem) return;

        // 3. 执行切换动画
        gsap.to(target, { opacity: 0, y: 10, duration: 0.2, onComplete: async () => {
            try {
                // 读取外部 Markdown 文件
                const response = await fetch(menuItem.file);
                if (!response.ok) throw new Error("文件加载失败");
                const text = await response.text();
                
                // 渲染内容
                target.innerHTML = `<div class="markdown-body">${marked.parse(text)}</div>`;
                
                // 滚动回到内容顶部
                document.querySelector('.scroll-area').scrollTop = 0;
                
                // 入场动画
                gsap.fromTo(target, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            } catch (err) {
                target.innerHTML = `<p style="color:red; text-align:center;">⚠️ 加载失败: ${menuItem.file}</p>`;
                gsap.to(target, { opacity: 1 });
            }
        }});
    },

    initGlobalEvents() {
        // 全局交互缩放反馈
        document.addEventListener('mousedown', (e) => {
            if (e.target.closest('.switch-btn')) gsap.to(e.target.closest('.switch-btn'), { scale: 0.95, duration: 0.1 });
        });
        document.addEventListener('mouseup', (e) => {
            if (e.target.closest('.switch-btn')) gsap.to(e.target.closest('.switch-btn'), { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
        });
    }
};

window.onload = () => app.init();