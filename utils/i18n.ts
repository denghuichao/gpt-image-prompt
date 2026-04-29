export type AppLocale = "zh" | "en";

export interface I18nDict {
  siteName: string;
  nav: {
    home: string;
    gallery: string;
    build: string;
    pricing: string;
    blogs: string;
    signIn: string;
    clerkNotConfigured: string;
    searchTemplates: string;
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
  };
  landing: {
    badge: string;
    heroTitleLine1: string;
    heroTitleLine2: string;
    heroDesc: string;
    ctaGallery: string;
    ctaBuild: string;
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
    faqLabel: string;
    faqTitle: string;
    faqs: Array<{ q: string; a: string }>;
    trustLabel: string;
    trustTitle: string;
    trustItems: string[];
    trustDesc: string;
    bottomTitle: string;
    bottomDesc: string;
    bottomCta1: string;
    bottomCta2: string;
  };
  gallery: {
    title: string;
    description: string;
    noResults: string;
  };
  blogs: {
    title: string;
    heading: string;
    desc: string;
  };
  promptDetail: {
    titleSuffix: string;
    author: string;
    sourceUrl: string;
    promptTemplate: string;
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
  };
}

const EN: I18nDict = {
  siteName: "AI Image Prompt Hub",
  nav: {
    home: "home",
    gallery: "gallery",
    build: "build",
    pricing: "pricing",
    blogs: "blogs",
    signIn: "Sign in",
    clerkNotConfigured: "Clerk not configured",
    searchTemplates: "Search templates...",
    languageZh: "中文",
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
    title: "AI Image Prompt Hub",
    description:
      "AI Image Prompt Hub helps creators and teams build better AI image prompts with structured templates, searchable galleries, and professional build workflows.",
  },
  landing: {
    badge: "AI Image Prompt Operating System",
    heroTitleLine1: "Turn AI Prompting from",
    heroTitleLine2: "One-Off Tricks into a Reusable System",
    heroDesc:
      "AI Image Prompt Hub transforms prompts into team assets through structured templates, variable inputs, and a conversational build workflow for more consistent, controllable, and higher-quality visual output.",
    ctaGallery: "Explore Gallery",
    ctaBuild: "Open Build Workspace",
    valueCards: [
      {
        title: "Structured Prompt Assets",
        desc: "Each template is a maintainable JSON asset with variables, tags, examples, and source metadata.",
      },
      {
        title: "Conversation-Driven Build",
        desc: "Move from template to final prompt with variables, config tags, and reference images in one interface.",
      },
      {
        title: "Scalable Content System",
        desc: "Gallery, search, detail, and build are connected to support long-term team-level visual production.",
      },
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
        after:
          "Studio product image of {product_name} on {surface}. Use top softbox + side fill, neutral gradient background, 4:5 crop, high detail glass reflections, commercial clean look.",
        impact: "Higher visual consistency with fewer rework rounds.",
      },
      {
        title: "Standardized Social Portrait Series",
        scene: "Content team shooting city-themed portraits weekly",
        before: "portrait in city night, cinematic, neon",
        after:
          "Portrait of {subject} in {city_scene} at night. 85mm close composition, practical neon edge light, rain reflections, cinematic teal-orange grade, shallow DOF.",
        impact: "More coherent style and faster asset selection.",
      },
      {
        title: "Faster Concept Proposal Visuals",
        scene: "Architecture/interior teams in early concept reviews",
        before: "modern library interior concept",
        after:
          "Cutaway concept of {building_type} in {context}. Show {program_elements}, timber-concrete material palette, directional skylight, annotation-safe margins.",
        impact: "Faster communication with clearer review context.",
      },
    ],
    faqLabel: "FAQ",
    faqTitle: "FAQ",
    faqs: [
      { q: "How is this different from writing prompts directly?", a: "The key difference is structure and reusability. Prompts become assets that can be versioned, shared, and scaled." },
      { q: "Does it only work with one image model?", a: "No. The template and workflow layer is model-agnostic and can be used across Midjourney, FLUX, SD, and more." },
      { q: "Is onboarding difficult for new team members?", a: "No. Variable-driven templates and build flow let non-experts generate usable prompts quickly." },
      { q: "Can this evolve into a team knowledge base?", a: "Yes. Each template is an independent JSON unit, ideal for review, tagging, search, and governance." },
    ],
    trustLabel: "Trust",
    trustTitle: "Why This System Is Reliable",
    trustItems: [
      "100+ structured templates",
      "Template detail with variable highlights",
      "Conversational Build workspace",
      "Reference-image-aware context",
      "Copyable and traceable prompts",
      "Team-scale data architecture",
    ],
    trustDesc:
      "This is not a one-off prompt generator. It is long-term infrastructure for scalable AI image prompting.",
    bottomTitle: "Ready to Turn Prompts into Team Assets?",
    bottomDesc: "Start from the gallery and move into Build to establish your own production-grade prompting workflow.",
    bottomCta1: "Browse Gallery",
    bottomCta2: "Open Build",
  },
  gallery: {
    title: "Gallery | AI Image Prompt Hub",
    description:
      "Browse prompt templates in a waterfall gallery and search by tags, title, description, and prompt content.",
    noResults: "No templates found for",
  },
  blogs: {
    title: "Blogs | AI Image Prompt Hub",
    heading: "Blogs",
    desc:
      "Blogs page is reserved. You can publish prompt design methods, case breakdowns, and product updates here.",
  },
  promptDetail: {
    titleSuffix: "| AI Image Prompt Hub",
    author: "Author",
    sourceUrl: "Source URL",
    promptTemplate: "Prompt Template",
    finalPrompt: "Final Prompt",
    variables: "Variables",
    example: "Example",
    buildButton: "Build Image with Prompt",
  },
  build: {
    title: "Build | AI Image Prompt Hub",
    description:
      "Professional conversational AI image builder. Configure template variables, set generation options, and render outputs in a dialogue workflow.",
    promptBuilder: "Prompt Builder",
    promptTemplate: "Prompt Template",
    aspectRatio: "Aspect Ratio",
    quality: "Quality",
    minimalSettings: "Minimal settings for quick generation.",
    generateImage: "Generate Image",
    generating: "Generating...",
    dialogue: "Dialogue",
    templateLoaded: "Template loaded:",
    systemReady:
      "AI Image Builder is ready. Adjust variables and settings on the left panel, then click Generate Image.",
    generationDone:
      "Generation complete. Here are preview renders based on your final prompt.",
    expand: "Expand",
    collapse: "Collapse",
    referenceImages: "Reference Images",
    uploadRef: "Upload Ref",
    systemReadyChat:
      "Chat mode is ready. Describe what you want to generate, then click Generate Image.",
    chatPlaceholder:
      "Describe your image idea... include subject, style, lighting, composition, and any constraints.",
    qualityOptions: {
      draft: "Draft",
      standard: "Standard",
      high: "High",
      ultra: "Ultra",
    },
  },
};

const ZH: I18nDict = {
  siteName: "AI Image Prompt Hub",
  nav: {
    home: "首页",
    gallery: "模板库",
    build: "构建",
    pricing: "定价",
    blogs: "博客",
    signIn: "登录",
    clerkNotConfigured: "未配置 Clerk",
    searchTemplates: "搜索模板...",
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
    title: "AI Image Prompt Hub",
    description:
      "AI Image Prompt Hub：用结构化模板、可搜索模板库和专业构建流程，帮助创作者和团队更高质量地生成 AI 图像提示词。",
  },
  landing: {
    badge: "AI Image Prompt Operating System",
    heroTitleLine1: "让 AI Prompt 从“临时灵感”",
    heroTitleLine2: "升级为“可复用生产系统”",
    heroDesc:
      "AI Image Prompt Hub 通过模板化、变量化和对话式构建，把提示词从个人技巧转化为团队资产，帮你持续产出更稳定、更可控、更高质量的图像结果。",
    ctaGallery: "浏览模板库",
    ctaBuild: "进入 Build 工作台",
    valueCards: [
      {
        title: "结构化 Prompt 资产",
        desc: "每个模板都是可维护的 JSON 资产，包含变量、标签、示例和来源信息，便于复用与协作。",
      },
      {
        title: "对话式构建工作流",
        desc: "从模板到最终提示词，用变量表单、参数标签和参考图在一个界面内完成。",
      },
      {
        title: "可规模化的内容系统",
        desc: "模板库、搜索、详情、构建一体化，支持持续扩展到团队级视觉生产流程。",
      },
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
        after:
          "Studio product image of {product_name} on {surface}. Use top softbox + side fill, neutral gradient background, 4:5 crop, high detail glass reflections, commercial clean look.",
        impact: "出图一致性显著提升，返工轮次下降。",
      },
      {
        title: "社媒人像栏目标准化",
        scene: "内容团队每周多城市主题人像",
        before: "portrait in city night, cinematic, neon",
        after:
          "Portrait of {subject} in {city_scene} at night. 85mm close composition, practical neon edge light, rain reflections, cinematic teal-orange grade, shallow DOF.",
        impact: "风格更统一，选片效率更高。",
      },
      {
        title: "空间概念图快速提案",
        scene: "建筑/室内团队早期方案沟通",
        before: "modern library interior concept",
        after:
          "Cutaway concept of {building_type} in {context}. Show {program_elements}, timber-concrete material palette, directional skylight, annotation-safe margins.",
        impact: "概念沟通速度提升，评审信息更完整。",
      },
    ],
    faqLabel: "常见问题",
    faqTitle: "常见问题",
    faqs: [
      { q: "这个平台和“直接写 prompt”有什么区别？", a: "核心差异是结构化与可复用。这里把 prompt 变成模板资产，支持变量化输入、版本化维护和团队共享。" },
      { q: "是否只支持某一个生图模型？", a: "不是。模板层与工作流层是模型无关的，适合 Midjourney、FLUX、SD 等不同工具。" },
      { q: "新成员上手成本高吗？", a: "较低。通过模板详情与 Build 页面，非专家也能按变量快速生成可用提示词。" },
      { q: "后续可以扩展成团队知识库吗？", a: "可以。每个模板是独立 JSON，天然适合做审核、分类、搜索与权限管理。" },
    ],
    trustLabel: "可信能力",
    trustTitle: "为什么这套体系可靠",
    trustItems: [
      "100+ 结构化模板",
      "模板详情 + 变量高亮",
      "对话式 Build 工作台",
      "参考图上传与上下文记录",
      "Prompt 可复制与可追溯",
      "面向团队扩展的数据结构",
    ],
    trustDesc: "这不是单次 prompt 生成器，而是一套面向长期产出的 AI 图像提示词生产基础设施。",
    bottomTitle: "准备好把 Prompt 做成团队资产了吗？",
    bottomDesc: "从模板库开始，进入 Build 工作台，建立你自己的 AI 图像提示词标准流程。",
    bottomCta1: "立即浏览模板",
    bottomCta2: "打开 Build",
  },
  gallery: {
    title: "模板库 | AI Image Prompt Hub",
    description: "瀑布流浏览 Prompt 模板，并按标签、标题、描述和 Prompt 内容搜索。",
    noResults: "未找到匹配模板",
  },
  blogs: {
    title: "博客 | AI Image Prompt Hub",
    heading: "博客",
    desc: "博客页面已预留，你可以在这里发布 Prompt 设计方法、案例拆解和产品更新。",
  },
  promptDetail: {
    titleSuffix: "| AI Image Prompt Hub",
    author: "作者",
    sourceUrl: "来源链接",
    promptTemplate: "Prompt 模板",
    finalPrompt: "最终 Prompt",
    variables: "变量",
    example: "示例",
    buildButton: "用该 Prompt 生成图片",
  },
  build: {
    title: "构建 | AI Image Prompt Hub",
    description:
      "专业对话式 AI 绘图工作台。配置模板变量与参数，在对话流中生成并追踪提示词输出。",
    promptBuilder: "Prompt 构建器",
    promptTemplate: "Prompt 模板",
    aspectRatio: "画幅比例",
    quality: "质量",
    minimalSettings: "常规参数已简化，便于快速出图。",
    generateImage: "生成图片",
    generating: "生成中...",
    dialogue: "对话",
    templateLoaded: "已加载模板：",
    systemReady: "AI Image Builder 已就绪。请在左侧调整变量与参数，然后点击“生成图片”。",
    generationDone: "生成完成。以下是基于最终提示词的预览结果。",
    expand: "展开",
    collapse: "收起",
    referenceImages: "参考图片",
    uploadRef: "上传参考图",
    systemReadyChat: "聊天模式已就绪。请直接描述你要生成的画面，然后点击“生成图片”。",
    chatPlaceholder: "描述你的图像需求... 可包含主体、风格、光线、构图与限制条件。",
    qualityOptions: {
      draft: "草稿",
      standard: "标准",
      high: "高质量",
      ultra: "超清",
    },
  },
};

export function resolveLocale(input?: string): AppLocale {
  return input === "en" ? "en" : "zh";
}

export function t(locale?: string): I18nDict {
  return resolveLocale(locale) === "en" ? EN : ZH;
}
