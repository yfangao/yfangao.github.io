const app = {
    init() {
        this.renderProfile();
        this.switchTab('home'); // 初始加载首页
        this.initAnims();
    },

    renderProfile() {
        document.getElementById('js-avatar').src = CONFIG.avatar;
        document.getElementById('js-name').innerText = CONFIG.name;
        document.getElementById('js-subtitle').innerText = CONFIG.subtitle;

        // 社交链接按钮
        const socialsTarget = document.getElementById('js-socials');
        if (socialsTarget && CONFIG.socials) {
            socialsTarget.innerHTML = CONFIG.socials.map(item => `
                <a href="${item.url}" class="social-btn" target="_blank">
                    <span class="icon">${item.icon}</span>
                    <span class="label">${item.label}</span>
                </a>
            `).join('');
        }
    },

    async switchTab(id) {
        const target = document.getElementById('render-target');
        const config = CONFIG.menu.find(m => m.id === id);
        if (!config) return;

        // 1. 更新按钮样式
        document.querySelectorAll('.switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === `btn-${id}`);
        });

        // 2. 切换动画
        gsap.to(target, { opacity: 0, y: 15, duration: 0.2, onComplete: async () => {
            try {
                const response = await fetch(config.file);
                if (!response.ok) throw new Error("File Load Failed");
                const md = await response.text();
                
                target.innerHTML = `<div class="markdown-body">${marked.parse(md)}</div>`;
                
                // 内容进场
                gsap.fromTo(target, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
                document.querySelector('.scroll-area').scrollTop = 0;
            } catch (err) {
                target.innerHTML = `<p style="color:red; text-align:center;">⚠️ 加载失败: ${config.file}</p>`;
                gsap.to(target, { opacity: 1 });
            }
        }});
    },

    initAnims() {
        document.addEventListener('mousedown', (e) => {
            const btn = e.target.closest('.switch-btn');
            if (btn) gsap.to(btn, { scale: 0.95, duration: 0.1 });
        });
        document.addEventListener('mouseup', (e) => {
            const btn = e.target.closest('.switch-btn');
            if (btn) gsap.to(btn, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
            
        });
    }
};

window.onload = () => app.init();