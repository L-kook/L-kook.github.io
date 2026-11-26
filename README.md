# L-kook 的博客

在线地址：[https://l-kook.github.io/](https://l-kook.github.io/)

基于 [Astro](https://astro.build/) 与 [Astro Cactus](https://github.com/chrismwilliams/astro-theme-cactus) 搭建的个人极简博客，集成亮/暗色切换、文章目录（TOC）、Pagefind 中文站内搜索、自动生成中文 OG 分享图、RSS 订阅以及 `al-folio` 风格的右侧个人照片与信息栏。

## 目录结构

```text
.
├── content/
│   ├── posts/          # 博客文章（.md / .mdx）
│   ├── notes/          # 简短随记（.md / .mdx）
│   └── tags/           # 标签自定义说明（可选）
├── public/
│   └── assets/         # 静态图片资源（头像、文章配图等）
├── src/
│   ├── site.config.ts  # 站点标题、导航、右侧个人信息栏等核心配置
│   ├── components/
│   │   ├── ProfileCard.astro  # 右侧个人照片 + 等宽信息栏组件
│   │   └── SocialList.astro   # 社交链接图标
│   └── pages/          # 首页、关于页、文章/随记/标签及 OG 图路由
└── .github/workflows/
    └── deploy.yml      # GitHub Pages 自动构建与部署工作流
```

## 本地开发命令

需要 Node.js 22+ 与 pnpm 10+：

| 命令 | 说明 |
| :--- | :--- |
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 启动本地开发服务器（热更新预览） |
| `pnpm build` | 构建生产站点到 `dist/` 并自动生成 Pagefind 搜索索引 |
| `pnpm preview` | 本地预览 `dist/` 生产构建结果 |
| `pnpm check` | 运行 `astro check` 类型检查与 `biome` 代码检查 |

## 日常写作与更新

### 1. 发布新文章

在 `content/posts/` 下新建 Markdown 文件（例如 `content/posts/my-first-note.md`）：

```markdown
---
title: "文章标题"
description: "一句话摘要，用于列表与 SEO 描述"
publishDate: "2026-11-26"
tags: ["技术", "随笔"]
# 可选字段：
# updatedDate: "2026-11-27"
# pinned: true
# draft: true
---

这里是正文内容，支持标准 Markdown、代码块高亮与图片引用（如 `![说明](/assets/example.svg)`）。
```

### 2. 发布简短随记

在 `content/notes/` 下新建 Markdown 文件（`publishDate` 需为带时区的 ISO 8601 格式）：

```markdown
---
title: "随记标题"
description: "简短摘要（可选）"
publishDate: "2026-11-26T16:00:00+08:00"
---

记录一条简短的想法或片段。
```

### 3. 更换右侧个人照片与信息栏

1. 将你的照片放入 `public/assets/`（例如 `public/assets/prof_pic.jpg`）；
2. 编辑 `src/site.config.ts` 中的 `profileConfig`：

```ts
export const profileConfig = {
	enabled: true, // 设为 false 可隐藏右侧照片栏
	avatar: "/assets/prof_pic.jpg",
	avatarAlt: "L-kook 的照片",
	moreInfo: ["Developer · Blogger", "代码与生活记录", "github.com/L-kook"],
};
```

### 4. 修改站点信息与社交链接

- 站点名称、简介、导航菜单：`src/site.config.ts`
- 首页简介：`src/pages/index.astro`
- 关于页内容：`src/pages/about.astro`
- 社交图标链接：`src/components/SocialList.astro`

## 自动部署

推送到 `main` 分支后，GitHub Actions（`.github/workflows/deploy.yml`）会自动安装依赖、构建站点并部署到 GitHub Pages：

```bash
git add -A
git commit -m "新增文章 / 更新配置"
git push origin main
```

## 致谢

主题基于 [chrismwilliams/astro-theme-cactus](https://github.com/chrismwilliams/astro-theme-cactus)，右侧个人简介栏排版参考了 [alshedivat/al-folio](https://github.com/alshedivat/al-folio)。
