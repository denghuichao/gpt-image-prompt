const SETTINGS_KEY = "xpc_settings";
const DAY_STORE_KEY = "xpc_day_store";
const LAST_EXPORT_KEY = "xpc_last_export";

const DEFAULT_SETTINGS = {
  exportSubdir: "x-prompt-json",
  openAIBaseUrl: "https://api.openai.com",
  openAIApiKey: "",
  openAIModel: "gpt-4o-mini",
};

const STYLE_OPTIONS = [
  "3d",
  "animal",
  "architecture",
  "Architecture & Spaces",
  "Brand",
  "Brand & Logos",
  "branding",
  "cartoon",
  "character",
  "Characters",
  "Characters & People",
  "Charts",
  "Charts & Infographics",
  "Classical",
  "clay",
  "Commerce",
  "creative",
  "data-viz",
  "Documents",
  "Documents & Publishing",
  "Education",
  "emoji",
  "fantasy",
  "fashion",
  "felt",
  "food",
  "Food & Drink",
  "futuristic",
  "gaming",
  "History",
  "History & Classical Themes",
  "illustration",
  "Illustration & 3D",
  "Illustration & Art",
  "Infographic",
  "interior",
  "landscape",
  "logo",
  "minimalist",
  "nature",
  "neon",
  "Other Use Cases",
  "paper-craft",
  "photography",
  "Photography & Realism",
  "pixel",
  "portrait",
  "poster",
  "Poster Design",
  "Posters & Typography",
  "product",
  "Product & Brand",
  "Products",
  "Products & E-commerce",
  "Realistic",
  "retro",
  "Scenes",
  "Scenes & Storytelling",
  "sci-fi",
  "sculpture",
  "Social",
  "Story",
  "Tech",
  "toy",
  "Travel",
  "typography",
  "UI",
  "UI & Graphic",
  "UI & Interfaces",
  "vehicle",
];

const STYLE_ALIASES = [
  { label: "photography", terms: ["photoreal", "realistic photo", "camera", "dslr", "street photography", "macro photography"] },
  { label: "Photography & Realism", terms: ["photography realism", "realism photography"] },
  { label: "Realistic", terms: ["hyper realistic", "ultra realistic", "realistic"] },
  { label: "illustration", terms: ["illustration", "illustrated", "digital drawing"] },
  { label: "Illustration & 3D", terms: ["3d illustration", "illustrative 3d"] },
  { label: "Illustration & Art", terms: ["art illustration", "artwork"] },
  { label: "3d", terms: ["3d", "render", "cgi", "octane", "blender"] },
  { label: "Infographic", terms: ["infographic"] },
  { label: "Charts & Infographics", terms: ["chart", "data chart", "diagram"] },
  { label: "data-viz", terms: ["data viz", "dataviz", "data visualization"] },
  { label: "cartoon", terms: ["cartoon", "comic", "caricature"] },
  { label: "character", terms: ["character design"] },
  { label: "Characters & People", terms: ["people portrait", "human character"] },
  { label: "portrait", terms: ["portrait", "headshot"] },
  { label: "paper-craft", terms: ["paper craft", "papercraft", "paper art", "cut paper"] },
  { label: "poster", terms: ["poster"] },
  { label: "Poster Design", terms: ["poster design"] },
  { label: "Posters & Typography", terms: ["typographic poster", "text poster"] },
  { label: "typography", terms: ["typography", "lettering", "text layout"] },
  { label: "logo", terms: ["logo"] },
  { label: "Brand", terms: ["brand identity"] },
  { label: "Brand & Logos", terms: ["brand logo"] },
  { label: "branding", terms: ["branding"] },
  { label: "Product & Brand", terms: ["product branding"] },
  { label: "product", terms: ["product shot", "product render", "packaging"] },
  { label: "Products & E-commerce", terms: ["ecommerce", "e-commerce"] },
  { label: "interior", terms: ["interior", "indoor space"] },
  { label: "architecture", terms: ["architecture", "architectural"] },
  { label: "Architecture & Spaces", terms: ["architectural space", "space design"] },
  { label: "UI", terms: ["ui"] },
  { label: "UI & Graphic", terms: ["ui graphic"] },
  { label: "UI & Interfaces", terms: ["user interface", "interfaces", "ux"] },
  { label: "landscape", terms: ["landscape", "scenery"] },
  { label: "nature", terms: ["nature"] },
  { label: "vehicle", terms: ["vehicle", "car", "motorcycle", "truck"] },
  { label: "fashion", terms: ["fashion", "editorial fashion", "runway"] },
  { label: "food", terms: ["food"] },
  { label: "Food & Drink", terms: ["drink", "beverage", "cocktail"] },
  { label: "fantasy", terms: ["fantasy"] },
  { label: "sci-fi", terms: ["sci fi", "science fiction", "scifi"] },
  { label: "gaming", terms: ["game art", "gaming"] },
  { label: "Travel", terms: ["travel"] },
  { label: "History", terms: ["historical"] },
  { label: "History & Classical Themes", terms: ["classical themes", "historical classical"] },
  { label: "Classical", terms: ["classical"] },
  { label: "minimalist", terms: ["minimal", "minimalist"] },
  { label: "creative", terms: ["creative"] },
  { label: "Tech", terms: ["tech", "technology"] },
  { label: "futuristic", terms: ["future", "futuristic"] },
  { label: "retro", terms: ["retro", "vintage"] },
  { label: "toy", terms: ["toy"] },
  { label: "pixel", terms: ["pixel art", "pixel"] },
  { label: "clay", terms: ["clay", "claymation"] },
  { label: "felt", terms: ["felt"] },
  { label: "emoji", terms: ["emoji"] },
  { label: "Social", terms: ["social post", "social media"] },
  { label: "Documents", terms: ["document"] },
  { label: "Documents & Publishing", terms: ["publishing", "brochure"] },
  { label: "Education", terms: ["education", "learning"] },
  { label: "Commerce", terms: ["commerce", "business ad"] },
  { label: "Scenes", terms: ["scene composition"] },
  { label: "Scenes & Storytelling", terms: ["storytelling", "narrative scene"] },
  { label: "Story", terms: ["story prompt"] },
  { label: "animal", terms: ["animal"] },
  { label: "neon", terms: ["neon"] },
  { label: "sculpture", terms: ["sculpture"] },
];

function getLocalDayString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeText(input) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function simpleHash(input) {
  let hash = 5381;
  const text = String(input || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = ((hash << 5) + hash) + text.charCodeAt(i);
    hash |= 0;
  }
  return String(hash >>> 0);
}

async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(input || "")));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function sanitizeSubdir(input) {
  const cleaned = String(input || "")
    .replace(/\\/g, "/")
    .replace(/(^\/+|\/+?$)/g, "")
    .replace(/\.\./g, "")
    .replace(/[^a-zA-Z0-9_\-/]/g, "-")
    .replace(/\/+/g, "/");
  return cleaned || DEFAULT_SETTINGS.exportSubdir;
}

function utf8ToBase64(input) {
  return btoa(unescape(encodeURIComponent(input)));
}

function normalizeWhitespace(input) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
}

function stripNoiseWords(title) {
  return normalizeWhitespace(title)
    .replace(/[「」『』“”"'`]/g, " ")
    .replace(/#[\w\u4e00-\u9fa5-]+/g, " ")
    .replace(/\b(prompt|prompts|tweet|tweets|x|twitter|ai|image|images|post)\b/gi, " ")
    .replace(/\b(提示词|推文|图片|图像|生成|模板)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyFromTitle(title) {
  const clean = stripNoiseWords(title)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return clean || "prompt-template";
}

function normalizeStyleLabel(input) {
  const raw = normalizeText(input);
  const lower = raw.toLowerCase();
  const exact = STYLE_OPTIONS.find((item) => item.toLowerCase() === lower);
  if (exact) return exact;

  for (const item of STYLE_ALIASES) {
    if (item.terms.some((term) => lower.includes(term))) return item.label;
  }
  return "Other Use Cases";
}

function normalizeTag(tag) {
  return normalizeText(tag)
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-]+/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueStrings(values) {
  const seen = new Set();
  const result = [];
  for (const value of values || []) {
    const text = normalizeText(value);
    if (!text) continue;
    if (seen.has(text)) continue;
    seen.add(text);
    result.push(text);
  }
  return result;
}

function buildJsonPayload(templates) {
  return {
    templates: templates.map((t) => ({
      slug: t.slug,
      title: t.title,
      desc: t.desc,
      prompt_template: t.prompt_template,
      image_urls: Array.isArray(t.image_urls) ? t.image_urls : [],
      tags: Array.isArray(t.tags) ? t.tags : [],
      author: t.author,
      source_url: t.source_url,
      style: t.style || "",
      final_prompt: t.final_prompt || "",
      variables: Array.isArray(t.variables) ? t.variables : [],
      edit_mode: t.edit_mode || "direct_only",
    })),
  };
}

function compactThreadForLLM(bundle) {
  return {
    page_url: bundle.page_url,
    thread_url: bundle.thread_url,
    focus_tweet_url: bundle.focus_tweet_url,
    tweets: (bundle.tweets || []).slice(0, 101).map((tweet, idx) => ({
      index: idx,
      tweet_url: tweet.tweet_url,
      author_handle: tweet.author_handle,
      text: normalizeText(tweet.text).slice(0, 1200),
      image_urls: Array.isArray(tweet.image_urls) ? tweet.image_urls.slice(0, 8) : [],
      created_at: tweet.created_at || "",
      is_focus: Boolean(tweet.is_focus),
    })),
    captured_at: bundle.captured_at,
  };
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("LLM returned empty response.");

  const codeFence = raw.match(/```json\s*([\s\S]*?)```/i) || raw.match(/```\s*([\s\S]*?)```/i);
  if (codeFence?.[1]) return JSON.parse(codeFence[1]);

  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }

  return JSON.parse(raw);
}

async function getSettings() {
  const data = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...DEFAULT_SETTINGS, ...(data[SETTINGS_KEY] || {}) };
}

async function saveSettings(next) {
  await chrome.storage.local.set({ [SETTINGS_KEY]: next });
}

async function getDayStore() {
  const data = await chrome.storage.local.get(DAY_STORE_KEY);
  return data[DAY_STORE_KEY] || {};
}

async function saveDayStore(store) {
  await chrome.storage.local.set({ [DAY_STORE_KEY]: store });
}

async function getLastExport() {
  const data = await chrome.storage.local.get(LAST_EXPORT_KEY);
  return data[LAST_EXPORT_KEY] || null;
}

async function saveLastExport(data) {
  await chrome.storage.local.set({ [LAST_EXPORT_KEY]: data });
}

async function buildSourceFingerprint(bundle) {
  const compact = compactThreadForLLM(bundle);
  const text = JSON.stringify(compact);
  return sha256Hex(text);
}

function normalizeTemplateFromLLM(template, bundle) {
  const promptText = normalizeText(template.prompt_template || template.prompt || template.content || "");
  const titleBase = normalizeText(template.title || "");
  const title = titleBase || normalizeText(promptText.split("\n")[0] || "Captured Prompt");
  const desc = normalizeText(template.desc || template.description || "");
  const style = normalizeStyleLabel(template.style || "Other");
  const tags = uniqueStrings((template.tags || []).map(normalizeTag).filter(Boolean)).filter((tag) => !["prompt", "x", "twitter", "tweet"].includes(tag));
  const imageUrls = uniqueStrings([...(template.image_urls || []), ...((bundle.tweets || []).flatMap((t) => t.image_urls || []))]);
  const variables = Array.isArray(template.variables)
    ? template.variables.map((v) => ({
        key: normalizeText(v.key || ""),
        description: normalizeText(v.description || ""),
        example: normalizeText(v.example || ""),
      })).filter((v) => v.key)
    : [];

  const editMode = variables.length > 0 ? "both" : "direct_only";

  return {
    slug: slugifyFromTitle(title),
    title,
    desc,
    prompt_template: promptText,
    image_urls: imageUrls,
    tags: uniqueStrings([style ? normalizeTag(style) : "", ...tags]).filter(Boolean).slice(0, 8),
    author: normalizeText(template.author || (bundle.tweets?.[0]?.author_handle || "@unknown")),
    source_url: normalizeText(template.source_url || bundle.thread_url || bundle.page_url),
    style,
    final_prompt: normalizeText(template.final_prompt || ""),
    variables,
    edit_mode: template.edit_mode === "both" ? "both" : editMode,
  };
}

function hasMeaningfulPromptText(input) {
  const text = normalizeText(input);
  if (text.length < 12) return false;
  return /[a-zA-Z\u4e00-\u9fa5]/.test(text);
}

function likelyPromptHintExists(bundle) {
  const combined = (bundle?.tweets || [])
    .map((tweet) => normalizeText(tweet?.text || ""))
    .filter(Boolean)
    .join("\n");

  if (!combined) return false;

  if (/(提示词|关键词|咒语|prompt|negative prompt|最后一行|最后一段|复制|copy|--ar|--v)/i.test(combined)) {
    return true;
  }

  const lines = combined
    .split("\n")
    .map((line) => normalizeText(line))
    .filter(Boolean);

  return lines.some((line) => line.length >= 40 && /[,:;，。：；]/.test(line));
}

async function callOpenAICompatibleExtractor(bundle, settings) {
  const baseUrl = String(settings.openAIBaseUrl || DEFAULT_SETTINGS.openAIBaseUrl).replace(/\/+$/, "");
  const apiKey = String(settings.openAIApiKey || "").trim();
  const model = String(settings.openAIModel || DEFAULT_SETTINGS.openAIModel).trim() || DEFAULT_SETTINGS.openAIModel;

  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const thread = compactThreadForLLM(bundle);
  const systemPrompt = [
    "You extract AI image prompt templates from X/Twitter threads.",
    "The prompt may be in the main tweet or in any of the first 100 comments/replies.",
    `Choose exactly one style from: ${STYLE_OPTIONS.join(", ")}.`,
    "Return strict JSON only, with this shape:",
    '{"has_prompt":true,"reason":"","templates":[{"slug":"","title":"","desc":"","prompt_template":"","image_urls":[],"tags":[],"author":"","source_url":"","style":"","final_prompt":"","variables":[],"edit_mode":"direct_only"}]}',
    "Rules:",
    "- If there is no clear AI image prompt in main tweet and first 100 replies/comments, set has_prompt=false, provide short reason, and return templates=[].",
    "- title: concise, noise-free, from the prompt summary.",
    "- desc: short but useful summary of the prompt idea.",
    "- slug: you may leave empty; the app will derive it from title.",
    "- prompt_template: reconstruct the actual prompt cleanly, preserving line breaks.",
    "- image_urls: include all relevant image URLs from the main tweet and comments.",
    "- tags: 3-8 relevant tags only; do not use generic filler tags like prompt/x/twitter/tweet.",
    "- style: one exact label from the allowed list.",
    "- edit_mode: use 'both' only when the prompt clearly contains reusable variables/placeholders; otherwise 'direct_only'.",
    "- variables: if edit_mode is both, list meaningful placeholders with key/description/example.",
    "- author: the original poster's handle when identifiable.",
    "- source_url: the canonical X thread URL.",
    "- If the prompt is split across multiple comments, merge the necessary parts into one prompt_template.",
    "- Do not include markdown fences or extra commentary.",
  ].join("\n");

  const userPrompt = `Analyze this X thread JSON and extract one importable prompt template:\n${JSON.stringify(thread)}`;

  async function requestChatWithPrompts(systemText, userText, useJsonMode) {
    const body = {
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemText },
        { role: "user", content: userText },
      ],
    };

    if (useJsonMode) {
      body.response_format = { type: "json_object" };
    }

    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`OpenAI-compatible API error ${res.status}: ${text}`);
    }

    const json = await res.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    return typeof content === "string" ? content : JSON.stringify(content);
  }

  async function requestChat(useJsonMode) {
    return requestChatWithPrompts(systemPrompt, userPrompt, useJsonMode);
  }

  let raw = "";
  try {
    raw = await requestChat(true);
  } catch (err) {
    // Retry without JSON mode for providers that do not support response_format.
    raw = await requestChat(false);
  }

  const parsed = extractJsonObject(raw);
  const hasPrompt = parsed?.has_prompt !== false;
  const reason = normalizeText(parsed?.reason || "");
  const templates = Array.isArray(parsed?.templates) ? parsed.templates : [];

  if (!hasPrompt && templates.length === 0 && likelyPromptHintExists(bundle)) {
    const rescueSystemPrompt = [
      "You extract AI image prompt templates from X/Twitter threads.",
      "There are strong hints that a prompt exists in the thread.",
      "Do a best-effort extraction from main tweet and first 100 replies/comments.",
      `Choose exactly one style from: ${STYLE_OPTIONS.join(", ")}.`,
      "Return strict JSON only, with this shape:",
      '{"templates":[{"slug":"","title":"","desc":"","prompt_template":"","image_urls":[],"tags":[],"author":"","source_url":"","style":"","final_prompt":"","variables":[],"edit_mode":"direct_only"}]}',
      "Rules:",
      "- Extract prompt text even if mixed with chatter; keep the usable prompt only.",
      "- If the prompt is split across lines/comments, merge it into prompt_template.",
      "- Do not return markdown or extra commentary.",
    ].join("\n");

    const rescueUserPrompt = `Try again and force extraction if any prompt-like content exists:\n${JSON.stringify(thread)}`;
    let rescueRaw = "";
    try {
      rescueRaw = await requestChatWithPrompts(rescueSystemPrompt, rescueUserPrompt, true);
    } catch (_err) {
      rescueRaw = await requestChatWithPrompts(rescueSystemPrompt, rescueUserPrompt, false);
    }

    const rescueParsed = extractJsonObject(rescueRaw);
    const rescueTemplates = Array.isArray(rescueParsed?.templates) ? rescueParsed.templates : [];
    const rescueNormalized = rescueTemplates
      .map((template) => normalizeTemplateFromLLM(template, bundle))
      .filter((template) => hasMeaningfulPromptText(template.prompt_template));

    if (rescueNormalized.length) {
      return { hasPrompt: true, reason: "", templates: rescueNormalized, raw: rescueRaw };
    }
  }

  if (!hasPrompt) {
    return { hasPrompt: false, reason: reason || "No clear prompt found.", templates: [], raw };
  }

  const normalizedTemplates = templates
    .map((template) => normalizeTemplateFromLLM(template, bundle))
    .filter((template) => hasMeaningfulPromptText(template.prompt_template));

  if (!normalizedTemplates.length) {
    return { hasPrompt: false, reason: reason || "No clear prompt found.", templates: [], raw };
  }

  return { hasPrompt: true, reason, templates: normalizedTemplates, raw };
}

async function upsertTemplateForDay(dayKey, template) {
  const store = await getDayStore();
  const dayData = store[dayKey] || { templates: [], fingerprints: [] };

  const normalized = {
    ...template,
    title: normalizeText(template.title),
    desc: normalizeText(template.desc),
    prompt_template: normalizeText(template.prompt_template),
    source_url: normalizeText(template.source_url),
    author: normalizeText(template.author || "@unknown"),
    style: normalizeStyleLabel(template.style || "Other"),
    tags: uniqueStrings((template.tags || []).map(normalizeTag)).filter(Boolean),
    image_urls: uniqueStrings(template.image_urls || []),
    variables: Array.isArray(template.variables) ? template.variables : [],
    edit_mode: template.edit_mode === "both" ? "both" : "direct_only",
    final_prompt: normalizeText(template.final_prompt || ""),
    slug: normalizeText(template.slug || slugifyFromTitle(template.title)),
  };

  const fp = simpleHash(JSON.stringify({
    source_url: normalized.source_url,
    prompt_template: normalized.prompt_template,
    image_urls: normalized.image_urls,
  }));

  if (dayData.fingerprints.includes(fp)) {
    return { duplicated: true, dayData, count: dayData.templates.length };
  }

  dayData.templates.push(normalized);
  dayData.fingerprints.push(fp);
  store[dayKey] = dayData;
  await saveDayStore(store);

  return { duplicated: false, dayData, count: dayData.templates.length };
}

async function exportDay(dayKey) {
  const settings = await getSettings();
  const store = await getDayStore();
  const dayData = store[dayKey] || { templates: [], fingerprints: [] };

  const subdir = sanitizeSubdir(settings.exportSubdir);
  const filename = `${subdir}/${dayKey}.json`;

  const payload = buildJsonPayload(dayData.templates);
  const pretty = `${JSON.stringify(payload, null, 2)}\n`;
  const dataUrl = `data:application/json;charset=utf-8;base64,${utf8ToBase64(pretty)}`;

  const downloadId = await new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename,
        saveAs: false,
        conflictAction: "overwrite",
      },
      (id) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(id);
      },
    );
  }).catch(() => new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url: dataUrl,
        filename,
        saveAs: false,
      },
      (id) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        resolve(id);
      },
    );
  }));

  await saveLastExport({
    dayKey,
    filename,
    downloadId,
    exportedAt: new Date().toISOString(),
  });

  return { filename, downloadId, count: dayData.templates.length };
}

async function showDownloadedFile(downloadId) {
  await new Promise((resolve, reject) => {
    chrome.downloads.show(downloadId, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}

async function showDefaultDownloadsFolder() {
  chrome.downloads.showDefaultFolder();
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (!msg || !msg.type) return;

  (async () => {
    if (msg.type === "GET_STATUS") {
      const dayKey = getLocalDayString();
      const settings = await getSettings();
      const store = await getDayStore();
      const count = (store[dayKey]?.templates || []).length;
      sendResponse({ ok: true, dayKey, count, settings });
      return;
    }

    if (msg.type === "SAVE_SETTINGS") {
      const prev = await getSettings();
      const next = {
        ...prev,
        exportSubdir: sanitizeSubdir(msg.settings?.exportSubdir || prev.exportSubdir),
        openAIBaseUrl: normalizeText(msg.settings?.openAIBaseUrl || prev.openAIBaseUrl || DEFAULT_SETTINGS.openAIBaseUrl).replace(/\/+$/, "") || DEFAULT_SETTINGS.openAIBaseUrl,
        openAIApiKey: normalizeText(msg.settings?.openAIApiKey || prev.openAIApiKey || ""),
        openAIModel: normalizeText(msg.settings?.openAIModel || prev.openAIModel || DEFAULT_SETTINGS.openAIModel) || DEFAULT_SETTINGS.openAIModel,
      };
      await saveSettings(next);
      sendResponse({ ok: true, settings: next });
      return;
    }

    if (msg.type === "UPSERT_TEMPLATE_AND_EXPORT") {
      const bundle = msg.bundle;
      if (!bundle || !Array.isArray(bundle.tweets) || bundle.tweets.length === 0) {
        sendResponse({ ok: false, error: "Invalid tweet bundle." });
        return;
      }

      const settings = await getSettings();
      const sourceFingerprint = await buildSourceFingerprint(bundle);
      const extracted = await callOpenAICompatibleExtractor(bundle, settings);
      const dayKey = getLocalDayString();

      if (!extracted.hasPrompt || !extracted.templates.length) {
        const store = await getDayStore();
        const count = (store[dayKey]?.templates || []).length;
        sendResponse({
          ok: true,
          noPrompt: true,
          reason: extracted.reason || "No prompt found in main tweet or first 100 replies.",
          dayKey,
          count,
          extracted: [],
        });
        return;
      }

      const upsertResults = [];
      for (const template of extracted.templates) {
        const mergedTemplate = {
          ...template,
          source_fingerprint: sourceFingerprint,
        };
        // eslint-disable-next-line no-await-in-loop
        const upsert = await upsertTemplateForDay(dayKey, mergedTemplate);
        upsertResults.push({ template: mergedTemplate, upsert });
      }

      const exported = await exportDay(dayKey);
      const addedCount = upsertResults.filter((item) => !item.upsert.duplicated).length;

      sendResponse({
        ok: true,
        dayKey,
        duplicated: addedCount === 0,
        count: exported.count,
        filename: exported.filename,
        downloadId: exported.downloadId,
        extracted: upsertResults.map((item) => item.template),
      });
      return;
    }

    if (msg.type === "EXPORT_TODAY") {
      const dayKey = getLocalDayString();
      const exported = await exportDay(dayKey);
      sendResponse({ ok: true, dayKey, ...exported });
      return;
    }

    if (msg.type === "OPEN_JSON_DIRECTORY") {
      const last = await getLastExport();
      if (last && Number.isInteger(last.downloadId)) {
        try {
          await showDownloadedFile(last.downloadId);
          sendResponse({ ok: true, message: `Opened ${last.filename}` });
          return;
        } catch (_err) {
          // Fall through to default folder if the previous download cannot be shown.
        }
      }

      await showDefaultDownloadsFolder();
      sendResponse({ ok: true, message: "Opened Downloads folder." });
      return;
    }

    sendResponse({ ok: false, error: `Unknown message type: ${msg.type}` });
  })().catch((err) => {
    sendResponse({ ok: false, error: err instanceof Error ? err.message : "Unknown extension error." });
  });

  return true;
});
