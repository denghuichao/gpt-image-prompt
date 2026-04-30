const fs = require("fs");
const path = require("path");

const INPUT = path.join(process.cwd(), "trending-prompts.json");
const OUTPUT = path.join(process.cwd(), "trending-prompts.importable.json");

function slugify(input) {
  return String(input || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function normalizePromptText(s) {
  return String(s || "")
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .trim();
}

function toTitleCase(s) {
  return String(s || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => {
      if (w.length <= 2) return w.toUpperCase();
      return w[0].toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");
}

function detectPromptLanguage(prompt) {
  const text = String(prompt || "");
  const cjkCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinCount = (text.match(/[A-Za-z]/g) || []).length;
  if (cjkCount >= 12) return "zh";
  if (latinCount === 0 && cjkCount > 0) return "zh";
  if (cjkCount > latinCount * 0.35) return "zh";
  return "en";
}

function extractKeywordTags(prompt) {
  const p = prompt.toLowerCase();
  const bag = [];
  const rules = [
    ["infographic", "Infographic"],
    ["blueprint", "Blueprint"],
    ["isometric", "Isometric"],
    ["product", "Product"],
    ["packaging", "Packaging"],
    ["poster", "Poster"],
    ["fashion", "Fashion"],
    ["portrait", "Portrait"],
    ["cinematic", "Cinematic"],
    ["studio", "Studio"],
    ["3d", "3D"],
    ["minimal", "Minimal"],
    ["photoreal", "Photoreal"],
    ["commercial", "Commercial"],
    ["architecture", "Architecture"],
    ["ui", "UI"],
  ];
  for (const [needle, tag] of rules) {
    if (p.includes(needle)) bag.push(tag);
  }
  if (bag.length < 3) {
    bag.push("AI Image", "Prompt Template", "Creative");
  }
  return uniq(bag).slice(0, 5);
}

function deriveTitle(prompt, categories, lang) {
  const normalized = normalizePromptText(prompt);
  const firstLine = normalized
    .split("\n")
    .map((s) => s.trim())
    .find((s) => s.length > 0) || "";

  const category = (categories && categories[0]) ? String(categories[0]) : "General";

  if (!firstLine || firstLine.startsWith("{") || firstLine.startsWith("[")) {
    return lang === "zh"
      ? `${category} 提示词模板`
      : `${category} Prompt Template`;
  }

  if (lang === "zh") {
    const cleanedZh = firstLine
      .replace(/\[[^\]]+\]/g, "主题")
      .replace(/\{[^}]+\}/g, "变量")
      .replace(/[“”"']/g, "")
      .replace(/[，,。.!！:：;；]+$/g, "")
      .trim();
    const clippedZh = cleanedZh.slice(0, 36).trim();
    return clippedZh || `${category} 提示词模板`;
  }

  const cleaned = firstLine
    .replace(/\[[^\]]+\]/g, "Subject")
    .replace(/\{[^}]+\}/g, "Variable")
    .replace(/^create\s+/i, "")
    .replace(/^generate\s+/i, "")
    .replace(/^a\s+/i, "")
    .replace(/^an\s+/i, "")
    .replace(/[“”"']/g, "")
    .trim();

  const words = cleaned.split(/\s+/).filter(Boolean);
  const clipped = words.slice(0, 10).join(" ");
  const title = toTitleCase(clipped);
  return title || `${category} Prompt Template`;
}

function deriveDesc(prompt, categories, tags, lang) {
  const p = prompt.toLowerCase();
  const catText = (categories && categories.length) ? categories.join(" / ") : (lang === "zh" ? "通用视觉创作" : "General Visual Creation");

  if (lang === "zh") {
    const scenes = [
      `适用于 **${catText}** 方向的 AI 图像生成任务，可直接用于快速出图与迭代。`,
    ];

    if (p.includes("infographic") || p.includes("blueprint") || p.includes("annotation")) {
      scenes.push("适合制作技术信息图、结构拆解图、蓝图叠加类视觉内容。");
    } else if (p.includes("product") || p.includes("packaging") || p.includes("brand")) {
      scenes.push("适合商品主视觉、包装提案、品牌广告与电商素材生成。");
    } else if (p.includes("portrait") || p.includes("fashion") || p.includes("model")) {
      scenes.push("适合人物肖像、时尚大片与社媒形象素材创作。");
    } else {
      scenes.push("适合在既定风格下快速生成稳定、可复用的视觉结果。");
    }

    const cautions = [
      "将占位符（如 `[OBJECT]`、`{variable}`）替换为具体实体与场景描述。",
      "优先保留构图、光线、镜头与材质等核心约束，再逐步微调风格词。",
      "若出现细节混乱，先减少修饰词密度并分批加入关键元素进行迭代。",
    ];

    if (tags.includes("Blueprint") || tags.includes("Infographic")) {
      cautions.push("信息图类提示词需控制标注数量与层级，避免文字/标注过密影响可读性。");
    }
    if (tags.includes("Product")) {
      cautions.push("涉及品牌字样时请注意版权与商标合规，必要时替换为通用文案。");
    }

    return [
      "### 适用场景",
      ...scenes.map((s) => `- ${s}`),
      "",
      "### 注意事项",
      ...uniq(cautions).slice(0, 4).map((s) => `- ${s}`),
    ].join("\n");
  }

  const scenesEn = [
    `Suitable for **${catText}** AI image generation workflows, with reusable structure for fast iteration.`,
  ];
  if (p.includes("infographic") || p.includes("blueprint") || p.includes("annotation")) {
    scenesEn.push("Best for technical infographics, teardown visuals, and blueprint-overlay compositions.");
  } else if (p.includes("product") || p.includes("packaging") || p.includes("brand")) {
    scenesEn.push("Best for product hero shots, packaging proposals, and brand campaign visuals.");
  } else if (p.includes("portrait") || p.includes("fashion") || p.includes("model")) {
    scenesEn.push("Best for portrait, fashion, and social campaign imagery.");
  } else {
    scenesEn.push("Best for stable, style-consistent outputs in iterative generation.");
  }

  const cautionsEn = [
    "Replace placeholders (such as `[OBJECT]` and `{variable}`) with concrete subjects and contexts.",
    "Keep core constraints first (composition, lighting, lens, materials), then add style modifiers gradually.",
    "If results become noisy, reduce prompt density and reintroduce key elements step by step.",
  ];
  if (tags.includes("Blueprint") || tags.includes("Infographic")) {
    cautionsEn.push("For infographic prompts, control annotation density and hierarchy to keep readability.");
  }
  if (tags.includes("Product")) {
    cautionsEn.push("If brand terms are included, verify trademark/copyright compliance before publishing.");
  }

  return [
    "### Use Cases",
    ...scenesEn.map((s) => `- ${s}`),
    "",
    "### Notes",
    ...uniq(cautionsEn).slice(0, 4).map((s) => `- ${s}`),
  ].join("\n");
}

function normalizeAuthor(author) {
  const raw = String(author || "").trim();
  if (!raw) return "@unknown";
  return raw.startsWith("@") ? raw : `@${raw}`;
}

function buildImages(item) {
  const list = [
    item.image,
    ...(Array.isArray(item.images) ? item.images : []),
  ]
    .map((s) => String(s || "").trim())
    .filter(Boolean);
  return uniq(list);
}

function transformItem(item, index, usedSlugs) {
  const prompt = normalizePromptText(item.prompt);
  const lang = detectPromptLanguage(prompt);
  const categories = Array.isArray(item.categories)
    ? item.categories.map((s) => String(s || "").trim()).filter(Boolean)
    : [];
  const title = deriveTitle(prompt, categories, lang);

  let slug = slugify(title) || `template-${index + 1}`;
  if (usedSlugs.has(slug)) {
    let i = 2;
    while (usedSlugs.has(`${slug}-${i}`)) i += 1;
    slug = `${slug}-${i}`;
  }
  usedSlugs.add(slug);

  const tags = categories.length > 0
    ? uniq(categories).slice(0, 5)
    : extractKeywordTags(prompt);

  return {
    slug,
    title,
    desc: deriveDesc(prompt, categories, tags, lang),
    prompt_template: prompt,
    images: buildImages(item),
    tags,
    author: normalizeAuthor(item.author),
    source_url: String(item.source_url || "").trim(),
    variables: [],
    default_model: "gpt-image-2",
    style: categories[0] || tags[0] || "General",
  };
}

function main() {
  if (!fs.existsSync(INPUT)) {
    throw new Error(`Input file not found: ${INPUT}`);
  }

  const raw = JSON.parse(fs.readFileSync(INPUT, "utf8"));
  if (!Array.isArray(raw)) {
    throw new Error("Input JSON must be an array.");
  }

  const usedSlugs = new Set();
  const templates = raw.map((item, idx) => transformItem(item || {}, idx, usedSlugs));

  const out = {
    templates,
  };
  fs.writeFileSync(OUTPUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`Converted ${templates.length} templates -> ${path.basename(OUTPUT)}`);
}

main();
