(() => {
  const MAX_TWEETS = 101;
  const MAX_SCROLL_PASSES = 18;
  const SCROLL_WAIT_MS = 700;

  let lastInteractedTweet = null;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeText(input) {
    return String(input || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  function findTweetArticleFromNode(node) {
    if (!node || !(node instanceof Element)) return null;
    return node.closest('article[data-testid="tweet"]');
  }

  function updateLastInteractedTweetFromEventTarget(target) {
    const article = findTweetArticleFromNode(target);
    if (article) lastInteractedTweet = article;
  }

  document.addEventListener("pointerdown", (e) => updateLastInteractedTweetFromEventTarget(e.target), true);
  document.addEventListener("mouseover", (e) => updateLastInteractedTweetFromEventTarget(e.target), true);

  function normalizeTweetUrl(urlLike) {
    if (!urlLike) return "";
    try {
      const u = new URL(urlLike, location.origin);
      const path = u.pathname.replace(/\/+$/, "");
      if (!/\/status\/\d+/.test(path)) return "";
      return `https://x.com${path}`;
    } catch {
      return "";
    }
  }

  function extractTweetUrl(article) {
    if (!article) return normalizeTweetUrl(location.href);
    const anchors = Array.from(article.querySelectorAll('a[href*="/status/"]'));
    for (const a of anchors) {
      const url = normalizeTweetUrl(a.getAttribute("href") || "");
      if (url) return url;
    }
    return normalizeTweetUrl(location.href);
  }

  function extractAuthorHandle(article, tweetUrl) {
    if (tweetUrl) {
      const m = tweetUrl.match(/^https:\/\/x\.com\/([^/]+)\/status\/\d+/i);
      if (m && m[1]) return `@${m[1]}`;
    }

    if (article) {
      const userNameLink = article.querySelector('[data-testid="User-Name"] a[href^="/"]');
      if (userNameLink) {
        const href = userNameLink.getAttribute("href") || "";
        const path = href.split("?")[0];
        const seg = path.split("/").filter(Boolean)[0] || "";
        if (seg && !seg.includes("status")) return `@${seg}`;
      }
    }

    return "@unknown";
  }

  function extractTweetText(article) {
    if (!article) return "";
    const nodes = Array.from(article.querySelectorAll('[data-testid="tweetText"]'));
    const parts = nodes.map((n) => normalizeText(n.innerText || "")).filter(Boolean);

    // Some prompt tweets place the actual prompt inside code blocks. Capture these
    // explicitly so downstream LLM extraction sees the complete prompt text.
    const codeParts = Array.from(article.querySelectorAll("pre, code"))
      .map((el) => normalizeText(el.innerText || ""))
      .filter((text) => text.length >= 8)
      .filter((text, idx, arr) => arr.indexOf(text) === idx)
      .filter((text) => !parts.some((p) => p.includes(text)));

    if (codeParts.length) {
      parts.push(codeParts.map((text) => `CODE_BLOCK:\n${text}`).join("\n\n"));
    }

    return parts.join("\n\n").trim();
  }

  function normalizeImageUrl(urlLike) {
    if (!urlLike) return "";
    try {
      const u = new URL(urlLike, location.origin);
      return u.toString();
    } catch {
      return "";
    }
  }

  function extractMediaUrls(article) {
    if (!article) return [];
    const urls = new Set();

    const imgs = Array.from(article.querySelectorAll("img[src]"));
    for (const img of imgs) {
      const src = img.getAttribute("src") || "";
      if (!src) continue;
      if (/profile_images|emoji|abs-0\.twimg\.com\//i.test(src)) continue;
      if (/twimg\.com|pbs\.twimg\.com/i.test(src)) {
        const normalized = normalizeImageUrl(src);
        if (normalized) urls.add(normalized);
      }
    }

    const videos = Array.from(article.querySelectorAll("video[poster]"));
    for (const video of videos) {
      const poster = video.getAttribute("poster") || "";
      if (!poster) continue;
      const normalized = normalizeImageUrl(poster);
      if (normalized) urls.add(normalized);
    }

    return Array.from(urls);
  }

  function extractCreatedAt(article) {
    if (!article) return "";
    const t = article.querySelector("time");
    return t?.getAttribute("datetime") || "";
  }

  function articleKey(tweet) {
    return tweet.tweet_url || `${tweet.author_handle}|${normalizeText(tweet.text).slice(0, 180)}|${tweet.created_at}`;
  }

  function collectTweetArticleData(article, index) {
    const tweetUrl = extractTweetUrl(article);
    const text = extractTweetText(article);
    const imageUrls = extractMediaUrls(article);
    return {
      index,
      tweet_url: tweetUrl,
      author_handle: extractAuthorHandle(article, tweetUrl),
      text,
      image_urls: imageUrls,
      created_at: extractCreatedAt(article),
      is_focus: false,
    };
  }

  function findFocusArticle() {
    if (lastInteractedTweet && document.contains(lastInteractedTweet)) {
      return lastInteractedTweet;
    }

    const onStatusPage = /\/status\/\d+/.test(location.pathname);
    if (onStatusPage) {
      const first = document.querySelector('article[data-testid="tweet"]');
      if (first) return first;
    }

    const all = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    if (!all.length) return null;

    const sorted = all
      .map((el) => ({ el, top: Math.abs(el.getBoundingClientRect().top) }))
      .sort((a, b) => a.top - b.top);
    return sorted[0]?.el || all[0] || null;
  }

  async function expandThreadRepliesBestEffort() {
    const onStatusPage = /\/status\/\d+/.test(location.pathname);
    if (!onStatusPage) return;

    const originalScrollY = window.scrollY;
    const originalScrollX = window.scrollX;
    const previousBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    try {
      let stableRounds = 0;
      let lastCount = 0;
      for (let pass = 0; pass < MAX_SCROLL_PASSES && stableRounds < 3; pass += 1) {
        const countBefore = document.querySelectorAll('article[data-testid="tweet"]').length;
        if (countBefore === lastCount) {
          stableRounds += 1;
        } else {
          stableRounds = 0;
        }
        lastCount = countBefore;

        window.scrollTo(0, document.body.scrollHeight);
        await sleep(SCROLL_WAIT_MS);
      }
    } finally {
      window.scrollTo(originalScrollX, originalScrollY);
      document.documentElement.style.scrollBehavior = previousBehavior;
      await sleep(200);
    }
  }

  async function collectThreadBundle() {
    await expandThreadRepliesBestEffort();

    const focusArticle = findFocusArticle();
    const allArticles = Array.from(document.querySelectorAll('article[data-testid="tweet"]'));
    const tweets = [];
    const seen = new Set();

    if (focusArticle) {
      const focusTweet = collectTweetArticleData(focusArticle, 0);
      focusTweet.is_focus = true;
      const key = articleKey(focusTweet);
      seen.add(key);
      tweets.push(focusTweet);
    }

    for (const article of allArticles) {
      if (tweets.length >= MAX_TWEETS) break;
      if (focusArticle && article === focusArticle) continue;
      const item = collectTweetArticleData(article, tweets.length);
      const key = articleKey(item);
      if (seen.has(key)) continue;
      seen.add(key);
      tweets.push(item);
      if (tweets.length >= MAX_TWEETS) break;
    }

    const pageUrl = normalizeTweetUrl(location.href) || location.href;
    const threadRoot = tweets[0]?.tweet_url || pageUrl;

    return {
      page_url: pageUrl,
      thread_url: threadRoot,
      focus_tweet_url: focusArticle ? extractTweetUrl(focusArticle) : "",
      tweets,
      captured_at: new Date().toISOString(),
    };
  }

  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (!msg || msg.type !== "CAPTURE_THREAD_RAW") return;

    (async () => {
      const bundle = await collectThreadBundle();
      if (!bundle.tweets.length) {
        sendResponse({ ok: false, error: "No tweet found on current page." });
        return;
      }
      sendResponse({ ok: true, bundle });
    })().catch((err) => {
      sendResponse({ ok: false, error: err instanceof Error ? err.message : "Failed to capture thread." });
    });

    return true;
  });
})();
