const CONFIG = {
    name: "Yifan Gao",
    subtitle: "BUPT AI Graduate Student \n Medical Image Segmentation",
    avatar: "./Materials/avatar.png", // 确保此路径下有你的头像
        
        socials: [
            { icon: "📧", label: "Email", url: "mailto:32215300036@e.gzhu.edu.cn" },
            { icon: "🐙", label: "GitHub", url: "https://github.com/yfangao" },
            { icon: "📍", label: "Beijing, China", url: "#" } 
        ],

        menu: [
            { id: "home", label: "Resume", file: "resume.md" },
            { id: "blog", label: "Blog", file: "posts/blog-list.md" }
        ],
    
    // 菜单配置：id 必须与 HTML 中的 onclick 参数对应
    menu: [
        { id: "home", label: "Resume", file: "resume.md" },
        { id: "blog", label: "Blog", file: "posts/blog-list.md" }
    ]
};