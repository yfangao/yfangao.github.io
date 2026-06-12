const app = {
    init() {
        this.renderProfile();
        this.initGlobalEvents();
        requestAnimationFrame(() => this.switchTab('home'));
    },

    renderProfile() {
        document.getElementById('js-avatar').src = CONFIG.avatar;
        document.getElementById('js-name').innerText = CONFIG.name;
        document.getElementById('js-subtitle').innerText = CONFIG.subtitle;

        const socialsTarget = document.getElementById('js-socials');
        // 需要执行滑出效果的ID
        const slideIds = ['email', 'local']; 

        if (socialsTarget && CONFIG.socials) {
            socialsTarget.innerHTML = CONFIG.socials.map(item => {
                const isSlide = slideIds.includes(item.id);
                return `
                    <div class="social-item">
                        <a href="${isSlide ? 'javascript:void(0)' : item.url}" 
                        class="social-btn ${isSlide ? 'js-slide-btn' : ''}" 
                        data-id="${item.id}"
                        target="${isSlide ? '' : '_blank'}">
                            <span class="icon">${item.icon}</span>
                            <span class="label">${item.label}</span>
                        </a>
                        ${isSlide ? `<div class="email-display" id="box-${item.id}">${item.url}</div>` : ''}
                    </div>
                `;
            }).join('');

            // 绑定点击事件给所有需要滑出的按钮
            document.querySelectorAll('.js-slide-btn').forEach(btn => {
                btn.onclick = (e) => {
                    const id = btn.getAttribute('data-id');
                    this.toggleSlideBox(id);
                };
            });
        }
    },

    // 通用滑动函数
    toggleSlideBox(id) {
        const box = document.getElementById(`box-${id}`);
        const isVisible = box.classList.contains('show');
        
        document.querySelectorAll('.email-display.show').forEach(openBox => {
            if(openBox.id !== `box-${id}`) {
                gsap.to(openBox, { height: 0, opacity: 0, marginTop: 0, duration: 0.3 });
                openBox.classList.remove('show');
            }
        });

        if (!isVisible) {
            box.classList.add('show');
            gsap.fromTo(box, 
                { height: 0, opacity: 0, marginTop: 0 }, 
                { height: 'auto', opacity: 1, marginTop: 10, duration: 0.4, ease: "back.out(1.2)" }
            );
        } else {
            gsap.to(box, { 
                height: 0, opacity: 0, marginTop: 0, duration: 0.3, ease: "power2.in",
                onComplete: () => box.classList.remove('show')
            });
        }
    },

    async switchTab(id) {
        const target = document.getElementById('render-target');
        const config = CONFIG.menu.find(m => m.id === id);
        if (!config) return;
        document.querySelectorAll('.switch-btn').forEach(btn => {
            const isActive = btn.getAttribute('onclick').includes(`'${id}'`);
            btn.classList.toggle('active', isActive);
        });
        if (target.innerHTML !== "") {
            await gsap.to(target, { opacity: 0, y: 20, duration: 0.2, ease: "power2.in" });
        }
        try {
            const response = await fetch(config.file);
            const md = await response.text();
            target.innerHTML = `<div class="markdown-body">${marked.parse(md)}</div>`;
            document.querySelector('.scroll-area').scrollTop = 0;
            gsap.fromTo(target, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.1 });
        } catch (err) {
            target.innerHTML = `<p style="text-align:center;padding:40px;">⚠️ 加载失败</p>`;
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