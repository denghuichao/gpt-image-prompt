# content-factory

推特文章处理工作区。

## 目录结构

- `articles/<slug>/origin.html`: 手动粘贴的原始 HTML
- `articles/<slug>/origin.md`: 清洗后的 Markdown
- `articles/<slug>/target.system.md`: 站内改写版
- `articles/<slug>/target.publish.md`: 外发布版本
- `articles/<slug>/<slug>.md`: 最终同步到博客的文件
- `articles/<slug>/meta.json`: 文章元信息

## 脚本

- `scripts/new-article.js <slug>`: 新建文章目录
- `scripts/build-article.js <article-dir>`: 从 `origin.html` 生成/刷新 `origin.md`，并基于 `target.system.md` 生成发布版

## 流程

1. 把 x-capture 导出的文章 HTML 粘到 `origin.html`
2. 运行 `node plugins/content-factory/scripts/build-article.js <article-dir>`
3. 人工编辑 `target.system.md`
4. 再跑一次 build，刷新 `target.publish.md` 和最终博客文件
