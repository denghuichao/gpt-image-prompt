#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DEFAULT_BASE_URL = 'https://imagepromptbase.xyz';
const DEFAULT_BLOG_DIR = path.resolve(process.cwd(), 'content/blog');

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i += 1;
      } else {
        args[key] = true;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function writeTextIfChanged(file, text) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === text) {
    return false;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf8');
  return true;
}

function exists(file) {
  try {
    fs.accessSync(file);
    return true;
  } catch {
    return false;
  }
}

function decodeEntities(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripTags(html, { preserveBreaks = false } = {}) {
  let text = html
    .replace(/<br\s*\/?>/gi, preserveBreaks ? '\n' : ' ')
    .replace(/<\/p>|<\/div>|<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  text = decodeEntities(text).replace(/\u00a0/g, ' ');
  if (preserveBreaks) {
    return text.replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractFirst(html, re) {
  const match = html.match(re);
  return match ? match[1] : '';
}

function extractTitle(html) {
  return stripTags(extractFirst(html, /data-testid="twitter-article-title"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/i));
}

function extractSourceUrl(html) {
  const match = html.match(/href="\/([^"/]+)\/status\/(\d+)"/i);
  if (!match) return '';
  return `https://x.com/${match[1]}/status/${match[2]}`;
}

function extractMediaId(block) {
  const match = block.match(/\/media\/(\d+)/i);
  return match ? match[1] : '';
}

function extractCaption(block) {
  const captionMatch = block.match(/twitter-article-media-caption-id[\s\S]*?<div[^>]*class="longform-unstyled"[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i);
  if (!captionMatch) return '';
  const caption = stripTags(captionMatch[1]);
  return caption.replace(/^图片来源于\s*/g, '图片来源于').trim();
}

function extractCode(block) {
  const codeMatch = block.match(/<code[^>]*>([\s\S]*?)<\/code>/i);
  if (!codeMatch) return '';
  return decodeEntities(
    codeMatch[1]
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/span>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\u00a0/g, ' ')
  ).replace(/^\n+|\n+$/g, '');
}

function extractBlocks(html) {
  const blocks = [];
  const pattern = /<h2 class="longform-header-two"[\s\S]*?<\/h2>|<div class="longform-unstyled"[\s\S]*?<\/div>|<section class="" data-block="true"[\s\S]*?<\/section>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    blocks.push(match[0]);
  }
  return blocks;
}

function renderOriginMarkdown(html) {
  const title = extractTitle(html) || 'Untitled';
  const sourceUrl = extractSourceUrl(html);
  const blocks = extractBlocks(html);
  const lines = [`# ${title}`, ''];

  if (sourceUrl) {
    lines.push(`原始链接：${sourceUrl}`, '');
  }

  for (const block of blocks) {
    if (/data-testid="markdown-code-block"/i.test(block)) {
      const code = extractCode(block);
      if (code.trim()) {
        lines.push('```text', code, '```', '');
      }
      continue;
    }

    const mediaId = extractMediaId(block);
    if (mediaId) {
      lines.push(`![${mediaId}](/blog_images/${mediaId}.jpg)`);
      const caption = extractCaption(block);
      if (caption) {
        lines.push('', caption, '');
      }
      continue;
    }

    if (/<h2 class="longform-header-two"/i.test(block)) {
      const text = stripTags(block);
      if (text) {
        lines.push(`## ${text}`, '');
      }
      continue;
    }

    const text = stripTags(block);
    if (text) {
      lines.push(text, '');
    }
  }

  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

function removeSourceLink(markdown) {
  return markdown
    .replace(/\n?原始链接：https:\/\/x\.com\/[^\n]+\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

function makePublishMarkdown(systemMarkdown, baseUrl) {
  return systemMarkdown
    .replace(/\]\(\/blog_images\//g, `](${baseUrl}/blog_images/`)
    .replace(/\n?原始链接：https:\/\/x\.com\/[^\n]+\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd() + '\n';
}

function loadMeta(articleDir) {
  const metaFile = path.join(articleDir, 'meta.json');
  if (!exists(metaFile)) return {};
  return JSON.parse(readText(metaFile));
}

function syncSiteCopy(articleDir, systemMarkdown, meta, blogDir) {
  const slug = meta.slug || path.basename(articleDir);
  const targetFile = path.join(blogDir, `${slug}.md`);
  writeTextIfChanged(targetFile, systemMarkdown);
  return targetFile;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const articleDir = path.resolve(args['article-dir'] || args._[0] || '');
  if (!articleDir || !exists(articleDir)) {
    console.error('Usage: node scripts/build-article.js <article-dir> [--sync-blog] [--blog-dir <dir>]');
    process.exit(1);
  }

  const meta = loadMeta(articleDir);
  const htmlFile = path.join(articleDir, 'origin.html');
  const originFile = path.join(articleDir, 'origin.md');
  const systemFile = path.join(articleDir, 'target.system.md');
  const publishFile = path.join(articleDir, 'target.publish.md');
  const finalFile = path.join(articleDir, `${meta.slug || path.basename(articleDir)}.md`);

  if (!exists(htmlFile)) {
    console.error(`Missing origin.html: ${htmlFile}`);
    process.exit(1);
  }

  const originMarkdown = renderOriginMarkdown(readText(htmlFile));
  writeTextIfChanged(originFile, originMarkdown);

  if (!exists(systemFile)) {
    writeTextIfChanged(systemFile, removeSourceLink(originMarkdown));
  }

  const systemMarkdown = readText(systemFile);
  const publishMarkdown = makePublishMarkdown(systemMarkdown, args['base-url'] || DEFAULT_BASE_URL);
  writeTextIfChanged(publishFile, publishMarkdown);
  writeTextIfChanged(finalFile, systemMarkdown);

  if (args['sync-blog']) {
    const blogDir = path.resolve(args['blog-dir'] || DEFAULT_BLOG_DIR);
    syncSiteCopy(articleDir, systemMarkdown, meta, blogDir);
  }

  console.log(`Built article: ${path.basename(articleDir)}`);
  console.log(`- origin.md: ${originFile}`);
  console.log(`- target.system.md: ${systemFile}`);
  console.log(`- target.publish.md: ${publishFile}`);
  console.log(`- final md: ${finalFile}`);
}

main();
