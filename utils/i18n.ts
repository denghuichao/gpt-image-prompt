export type AppLocale = "zh" | "en";

export interface I18nDict {
  siteName: string;
  footer: {
    copyright: string;
    contactMe: string;
    privacyPolicy: string;
    termsOfService: string;
    xLabel: string;
  };
  nav: {
    home: string;
    gallery: string;
    build: string;
    pricing: string;
    blogs: string;
    signIn: string;
    currentCredits: string;
    buyCredits: string;
    newTemplate: string;
    clerkNotConfigured: string;
    searchTemplates: string;
    filter: string;
    filterTitle: string;
    filterType: string;
    filterTags: string;
    filterAllTypes: string;
    filterReset: string;
    filterApply: string;
    languageZh: string;
    languageEn: string;
  };
  common: {
    uncategorized: string;
    backToHome: string;
    backToTemplates: string;
    finalPromptPreview: string;
    sampleImages: string;
  };
  home: {
    title: string;
    description: string;
    seoDescription: string;
    seoKeywords: string;
  };
  landing: {
    heroEyebrow: string;
    heroTitle: string;
    heroTitleAccent: string;
    heroDesc: string;
    ctaGallery: string;
    ctaBuild: string;
    statTemplates: string;
    statTemplatesLabel: string;
    statStyles: string;
    statStylesLabel: string;
    statFree: string;
    statFreeLabel: string;
    problemLabel: string;
    problemTitle: string;
    problemDesc: string;
    problems: Array<{ title: string; desc: string }>;
    solutionLabel: string;
    solutionTitle: string;
    solutionDesc: string;
    features: Array<{ eyebrow: string; title: string; desc: string }>;
    howLabel: string;
    howTitle: string;
    howDesc: string;
    steps: Array<{ step: string; title: string; desc: string }>;
    galleryLabel: string;
    galleryTitle: string;
    galleryDesc: string;
    galleryCtaLabel: string;
    faqLabel: string;
    faqTitle: string;
    faqs: Array<{ q: string; a: string }>;
    bottomTitle: string;
    bottomDesc: string;
    bottomCta1: string;
    bottomCta2: string;
    badge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    valueCards: Array<{ title: string; desc: string }>;
    workflowLabel: string;
    workflowTitle: string;
    workflow: Array<{ step: string; title: string; desc: string }>;
    caseLabel: string;
    caseTitle: string;
    beforeLabel: string;
    afterLabel: string;
    caseStudies: Array<{
      title: string;
      scene: string;
      before: string;
      after: string;
      impact: string;
    }>;
    trustLabel: string;
    trustTitle: string;
    trustItems: string[];
    trustDesc: string;
    ctaPricing: string;
    pricingTitle: string;
    pricingDesc: string;
    pricingViewFull: string;
    pricingRecommended: string;
    bottomBuyCredits: string;
  };
  gallery: {
    title: string;
    description: string;
    noResults: string;
    viewTemplate: string;
    loading: string;
  };
  pricingPage: {
    title: string;
    metaDescription: string;
    missingCallbackSignature: string;
    confirmFailedPrefix: string;
    confirmFailed: string;
    confirmNetworkError: string;
    authTokenNotReady: string;
    networkRetry: string;
    createCheckoutFailed: string;
    planFeaturesToConfigure: string;
    purchaseSuccessful: string;
    checkoutCanceled: string;
    heading: string;
    subtitle: string;
    currentCredits: string;
    recommended: string;
    buyCredits: string;
    redirecting: string;
    freePlanHint: string;
  };
  blogs: {
    title: string;
    heading: string;
    desc: string;
    empty: string;
    readMore: string;
    publishedOn: string;
    backToBlogs: string;
    notFoundTitle: string;
    notFoundDesc: string;
  };
  promptDetail: {
    titleSuffix: string;
    author: string;
    sourceUrl: string;
    promptTemplate: string;
    gallery: string;
    finalPrompt: string;
    variables: string;
    example: string;
    buildButton: string;
  };
  build: {
    title: string;
    description: string;
    promptBuilder: string;
    promptTemplate: string;
    aspectRatio: string;
    quality: string;
    minimalSettings: string;
    generateImage: string;
    generating: string;
    dialogue: string;
    templateLoaded: string;
    systemReady: string;
    generationDone: string;
    expand: string;
    collapse: string;
    referenceImages: string;
    uploadRef: string;
    systemReadyChat: string;
    chatPlaceholder: string;
    qualityOptions: {
      draft: string;
      standard: string;
      high: string;
      ultra: string;
    };
    signInFirst: string;
    clickToPreview: string;
    download: string;
    downloading: string;
    downloadImageAria: string;
    generationConfig: string;
    generationFailedPrefix: string;
    generationSucceededNoImage: string;
    youLabel: string;
    aiBotLabel: string;
    makePrivate: string;
    makePublic: string;
    privateLabel: string;
    templateIntro: string;
    templateIntroTail: string;
    promptModeVariables: string;
    promptModeDirect: string;
    directPromptLabel: string;
  };
  promptNewPage: {
    title: string;
    desc: string;
    submit: string;
    submitting: string;
    signIn: string;
    success: string;
    forbidden: string;
    importTitle: string;
    importHint: string;
    importing: string;
    importButton: string;
    invalidJson: string;
    importDonePrefix: string;
    importDoneMiddle: string;
    importDoneSuffix: string;
  };
  privacyPage: {
    title: string;
    metaDescription: string;
    legalBadge: string;
    lastUpdated: string;
    sectionCollectTitle: string;
    collectItems: string[];
    sectionUseTitle: string;
    sectionUseBody: string;
    sectionThirdPartyTitle: string;
    sectionThirdPartyBody: string;
    sectionUpdatesTitle: string;
    sectionUpdatesBody: string;
    contactTitle: string;
    contactBodyPrefix: string;
  };
  termsPage: {
    title: string;
    metaDescription: string;
    legalBadge: string;
    lastUpdated: string;
    sectionAcceptanceTitle: string;
    sectionAcceptanceBody: string;
    sectionBillingTitle: string;
    billingItems: string[];
    sectionAllowedUseTitle: string;
    sectionAllowedUseBody: string;
    sectionChangesTitle: string;
    sectionChangesBody: string;
    contactTitle: string;
    contactBodyPrefix: string;
  };
}

const EN: I18nDict = {
  siteName: "AI Image Prompt Gallery",
  footer: {
    copyright: "© AI Image Prompt Gallery",
    contactMe: "Contact Me:",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    xLabel: "X",
  },
  nav: {
    home: "home",
    gallery: "gallery",
    build: "build",
    pricing: "pricing",
    blogs: "blogs",
    signIn: "Sign in",
    currentCredits: "Current Credits",
    buyCredits: "Buy Credits",
    newTemplate: "New Template",
    clerkNotConfigured: "Clerk not configured",
    searchTemplates: "Search templates...",
    filter: "Filter",
    filterTitle: "Filters",
    filterType: "Type",
    filterTags: "Tags",
    filterAllTypes: "All types",
    filterReset: "Reset",
    filterApply: "Apply",
    languageZh: "\u4e2d\u6587",
    languageEn: "EN",
  },
  common: {
    uncategorized: "Uncategorized",
    backToHome: "Back to home",
    backToTemplates: "Back to templates",
    finalPromptPreview: "Final Prompt Preview",
    sampleImages: "Sample Images",
  },
  home: {
    title: "AI Image Prompt Gallery",
    description:
      "AI Image Prompt Gallery helps creators and teams build better AI image prompts with structured templates, searchable galleries, and professional build workflows.",
    seoDescription:
      "AI Image Prompt Gallery for GPT Image 2 (GTP image 2) and Nano Banana workflows. Discover structured prompt templates, searchable gallery, and professional build flow.",
    seoKeywords:
      "GPT Image 2, GTP image 2, Nano Banana, AI image prompt, prompt template, prompt gallery, image generation, prompt engineering",
  },
  landing: {
    heroEyebrow: "AI Image Prompt System",
    heroTitle: "Better AI Images Start with",
    heroTitleAccent: "Better Prompts",
    heroDesc: "A growing library of thousands of structured prompt templates for AI image generation — browse, customize variables, and build production-ready prompts in seconds.",
    ctaGallery: "Browse Templates",
    ctaBuild: "Try Build",
    statTemplates: "thousands of",
    statTemplatesLabel: "Prompt Templates",
    statStyles: "10",
    statStylesLabel: "Style Categories",
    statFree: "Free",
    statFreeLabel: "to Browse",
    problemLabel: "The Problem",
    problemTitle: "Why most AI images look generic",
    problemDesc: "Writing effective prompts is harder than it looks. Most people repeat the same vague descriptions and wonder why results feel random.",
    problems: [
      { title: "Vague one-liners", desc: '"a portrait photo, cinematic" — missing the specifics that actually drive quality.' },
      { title: "No structure to reuse", desc: "Every session starts from scratch. Good results can't be reproduced or shared." },
      { title: "No reference system", desc: "Without a library, there's no way to build on what works or share across a team." },
    ],
    solutionLabel: "The Solution",
    solutionTitle: "Structured templates that actually work",
    solutionDesc: "Each template is a production-tested prompt with named variables, style metadata, and example outputs — so you know exactly what you're getting.",
    features: [
      {
        eyebrow: "Template Library",
        title: "thousands of curated prompt templates",
        desc: "Organized by style — portrait, product, architecture, concept art, and more. Every template includes variables, tags, sample images, and a ready-to-use final prompt.",
      },
      {
        eyebrow: "Variable System",
        title: "Fill in the blanks, not the whole prompt",
        desc: "Templates use named placeholders like {subject} and {city_scene}. Change what matters, keep what works. No prompt engineering required.",
      },
      {
        eyebrow: "Build Workspace",
        title: "From template to generation in one screen",
        desc: "Select a template, fill variables, set aspect ratio and quality, upload a reference image — then generate. Your session history is saved automatically.",
      },
    ],
    howLabel: "How it works",
    howTitle: "From zero to great prompt in 4 steps",
    howDesc: "No prompt engineering expertise needed. Pick a template and follow the flow.",
    steps: [
      { step: "01", title: "Browse the gallery", desc: "Search thousands of templates by style, tag, or keyword. Every card shows a sample image." },
      { step: "02", title: "Open the template", desc: "See the prompt structure, variables, and examples. Understand what drives the output." },
      { step: "03", title: "Customize in Build", desc: "Fill your variables, choose aspect ratio and quality, add a reference image if needed." },
      { step: "04", title: "Generate & iterate", desc: "Review your output. Tweak variables and regenerate until you get exactly what you want." },
    ],
    galleryLabel: "Template Gallery",
    galleryTitle: "See what's possible",
    galleryDesc: "A sample of templates across different styles. Click any card to see the full prompt.",
    galleryCtaLabel: "View all templates",
    faqLabel: "FAQ",
    faqTitle: "Common questions",
    faqs: [
      { q: "Is this free to use?", a: "Browsing all templates and copying prompts is completely free. AI image generation in Build will be a paid feature." },
      { q: "What image models does this work with?", a: "Templates work with any text-to-image model — Midjourney, FLUX, Stable Diffusion, GPT Image, Gemini, and more." },
      { q: "Do I need to know how to write prompts?", a: "No. Just pick a template, fill in the variables, and you'll have a production-ready prompt." },
      { q: "Can my team use this together?", a: "Yes. Templates are shareable, and the library is designed to grow into a team-level prompt knowledge base." },
    ],
    bottomTitle: "Start generating better images today",
    bottomDesc: "Browse thousands of prompt templates for free. No sign-up required.",
    bottomCta1: "Browse Templates",
    bottomCta2: "Try Build",
    badge: "AI Image Prompt Operating System",
    heroTitleLine1: "Turn AI Prompting from",
    heroTitleLine2: "One-Off Tricks into a Reusable System",
    valueCards: [
      { title: "Structured Prompt Assets", desc: "Each template is a maintainable JSON asset with variables, tags, examples, and source metadata." },
      { title: "Conversation-Driven Build", desc: "Move from template to final prompt with variables, config tags, and reference images in one interface." },
      { title: "Scalable Content System", desc: "Gallery, search, detail, and build are connected to support long-term team-level visual production." },
    ],
    workflowLabel: "Workflow",
    workflowTitle: "A 4-Step Workflow from Idea to Production Prompt",
    workflow: [
      { step: "01", title: "Discover", desc: "Search the gallery by tag, title, description, and prompt content." },
      { step: "02", title: "Understand", desc: "Inspect variables, style, source, and examples in the template detail page." },
      { step: "03", title: "Customize", desc: "Fill variables, set generation options, and upload reference images in Build." },
      { step: "04", title: "Iterate", desc: "Use dialogue logs and config tags to refine quality and consistency." },
    ],
    caseLabel: "Case Studies",
    caseTitle: "Real-World Prompt Standardization Cases",
    beforeLabel: "Before",
    afterLabel: "After",
    caseStudies: [
      {
        title: "E-commerce Product Visuals at Scale",
        scene: "Consumer brand producing 40+ SKU visuals weekly",
        before: "a product photo of perfume bottle, nice lighting, white background",
        after: "Studio product image of {product_name} on {surface}. Use top softbox + side fill, neutral gradient background, 4:5 crop, high detail glass reflections, commercial clean look.",
        impact: "Higher visual consistency with fewer rework rounds.",
      },
      {
        title: "Standardized Social Portrait Series",
        scene: "Content team shooting city-themed portraits weekly",
        before: "portrait in city night, cinematic, neon",
        after: "Portrait of {subject} in {city_scene} at night. 85mm close composition, practical neon edge light, rain reflections, cinematic teal-orange grade, shallow DOF.",
        impact: "More coherent style and faster asset selection.",
      },
      {
        title: "Faster Concept Proposal Visuals",
        scene: "Architecture/interior teams in early concept reviews",
        before: "modern library interior concept",
        after: "Cutaway concept of {building_type} in {context}. Show {program_elements}, timber-concrete material palette, directional skylight, annotation-safe margins.",
        impact: "Faster communication with clearer review context.",
      },
    ],
    trustLabel: "Trust",
    trustTitle: "Why This System Is Reliable",
    trustItems: [
      "thousands of structured templates",
      "Template detail with variable highlights",
      "Conversational Build workspace",
      "Reference-image-aware context",
      "Copyable and traceable prompts",
      "Team-scale data architecture",
    ],
    trustDesc: "This is not a one-off prompt generator. It is long-term infrastructure for scalable AI image prompting.",
    ctaPricing: "View Pricing",
    pricingTitle: "Credit Packs",
    pricingDesc: "Browse templates for free and get 3 signup credits. Buy more credits only when needed.",
    pricingViewFull: "View Full Pricing",
    pricingRecommended: "Recommended",
    bottomBuyCredits: "Buy Credits",
  },
  gallery: {
    title: "Gallery | AI Image Prompt Gallery",
    description: "Browse prompt templates in a waterfall gallery and search by tags, title, description, and prompt content.",
    noResults: "No templates found for",
    viewTemplate: "View Template",
    loading: "Loading...",
  },
  pricingPage: {
    title: "Pricing | AI Image Prompt Gallery",
    metaDescription: "Get 3 free signup credits, then buy one-time credit packs for AI image generation as needed.",
    missingCallbackSignature: "Missing callback signature or checkout id, cannot confirm payment.",
    confirmFailedPrefix: "Payment confirmation failed",
    confirmFailed: "Payment confirmation failed.",
    confirmNetworkError: "Network error during payment confirmation.",
    authTokenNotReady: "Auth token not ready. Please refresh and try again.",
    networkRetry: "Network error, please try again",
    createCheckoutFailed: "Failed to create checkout",
    planFeaturesToConfigure: "Plan features to be configured",
    purchaseSuccessful: "Purchase successful.",
    checkoutCanceled: "Checkout canceled.",
    heading: "Pricing",
    subtitle: "Template browsing is free. New users get 3 credits, then use 1 credit per image generation in Build.",
    currentCredits: "Current credits",
    recommended: "Recommended",
    buyCredits: "Buy Credits",
    redirecting: "Redirecting...",
    freePlanHint: "Free plan includes 3 signup credits and stays free for prompt browsing.",
  },
  blogs: {
    title: "Blogs | AI Image Prompt Gallery",
    heading: "Blogs",
    desc: "Prompt engineering notes, image workflow breakdowns, and product updates.",
    empty: "No published articles yet.",
    readMore: "Read article",
    publishedOn: "Published on",
    backToBlogs: "Back to blogs",
    notFoundTitle: "Article not found",
    notFoundDesc: "This article may be unpublished or removed.",
  },
  promptDetail: {
    titleSuffix: "| AI Image Prompt Gallery",
    author: "Author",
    sourceUrl: "Source URL",
    promptTemplate: "Prompt Template",
    gallery: "Gallery",
    finalPrompt: "Final Prompt",
    variables: "Variables",
    example: "Example",
    buildButton: "Build Image with Prompt",
  },
  build: {
    title: "Build | AI Image Prompt Gallery",
    description: "Professional conversational AI image builder. Configure template variables, set generation options, and render outputs in a dialogue workflow.",
    promptBuilder: "Prompt Builder",
    promptTemplate: "Prompt Template",
    aspectRatio: "Aspect Ratio",
    quality: "Quality",
    minimalSettings: "Minimal settings for quick generation.",
    generateImage: "Generate Image",
    generating: "Generating...",
    dialogue: "Dialogue",
    templateLoaded: "Template loaded:",
    systemReady: "AI Image Builder is ready. Adjust variables and settings on the left panel, then click Generate Image.",
    generationDone: "Generation complete. Here are preview renders based on your final prompt.",
    expand: "Expand",
    collapse: "Collapse",
    referenceImages: "Reference Images",
    uploadRef: "Upload Ref",
    systemReadyChat: "Chat mode is ready. Describe what you want to generate, then click Generate Image.",
    chatPlaceholder: "Describe your image idea... include subject, style, lighting, composition, and any constraints.",
    qualityOptions: {
      draft: "Draft",
      standard: "Standard",
      high: "High",
      ultra: "Ultra",
    },
    signInFirst: "Please sign in first.",
    clickToPreview: "Click to preview",
    download: "Download",
    downloading: "Downloading...",
    downloadImageAria: "Download image",
    generationConfig: "Generation Config",
    generationFailedPrefix: "Generation failed",
    generationSucceededNoImage: "Generation succeeded, but no displayable image was returned",
    youLabel: "You",
    aiBotLabel: "AI Image Bot",
    makePrivate: "Make Private",
    makePublic: "Make Public",
    privateLabel: "Private",
    templateIntro: "You are using \"{title}\". Here are {count} sample images to quickly understand style, composition, and lighting.",
    templateIntroTail: "Review them first, then fill variables on the left and generate.",
    promptModeVariables: "Variables",
    promptModeDirect: "Direct Edit",
    directPromptLabel: "Edit Prompt",
  },
  promptNewPage: {
    title: "New Prompt Template",
    desc: "Create and publish a prompt template to Supabase",
    submit: "Create Template",
    submitting: "Creating...",
    signIn: "Sign in to create",
    success: "Template created successfully",
    forbidden: "Admin only",
    importTitle: "Import JSON templates",
    importHint: "Upload one .json file (array or { templates: [...] })",
    importing: "Importing...",
    importButton: "Import JSON",
    invalidJson: "Invalid JSON file",
    importDonePrefix: "Import done: ",
    importDoneMiddle: " success, ",
    importDoneSuffix: " failed",
  },
  privacyPage: {
    title: "Privacy Policy",
    metaDescription: "Privacy Policy for AI Image Prompt Gallery.",
    legalBadge: "Legal",
    lastUpdated: "Last updated: April 30, 2026",
    sectionCollectTitle: "What We Collect",
    collectItems: [
      "Account information (such as your email from Clerk)",
      "Usage data for template browsing and image generation",
      "Transaction-related records for credit purchases",
    ],
    sectionUseTitle: "How We Use Data",
    sectionUseBody:
      "We use this data to provide authentication, template management, image generation, payment confirmation, and account credit balance display.",
    sectionThirdPartyTitle: "Third-Party Services",
    sectionThirdPartyBody:
      "Template images and generated images may be stored in Supabase Storage. Payment processing is handled by Creem. Authentication is handled by Clerk.",
    sectionUpdatesTitle: "Policy Updates",
    sectionUpdatesBody:
      "We do not sell your personal information. We may update this policy from time to time.",
    contactTitle: "Contact",
    contactBodyPrefix: "If you have questions, contact us at: ",
  },
  termsPage: {
    title: "Terms of Service",
    metaDescription: "Terms of Service for AI Image Prompt Gallery.",
    legalBadge: "Legal",
    lastUpdated: "Last updated: April 30, 2026",
    sectionAcceptanceTitle: "Acceptance of Terms",
    sectionAcceptanceBody:
      "By using AI Image Prompt Gallery, you agree to comply with these terms and all applicable laws.",
    sectionBillingTitle: "Credits & Billing",
    billingItems: [
      "Prompt template browsing is free.",
      "Image generation may require credits.",
      "Credit packs are one-time purchases.",
    ],
    sectionAllowedUseTitle: "Allowed Use",
    sectionAllowedUseBody:
      "Credits are consumed per generation request according to product rules. Misuse, abuse, or illegal content generation is prohibited.",
    sectionChangesTitle: "Service Changes",
    sectionChangesBody:
      "We may suspend accounts that violate these terms. Service functionality may change over time.",
    contactTitle: "Contact",
    contactBodyPrefix: "For support, contact: ",
  },
};

const ZH: I18nDict = {
  siteName: "AI Image Prompt Gallery",
  footer: {
    copyright: "© AI Image Prompt Gallery",
    contactMe: "联系我：",
    privacyPolicy: "隐私政策",
    termsOfService: "服务条款",
    xLabel: "X",
  },
  nav: {
    home: "首页",
    gallery: "画廊",
    build: "构建",
    pricing: "定价",
    blogs: "博客",
    signIn: "登录",
    currentCredits: "当前积分",
    buyCredits: "购买积分",
    newTemplate: "新建模版",
    clerkNotConfigured: "未配置 Clerk",
    searchTemplates: "搜索模板...",
    filter: "筛选",
    filterTitle: "筛选",
    filterType: "类型",
    filterTags: "标签",
    filterAllTypes: "全部类型",
    filterReset: "重置",
    filterApply: "应用",
    languageZh: "中文",
    languageEn: "EN",
  },
  common: {
    uncategorized: "未分类",
    backToHome: "返回首页",
    backToTemplates: "返回模板库",
    finalPromptPreview: "最终 Prompt 预览",
    sampleImages: "示例图片",
  },
  home: {
    title: "AI Image Prompt Gallery",
    description: "AI Image Prompt Gallery：用结构化模板、可搜索模板库和专业构建流程，帮助创作者和团队更高质量地生成 AI 图像提示词。",
    seoDescription:
      "AI Image Prompt Gallery，支持 GPT Image 2（GTP image 2）与 Nano Banana 热门生图工作流。提供结构化 Prompt 模板、可搜索画廊与专业化构建流程。",
    seoKeywords:
      "GPT Image 2, GTP image 2, Nano Banana, AI 图像提示词, Prompt 模板, 提示词画廊, 生图, 提示词工程",
  },
  landing: {
    heroEyebrow: "AI 生图 Prompt 系统",
    heroTitle: "更好的 AI 绘图，始于",
    heroTitleAccent: "更好的 Prompt",
    heroDesc: "持续增长的海量结构化 Prompt 模板库，覆盖主流 AI 生图场景 — 浏览、填写变量、一键生成高质量提示词。",
    ctaGallery: "浏览模板库",
    ctaBuild: "体验 Build",
    statTemplates: "海量",
    statTemplatesLabel: "Prompt 模板",
    statStyles: "10",
    statStylesLabel: "风格分类",
    statFree: "免费",
    statFreeLabel: "浏览全库",
    problemLabel: "痛点",
    problemTitle: "为什么大多数 AI 图像看起来很普通",
    problemDesc: "写出有效的 Prompt 比看起来难多了。大多数人反复用模糊描述，却不明白为什么结果总是差强人意。",
    problems: [
      { title: "描述太模糊", desc: "一张人像，电影感——缺少真正影响质量的关键细节。" },
      { title: "无法复用", desc: "每次都从零开始，好结果无法重现，更无法分享给团队。" },
      { title: "没有参考体系", desc: "没有模板库，就无法积累哪些 Prompt 有效，也无法团队协作。" },
    ],
    solutionLabel: "解决方案",
    solutionTitle: "真正有效的结构化模板",
    solutionDesc: "每个模板都是经过实战验证的提示词，含命名变量、风格标签和示例图 — 你能清楚知道会得到什么。",
    features: [
      {
        eyebrow: "模板库",
        title: "海量精选 Prompt 模板",
        desc: "按风格分类 — 人像、产品、建筑、概念艺术等。每个模板包含变量、标签、示例图和可直接使用的最终 Prompt。",
      },
      {
        eyebrow: "变量系统",
        title: "填空，而不是从头写",
        desc: "模板使用 {subject}、{city_scene} 等命名占位符。改掉需要改的，保留有效的部分。无需懂 Prompt 工程。",
      },
      {
        eyebrow: "Build 工作台",
        title: "从模板到生图，一个界面搞定",
        desc: "选模板、填变量、设置画幅和质量、上传参考图，然后生成。对话历史自动保存。",
      },
    ],
    howLabel: "使用流程",
    howTitle: "4 步从零到完美 Prompt",
    howDesc: "无需任何 Prompt 工程经验。挑一个模板，跟着流程走就行。",
    steps: [
      { step: "01", title: "浏览模板库", desc: "按风格、标签或关键词搜索海量模板，每张卡片都有示例图。" },
      { step: "02", title: "查看模板详情", desc: "了解 Prompt 结构、变量和示例，清楚知道这个模板能产出什么。" },
      { step: "03", title: "在 Build 中定制", desc: "填写变量、选择画幅和质量，如有需要可上传参考图。" },
      { step: "04", title: "生成并迭代", desc: "查看输出效果，调整变量后重新生成，直到得到你想要的结果。" },
    ],
    galleryLabel: "模板展示",
    galleryTitle: "看看能做什么",
    galleryDesc: "来自不同风格的部分模板展示。点击任意卡片查看完整 Prompt。",
    galleryCtaLabel: "查看全部模板",
    faqLabel: "常见问题",
    faqTitle: "常见问题",
    faqs: [
      { q: "使用是免费的吗？", a: "浏览所有模板和复制 Prompt 完全免费。Build 中的 AI 生图功能将是付费功能。" },
      { q: "支持哪些生图模型？", a: "模板适用于任何文生图模型 — Midjourney、FLUX、Stable Diffusion、GPT Image、Gemini 等。" },
      { q: "需要懂 Prompt 写法吗？", a: "不需要。选一个模板，填写变量，就能得到一个可用的生产级 Prompt。" },
      { q: "团队可以一起用吗？", a: "可以。模板可共享，模板库的设计也支持扩展成团队级 Prompt 知识库。" },
    ],
    bottomTitle: "现在就开始生成更好的图像",
    bottomDesc: "免费浏览海量Prompt 模板，无需注册。",
    bottomCta1: "浏览模板库",
    bottomCta2: "体验 Build",
    badge: "AI Image Prompt Operating System",
    heroTitleLine1: "让 AI Prompt 从临时灵感",
    heroTitleLine2: "升级为可复用生产系统",
    valueCards: [
      { title: "结构化 Prompt 资产", desc: "每个模板都是可维护的 JSON 资产，包含变量、标签、示例和来源信息，便于复用与协作。" },
      { title: "对话式构建工作流", desc: "从模板到最终提示词，用变量表单、参数标签和参考图在一个界面内完成。" },
      { title: "可规模化的内容系统", desc: "模板库、搜索、详情、构建一体化，支持持续扩展到团队级视觉生产流程。" },
    ],
    workflowLabel: "工作流",
    workflowTitle: "从需求到可执行 Prompt 的四步流程",
    workflow: [
      { step: "01", title: "发现模板", desc: "在 Gallery 按 tag、title、desc、prompt 内容检索最合适的模板。" },
      { step: "02", title: "理解结构", desc: "在详情页查看变量、风格、来源与示例图，快速判断适用场景。" },
      { step: "03", title: "填充变量", desc: "在 Build 中输入变量、配置参数、上传参考图，生成最终提示词。" },
      { step: "04", title: "迭代输出", desc: "通过对话消息与配置标签复盘效果，持续优化模型出图一致性。" },
    ],
    caseLabel: "案例",
    caseTitle: "真实场景下的 Prompt 标准化案例",
    beforeLabel: "之前",
    afterLabel: "之后",
    caseStudies: [
      {
        title: "电商产品图批量产出",
        scene: "某消费品牌周更 40+ SKU 宣传图",
        before: "a product photo of perfume bottle, nice lighting, white background",
        after: "Studio product image of {product_name} on {surface}. Use top softbox + side fill, neutral gradient background, 4:5 crop, high detail glass reflections, commercial clean look.",
        impact: "出图一致性显著提升，返工轮次下降。",
      },
      {
        title: "社媒人像栏目标准化",
        scene: "内容团队每周多城市主题人像",
        before: "portrait in city night, cinematic, neon",
        after: "Portrait of {subject} in {city_scene} at night. 85mm close composition, practical neon edge light, rain reflections, cinematic teal-orange grade, shallow DOF.",
        impact: "风格更统一，选片效率更高。",
      },
      {
        title: "空间概念图快速提案",
        scene: "建筑/室内团队早期方案沟通",
        before: "modern library interior concept",
        after: "Cutaway concept of {building_type} in {context}. Show {program_elements}, timber-concrete material palette, directional skylight, annotation-safe margins.",
        impact: "概念沟通速度提升，评审信息更完整。",
      },
    ],
    trustLabel: "可信能力",
    trustTitle: "为什么这套体系可靠",
    trustItems: [
      "海量结构化模板",
      "模板详情 + 变量高亮",
      "对话式 Build 工作台",
      "参考图上传与上下文记录",
      "Prompt 可复制与可追溯",
      "面向团队扩展的数据结构",
    ],
    trustDesc: "这不是单次 prompt 生成器，而是一套面向长期产出的 AI 图像提示词生产基础设施。",
    ctaPricing: "查看定价",
    pricingTitle: "积分套餐",
    pricingDesc: "模板浏览免费，注册即送 3 积分；仅在需要更多生图次数时购买积分。",
    pricingViewFull: "查看完整定价",
    pricingRecommended: "推荐",
    bottomBuyCredits: "购买积分",
  },
  gallery: {
    title: "模板库 | AI Image Prompt Gallery",
    description: "瀑布流浏览 Prompt 模板，并按标签、标题、描述和 Prompt 内容搜索。",
    noResults: "未找到匹配模板",
    viewTemplate: "查看模板",
    loading: "加载中...",
  },
  pricingPage: {
    title: "定价 | AI Image Prompt Gallery",
    metaDescription: "注册即送 3 积分；可按需购买一次性积分包用于 AI 生图。Prompt 模板浏览永久免费。",
    missingCallbackSignature: "缺少回调签名或 checkout id，无法确认支付。",
    confirmFailedPrefix: "支付确认失败",
    confirmFailed: "支付确认失败。",
    confirmNetworkError: "支付确认网络异常。",
    authTokenNotReady: "登录态令牌尚未就绪，请刷新页面后重试。",
    networkRetry: "网络错误，请稍后重试",
    createCheckoutFailed: "创建结算失败",
    planFeaturesToConfigure: "请在 pricing 配置中设置套餐功能",
    purchaseSuccessful: "购买成功。",
    checkoutCanceled: "已取消支付。",
    heading: "定价",
    subtitle: "模板浏览永久免费。新用户赠送 3 积分，Build 每次生图消耗 1 积分，用完后按需购买。",
    currentCredits: "当前积分",
    recommended: "推荐",
    buyCredits: "购买积分",
    redirecting: "跳转中...",
    freePlanHint: "免费方案含注册赠送 3 积分，且可持续用于模板浏览。",
  },
  blogs: {
    title: "博客 | AI Image Prompt Gallery",
    heading: "博客",
    desc: "围绕 Prompt 方法论、生图工作流拆解与产品更新的内容专栏。",
    empty: "暂无已发布文章。",
    readMore: "阅读文章",
    publishedOn: "发布时间",
    backToBlogs: "返回博客列表",
    notFoundTitle: "文章不存在",
    notFoundDesc: "这篇文章可能尚未发布或已删除。",
  },
  promptDetail: {
    titleSuffix: "| AI Image Prompt Gallery",
    author: "作者",
    sourceUrl: "来源链接",
    promptTemplate: "Prompt 模板",
    gallery: "画廊",
    finalPrompt: "最终 Prompt",
    variables: "变量",
    example: "示例",
    buildButton: "用该 Prompt 生成图片",
  },
  build: {
    title: "构建 | AI Image Prompt Gallery",
    description: "专业对话式 AI 绘图工作台。配置模板变量与参数，在对话流中生成并追踪提示词输出。",
    promptBuilder: "Prompt 构建器",
    promptTemplate: "Prompt 模板",
    aspectRatio: "画幅比例",
    quality: "质量",
    minimalSettings: "常规参数已简化，便于快速出图。",
    generateImage: "生成图片",
    generating: "生成中...",
    dialogue: "对话",
    templateLoaded: "已加载模板：",
    systemReady: "AI Image Builder 已就绪。请在左侧调整变量与参数，然后点击生成图片。",
    generationDone: "生成完成。以下是基于最终提示词的预览结果。",
    expand: "展开",
    collapse: "收起",
    referenceImages: "参考图片",
    uploadRef: "上传参考图",
    systemReadyChat: "聊天模式已就绪。请直接描述你要生成的画面，然后点击生成图片。",
    chatPlaceholder: "描述你的图像需求... 可包含主体、风格、光线、构图与限制条件。",
    qualityOptions: {
      draft: "草稿",
      standard: "标准",
      high: "高质量",
      ultra: "超清",
    },
    signInFirst: "请先登录。",
    clickToPreview: "点击预览",
    download: "下载",
    downloading: "下载中...",
    downloadImageAria: "下载图片",
    generationConfig: "生成参数",
    generationFailedPrefix: "生成失败",
    generationSucceededNoImage: "生成成功，但未返回可展示图片",
    youLabel: "你",
    aiBotLabel: "AI Image Bot",
    makePrivate: "设为私有",
    makePublic: "设为公开",
    privateLabel: "私有",
    templateIntro: "你当前使用的是「{title}」模板。下面是该模板的 {count} 张样例图，可快速了解风格、构图和光影。",
    templateIntroTail: "你可以先看样例，再在左侧填写变量并生成。",
    promptModeVariables: "变量填写",
    promptModeDirect: "直接编辑",
    directPromptLabel: "提示词编辑",
  },
  promptNewPage: {
    title: "新增 Prompt 模版",
    desc: "创建并发布到 Supabase",
    submit: "创建模版",
    submitting: "创建中...",
    signIn: "登录后创建",
    success: "模版创建成功",
    forbidden: "仅管理员可用",
    importTitle: "导入 JSON 模版",
    importHint: "上传一个 .json 文件（数组或 { templates: [...] }）",
    importing: "导入中...",
    importButton: "导入 JSON",
    invalidJson: "JSON 文件格式错误",
    importDonePrefix: "导入完成：成功 ",
    importDoneMiddle: " 条，失败 ",
    importDoneSuffix: " 条",
  },
  privacyPage: {
    title: "隐私政策",
    metaDescription: "AI Image Prompt Gallery 的隐私政策。",
    legalBadge: "法律文档",
    lastUpdated: "最后更新：2026年4月30日",
    sectionCollectTitle: "我们收集的信息",
    collectItems: [
      "账户信息（如来自 Clerk 的邮箱）",
      "模板浏览与生图使用数据",
      "积分购买相关交易记录",
    ],
    sectionUseTitle: "数据使用方式",
    sectionUseBody:
      "这些数据用于身份验证、模板管理、生图服务、支付确认以及账户积分余额展示。",
    sectionThirdPartyTitle: "第三方服务",
    sectionThirdPartyBody:
      "模板图片和生成图片可能存储在 Supabase Storage。支付由 Creem 处理，身份认证由 Clerk 处理。",
    sectionUpdatesTitle: "政策更新",
    sectionUpdatesBody:
      "我们不会出售你的个人信息。我们可能会不时更新本政策。",
    contactTitle: "联系我们",
    contactBodyPrefix: "如有问题，请联系：",
  },
  termsPage: {
    title: "服务条款",
    metaDescription: "AI Image Prompt Gallery 的服务条款。",
    legalBadge: "法律文档",
    lastUpdated: "最后更新：2026年4月30日",
    sectionAcceptanceTitle: "条款接受",
    sectionAcceptanceBody:
      "使用 AI Image Prompt Gallery 即表示你同意遵守本条款及适用法律法规。",
    sectionBillingTitle: "积分与计费",
    billingItems: [
      "Prompt 模板浏览免费。",
      "生图功能可能需要积分。",
      "积分包为一次性购买。",
    ],
    sectionAllowedUseTitle: "使用规范",
    sectionAllowedUseBody:
      "积分按产品规则在生图请求时扣减。禁止滥用服务或生成违法违规内容。",
    sectionChangesTitle: "服务变更",
    sectionChangesBody:
      "如违反条款，我们可能暂停账户。服务功能可能随时间调整。",
    contactTitle: "联系我们",
    contactBodyPrefix: "如需支持，请联系：",
  },
};

export function resolveLocale(input?: string): AppLocale {
  return input === "en" ? "en" : "zh";
}

export function t(locale?: string): I18nDict {
  return resolveLocale(locale) === "en" ? EN : ZH;
}
