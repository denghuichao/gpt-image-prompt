#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function main() {
  const slug = process.argv[2];
  if (!slug) {
    console.error('Usage: node scripts/new-article.js <slug>');
    process.exit(1);
  }

  const normalized = slugify(slug);
  const articleDir = path.resolve(process.cwd(), 'plugins/content-factory/articles', normalized);
  fs.mkdirSync(articleDir, { recursive: true });

  const meta = {
    slug: normalized,
    title: '[TODO: title]',
    date: '[TODO: yyyy-mm-dd]',
    cover: '/blog_images/[TODO].jpg',
    blogFile: `content/blog/${normalized}.md`,
    systemFile: 'target.system.md',
    publishFile: 'target.publish.md'
  };

  fs.writeFileSync(path.join(articleDir, 'meta.json'), `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(articleDir, 'origin.html'), '[paste origin html here]\n', 'utf8');
  fs.writeFileSync(path.join(articleDir, 'origin.md'), '[build from origin.html]\n', 'utf8');
  fs.writeFileSync(path.join(articleDir, 'target.system.md'), '[rewrite here]\n', 'utf8');
  fs.writeFileSync(path.join(articleDir, 'target.publish.md'), '[publish version]\n', 'utf8');
  fs.writeFileSync(path.join(articleDir, `${normalized}.md`), '[final blog copy]\n', 'utf8');

  console.log(`Created ${articleDir}`);
}

main();
