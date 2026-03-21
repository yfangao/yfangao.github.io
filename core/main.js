const app = {
    init() {
        this.renderProfile();
        this.initGlobalEvents();
        
        // 🚀 首页动画修复：延迟一帧执行，确保容器已渲染
        requestAnimationFrame(() => {
            this.switchTab('home');
        });
    },

    renderProfile() {
        document.getElementById('js-avatar').src = CONFIG.avatar;
        document.getElementById('js-name').innerText = CONFIG.name;
        document.getElementById('js-subtitle').innerText = CONFIG.subtitle;

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

        // 1. 按钮高亮逻辑
        document.querySelectorAll('.switch-btn').forEach(btn => {
            const isActive = btn.getAttribute('onclick').includes(`'${id}'`);
            btn.classList.toggle('active', isActive);
        });

        // 2. 动画执行
        // 如果 target 已经有内容，先执行退场
        if (target.innerHTML !== "") {
            await gsap.to(target, { opacity: 0, y: 20, duration: 0.2, ease: "power2.in" });
        }

        try {
            const response = await fetch(config.file);
            const md = await response.text();
            
            // 注入内容
            target.innerHTML = `<div class="markdown-body">${marked.parse(md)}</div>`;
            
            // 重置滚动位置
            document.querySelector('.scroll-area').scrollTop = 0;

            // ✨ 进场动画：从下往上浮现
            gsap.fromTo(target, 
                { opacity: 0, y: 40 }, 
                { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 }
            );
        } catch (err) {
            target.innerHTML = `<p style="text-align:center;padding:40px;">⚠️ 加载失败: ${config.file}</p>`;
            gsap.to(target, { opacity: 1, y: 0 });
        }
    },

    initGlobalEvents() {
        const handleScale = (e, val) => {
            const btn = e.target.closest('.switch-btn, .social-btn');
            if (btn) gsap.to(btn, { scale: val, duration: 0.2 });
        };
        document.addEventListener('mousedown', (e) => handleScale(e, 0.96));
        document.addEventListener('mouseup', (e) => handleScale(e, 1));
    }
};

window.onload = () => app.init();