// core/main.js
const app = {
    init() {
        this.renderProfile();
        this.switchTab('home'); // 初始加载
        this.initAnims();
    },

    renderProfile() {
        // 1. 渲染基础信息
        document.getElementById('js-avatar').src = CONFIG.avatar;
        document.getElementById('js-name').innerText = CONFIG.name;
        document.getElementById('js-subtitle').innerText = CONFIG.subtitle;

        // 2. 渲染社交链接 (这一步没生效就是按钮不显示的原因)
        const socialsTarget = document.getElementById('js-socials');
        
        // 调试：如果控制台没打印下面这行，说明逻辑没跑到这里
        console.log("正在尝试渲染社交按钮...", CONFIG.socials); 

        if (socialsTarget && CONFIG.socials) {
            socialsTarget.innerHTML = CONFIG.socials.map(item => `
                <a href="${item.url}" class="social-btn" target="_blank">
                    <span class="icon">${item.icon}</span>
                    <span class="label">${item.label}</span>
                </a>
            `).join('');
        }
    },

    // switchTab 部分保持之前 fetch 的逻辑即可
    async switchTab(id) {
        const target = document.getElementById('render-target');
        const config = CONFIG.menu.find(m => m.id === id);
        if (!config) return;

        // 更新按钮激活状态
        document.querySelectorAll('.switch-btn').forEach(btn => {
            btn.classList.toggle('active', btn.innerText.toLowerCase().includes(id));
        });

        // 动画切换
        gsap.to(target, { opacity: 0, y: 10, duration: 0.2, onComplete: async () => {
            try {
                const res = await fetch(config.file);
                const md = await res.text();
                target.innerHTML = `<div class="markdown-body">${marked.parse(md)}</div>`;
                gsap.fromTo(target, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });
            } catch (err) {
                target.innerHTML = `<p>加载失败: ${config.file}</p>`;
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