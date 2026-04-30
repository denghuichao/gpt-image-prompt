import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { ArrowDownTrayIcon, SparklesIcon, UserIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";
import { getPromptTemplates, type PromptTemplate } from "../utils/promptTemplates";
import { absoluteUrl, buildHrefLang } from "../utils/seo";
const ASPECT_RATIOS = ["auto", "21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21"] as const;

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  tags?: string[];
  images?: string[];
  referenceImages?: Array<{ name: string; url: string }>;
  loading?: boolean;
  transient?: boolean;
};

type VariableDef = { key: string; description?: string; example?: string };

function extractVariableDefs(template: PromptTemplate | undefined): VariableDef[] {
  if (!template) return [];
  if (template.variables && template.variables.length > 0) {
    return template.variables.map((v) => ({ key: v.key, description: v.description, example: v.example }));
  }
  const keys = new Set<string>();
  const regex = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(template.prompt_template)) !== null) {
    const key = match[1] ? match[1].trim() : "";
    if (key) keys.add(key);
  }
  return Array.from(keys).map((key) => ({ key }));
}

function fillPrompt(templatePrompt: string, values: Record<string, string>): string {
  let output = templatePrompt;
  for (const [key, value] of Object.entries(values)) {
    output = output.split(`{${key}}`).join(value.trim() || `{${key}}`);
  }
  return normalizePromptText(output);
}

function keyLabel(key: string): string {
  return key.replace(/[_-]+/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizePromptText(input: string) {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n");
}

function renderHighlightedPromptTemplate(templatePrompt: string) {
  const parts = normalizePromptText(templatePrompt).split(/(\{[^}]+\})/g);
  return parts.map((part, idx) => {
    if (!/^\{[^}]+\}$/.test(part)) {
      return <span key={`t-${idx}`} className="text-night-300">{part}</span>;
    }
    return (
      <span key={`v-${idx}`} className="rounded bg-glow-500/15 px-1 font-semibold text-glow-300">
        {part}
      </span>
    );
  });
}

function resolveImageGridColsClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  return "grid-cols-3";
}

function resolveImageGalleryWidthClass(count: number) {
  if (count <= 1) return "w-1/2";
  return "w-full";
}

function shouldUseSquareImageTiles(count: number) {
  return count >= 4;
}

const selectClass = "w-full rounded-xl border border-night-700 bg-night-950/60 px-3 py-2 font-mono text-xs text-night-100 outline-none transition focus:border-glow-500/50 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]";
const inputClass  = "w-full rounded-xl border border-night-700 bg-night-950/60 px-3 py-2 text-sm text-night-100 outline-none transition placeholder:text-night-600 focus:border-glow-500/50 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]";

const BuildPage: NextPage<{ templates: PromptTemplate[] }> = ({ templates }) => {
  const router = useRouter();
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const locale = resolveLocale(router.locale);
  const localeTyped = locale === "en" ? "en" : "zh";
  const canonical = absoluteUrl("/build", localeTyped);
  const hreflangs = buildHrefLang("/build");
  const dict = t(locale);
  const templateSlug = typeof router.query.template === "string" ? router.query.template : "";
  const isTemplateMode = Boolean(templateSlug);

  const activeTemplate = useMemo(
    () => (isTemplateMode ? templates.find((t) => t.slug === templateSlug) || templates[0] : undefined),
    [templates, templateSlug, isTemplateMode],
  );
  const templateKey = isTemplateMode ? activeTemplate?.slug || templateSlug : "default";
  const variableDefs = useMemo(() => extractVariableDefs(activeTemplate), [activeTemplate]);

  const [variableValues, setVariableValues]         = useState<Record<string, string>>({});
  const [ratio, setRatio]                           = useState("auto");
  const [isGenerating, setIsGenerating]             = useState(false);
  const [generateError, setGenerateError]           = useState<string>("");
  const [isTemplateInfoExpanded, setIsTemplateInfoExpanded] = useState(false);
  const [chatInput, setChatInput]                   = useState("");
  const [referenceImages, setReferenceImages]       = useState<Array<{ name: string; url: string }>>([]);
  const [activeReferencePreview, setActiveReferencePreview] = useState<string>("");
  const [activeGeneratedPreviewImages, setActiveGeneratedPreviewImages] = useState<string[]>([]);
  const [activeGeneratedPreviewIndex, setActiveGeneratedPreviewIndex] = useState<number>(-1);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);
  const [hasLoadedConversation, setHasLoadedConversation] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const initialMessages = useMemo<ChatMessage[]>(() => {
    return [];
  }, []);

  useEffect(() => {
    if (!isTemplateMode || !activeTemplate) return;
    const nextValues: Record<string, string> = {};
    for (const v of extractVariableDefs(activeTemplate)) nextValues[v.key] = v.example || "";
    setVariableValues(nextValues);
    setReferenceImages([]);
    setActiveReferencePreview("");
  }, [activeTemplate, isTemplateMode]);

  useEffect(() => {
    if (isTemplateMode) return;
    setReferenceImages([]);
    setActiveReferencePreview("");
  }, [isTemplateMode]);

  useEffect(() => {
    if (!templateKey || (isTemplateMode && !activeTemplate)) return;
    let cancelled = false;
    setHasLoadedConversation(false);

    async function load() {
      try {
        const res = await fetch(`/api/conversations?templateKey=${encodeURIComponent(templateKey)}`);
        if (!res.ok) throw new Error();
        const payload = await res.json();
        const stored = payload?.conversation?.messages;
        if (!cancelled) {
          const normalized = Array.isArray(stored)
            ? stored
              .map((m: ChatMessage) => ({ ...m, transient: false }))
              .filter((m: ChatMessage) => m.role !== "system")
            : [];
          setMessages(normalized.length > 0 ? normalized : initialMessages);
          setHasLoadedConversation(true);
        }
      } catch {
        if (!cancelled) { setMessages(initialMessages); setHasLoadedConversation(true); }
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [activeTemplate, initialMessages, isTemplateMode, templateKey]);

  useEffect(() => {
    if (!isTemplateMode || !activeTemplate || !hasLoadedConversation) return;
    const introId = `assistant-template-intro-${activeTemplate.slug}`;
    setMessages((prev) => {
      const sampleImages = (activeTemplate.images || []).slice(0, 9);
      const introTemplate = dict.build.templateIntro
        .replace("{title}", activeTemplate.title)
        .replace("{count}", String(sampleImages.length));
      const introText = `${introTemplate} ${dict.build.templateIntroTail}`.trim();
      const introTags = [
        activeTemplate.style || dict.common.uncategorized,
        ...(activeTemplate.tags || []).slice(0, 5).map((tag) => `#${tag}`),
      ];
      const introMessage: ChatMessage = {
        id: introId,
        role: "assistant",
        content: introText,
        tags: introTags,
        images: sampleImages,
        transient: false,
      };
      const withoutIntro = prev.filter((m) => m.id !== introId);
      return [
        introMessage,
        ...withoutIntro,
      ];
    });
  }, [isTemplateMode, activeTemplate, hasLoadedConversation, dict.build.templateIntro, dict.build.templateIntroTail, dict.common.uncategorized]);

  const finalPrompt = useMemo(() => {
    if (!activeTemplate) return "";
    return fillPrompt(activeTemplate.prompt_template, variableValues);
  }, [activeTemplate, variableValues]);

  function handleVariableChange(key: string, value: string) {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  }

  function replaceLoadingAssistantWithFinal(
    list: ChatMessage[],
    pendingId: string,
    patch: Partial<ChatMessage>,
  ) {
    const finalMessage: ChatMessage = {
      id: pendingId,
      role: "assistant",
      content: patch.content ?? "",
      tags: patch.tags,
      images: patch.images,
      referenceImages: patch.referenceImages,
      loading: false,
      transient: false,
    };

    const withoutLoading = list.filter((m) => !(m.role === "assistant" && m.loading));
    return [...withoutLoading, finalMessage];
  }

  async function handleGenerate() {
    if (hasClerkKey && authLoaded && !isSignedIn) {
      setGenerateError(dict.build.signInFirst);
      return;
    }

    const promptToSend = isTemplateMode ? finalPrompt : chatInput;
    if (!promptToSend.trim()) return;
    const configTags = [
      `${dict.build.aspectRatio}:${ratio}`,
      "GPT Image 2",
    ];
    const reqId = Date.now();
    const userMsgId = `user-${reqId}`;
    const pendingMsgId = `assistant-pending-${reqId}`;
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        role: "user",
        content: promptToSend,
        tags: configTags,
        referenceImages: referenceImages.map((i) => ({ name: i.name, url: i.url })),
      },
      {
        id: pendingMsgId,
        role: "assistant",
        content: dict.build.generating,
        tags: configTags,
        loading: true,
        transient: true,
      },
    ]);
    setIsGenerating(true);
    setGenerateError("");

    let referenceImageBase64: string | undefined;
    if (referenceImages[0]?.url) {
      try {
        const blob = await fetch(referenceImages[0].url).then((r) => r.blob());
        referenceImageBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch { /* skip reference image if conversion fails */ }
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToSend, ratio, referenceImageBase64 }),
      });
      const data = await res.json() as {
        images?: string[];
        data?: Array<{ url?: string; b64_json?: string }>;
        output?: Array<{ url?: string; b64_json?: string }>;
        error?: string;
        credits?: { balance?: number };
      };
      if (!res.ok || data.error) {
        const errMsg = data.error ?? `Error ${res.status}`;
        setGenerateError(errMsg);
        setMessages((prev) =>
          replaceLoadingAssistantWithFinal(prev, pendingMsgId, {
            content: `${dict.build.generationFailedPrefix}: ${errMsg}`,
            tags: configTags,
          }),
        );
      } else {
        const parsedImages = (() => {
          if (Array.isArray(data.images) && data.images.length > 0) return data.images.filter(Boolean);
          const arr = data.data ?? data.output ?? [];
          return arr
            .map((d) => (d?.b64_json ? `data:image/png;base64,${d.b64_json}` : (d?.url ?? "")))
            .filter(Boolean);
        })();

        if (typeof data.credits?.balance === "number") {
          void fetch("/api/credits", { cache: "no-store" }).catch(() => {});
        }
        setMessages((prev) =>
          replaceLoadingAssistantWithFinal(prev, pendingMsgId, {
            content: parsedImages.length > 0 ? dict.build.generationDone : dict.build.generationSucceededNoImage,
            images: parsedImages,
            tags: configTags,
          }),
        );
        if (!isTemplateMode) setChatInput("");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      setGenerateError(errMsg);
      setMessages((prev) =>
        replaceLoadingAssistantWithFinal(prev, pendingMsgId, {
          content: `${dict.build.generationFailedPrefix}: ${errMsg}`,
          tags: configTags,
        }),
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleReferenceUpload(file: File | null) {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setReferenceImages((prev) => { prev.forEach((i) => i?.url && URL.revokeObjectURL(i.url)); return [{ name: file.name, url: objectUrl }]; });
    setActiveReferencePreview(objectUrl);
  }

  function handleRemoveReferenceImage() {
    setReferenceImages((prev) => { prev.forEach((i) => i?.url && URL.revokeObjectURL(i.url)); return []; });
    setActiveReferencePreview("");
  }

  const activeGeneratedPreview =
    activeGeneratedPreviewIndex >= 0
      ? (activeGeneratedPreviewImages[activeGeneratedPreviewIndex] || "")
      : "";

  function openGeneratedPreview(images: string[], startIndex: number) {
    const validImages = images.filter(Boolean);
    if (!validImages.length) return;
    const nextIndex = Math.min(Math.max(startIndex, 0), validImages.length - 1);
    setActiveGeneratedPreviewImages(validImages);
    setActiveGeneratedPreviewIndex(nextIndex);
  }

  function closeGeneratedPreview() {
    setActiveGeneratedPreviewImages([]);
    setActiveGeneratedPreviewIndex(-1);
  }

  function showPrevGeneratedPreview() {
    setActiveGeneratedPreviewIndex((prev) => {
      if (prev < 0 || activeGeneratedPreviewImages.length === 0) return prev;
      return (prev - 1 + activeGeneratedPreviewImages.length) % activeGeneratedPreviewImages.length;
    });
  }

  function showNextGeneratedPreview() {
    setActiveGeneratedPreviewIndex((prev) => {
      if (prev < 0 || activeGeneratedPreviewImages.length === 0) return prev;
      return (prev + 1) % activeGeneratedPreviewImages.length;
    });
  }

  async function handleDownloadImage(src: string) {
    if (!src || isDownloadingImage) return;
    setIsDownloadingImage(true);
    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error("download failed");
      const blob = await res.blob();
      const ext = blob.type.includes("jpeg") || blob.type.includes("jpg")
        ? "jpg"
        : blob.type.includes("webp")
          ? "webp"
          : "png";
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = `generated-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      const link = document.createElement("a");
      link.href = src;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setIsDownloadingImage(false);
    }
  }

  useEffect(() => {
    if (!hasLoadedConversation || !templateKey) return;
    const timeout = window.setTimeout(async () => {
      try {
        const persistedMessages = messages
          .filter((m) => m.role !== "system")
          .map((m) => ({ ...m, transient: false }));
        await fetch("/api/conversations", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ templateKey, messages: persistedMessages }),
        });
      } catch { /* ignore */ }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [hasLoadedConversation, messages, templateKey]);

  useEffect(() => {
    if (!activeGeneratedPreview) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeGeneratedPreview();
      if (e.key === "ArrowLeft" && activeGeneratedPreviewImages.length > 1) showPrevGeneratedPreview();
      if (e.key === "ArrowRight" && activeGeneratedPreviewImages.length > 1) showNextGeneratedPreview();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeGeneratedPreview, activeGeneratedPreviewImages.length]);

  return (
    <>
      <Head>
        <title>{dict.build.title}</title>
        <meta name="description" content={dict.build.description} />
        <link rel="canonical" href={canonical} />
        {hreflangs.map((item) => (
          <link key={item.locale} rel="alternate" hrefLang={item.locale} href={item.href} />
        ))}
      </Head>

      <main className="mx-auto h-[calc(100vh-72px)] max-w-[1960px] px-4 py-4 sm:px-6 lg:px-8">
        <section className={`grid h-full min-h-0 grid-cols-1 gap-3 ${isTemplateMode ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" : ""}`}>

          {/* ── Left panel: Prompt Builder ──────────────────────────── */}
          {isTemplateMode && (
            <aside className="flex min-h-0 flex-col rounded-2xl border border-night-700 bg-night-900/80 shadow-card">
              <div className="shrink-0 border-b border-night-700/60 px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-night-500">
                  {dict.build.promptBuilder}
                </h2>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
                {activeTemplate && (
                  <>
                    {/* Template info accordion */}
                    <div className="mb-4 overflow-hidden rounded-xl border border-night-700 bg-night-800/60">
                      <button
                        type="button"
                        onClick={() => setIsTemplateInfoExpanded((p) => !p)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-night-700/40"
                      >
                        <p className="min-w-0 truncate font-display text-base font-semibold italic text-night-100">
                          {activeTemplate.title}
                        </p>
                        <span className="shrink-0 text-xs text-night-500 transition group-open:text-glow-400">
                          {isTemplateInfoExpanded ? dict.build.collapse : dict.build.expand}
                        </span>
                      </button>
                      {isTemplateInfoExpanded && (
                        <div className="border-t border-night-700/60 px-3 py-3">
                          <p className="text-xs leading-relaxed text-night-400">{activeTemplate.desc}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(activeTemplate.tags || []).slice(0, 5).map((tag) => (
                              <span key={`${activeTemplate.slug}-${tag}`} className="rounded-full border border-night-600/60 bg-night-950/60 px-2 py-0.5 font-mono text-[10px] text-night-400">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prompt template display */}
                    <div className="mb-4 rounded-xl border border-night-700 bg-night-950/60 p-3">
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
                        {dict.build.promptTemplate}
                      </p>
                      <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
                        {renderHighlightedPromptTemplate(activeTemplate.prompt_template)}
                      </p>
                    </div>

                    {/* Variable inputs */}
                    <div className="mb-4 space-y-3">
                      {variableDefs.map((v) => (
                        <div key={v.key}>
                          <label className="mb-1 block text-xs font-medium text-night-400">
                            {keyLabel(v.key)}
                          </label>
                          <input
                            value={variableValues[v.key] || ""}
                            onChange={(e) => handleVariableChange(v.key, e.target.value)}
                            placeholder={v.example || `{${v.key}}`}
                            className={inputClass}
                          />
                          {/* {v.description && (
                            <p className="mt-1 text-[11px] text-night-600">{v.description}</p>
                          )} */}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Generation config */}
                <div className="mb-4">
                  <label className="mb-1 block text-[11px] text-night-500">{dict.build.aspectRatio}</label>
                  <select value={ratio} onChange={(e) => setRatio(e.target.value)} className={selectClass}>
                    {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>

                {/* Reference images */}
                {isTemplateMode && (
                  <div className="mb-4">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-night-500">
                      {dict.build.referenceImages}
                    </p>
                    <label className="mb-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-night-600 bg-night-950/40 px-3 py-3 text-xs text-night-500 transition hover:border-glow-500/40 hover:text-night-300">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleReferenceUpload(e.target.files?.[0] || null)} />
                      <span className="text-base leading-none">+</span>
                      {dict.build.uploadRef}
                    </label>
                    {referenceImages.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-1.5">
                        {referenceImages.map((item, idx) => (
                          <button
                            key={`ref-${item.name}-${idx}`}
                            type="button"
                            onClick={() => setActiveReferencePreview(item.url)}
                            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-night-600 bg-night-800 px-2.5 py-1 text-xs text-night-300 transition hover:border-night-500"
                          >
                            <span className="text-night-500">▣</span>
                            <span className="max-w-[140px] truncate">{item.name}</span>
                            <span
                              className="ml-0.5 rounded-full px-0.5 text-night-600 hover:bg-night-700 hover:text-night-200"
                              role="button"
                              tabIndex={0}
                              onClick={(e) => { e.stopPropagation(); handleRemoveReferenceImage(); }}
                              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); handleRemoveReferenceImage(); } }}
                            >×</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {activeReferencePreview && (
                      <div className="overflow-hidden rounded-xl border border-night-700">
                        <Image src={activeReferencePreview} alt="Reference preview" width={1200} height={900} className="h-auto w-full object-cover" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Generate button */}
              <div className="shrink-0 border-t border-night-700/60 p-3">
                {hasClerkKey && authLoaded && !isSignedIn ? (
                  <SignInButton mode="modal">
                    <button
                      type="button"
                      className="w-full rounded-xl bg-glow-500 py-2.5 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400 hover:shadow-glow-md"
                    >
                      {dict.build.generateImage}
                    </button>
                  </SignInButton>
                ) : (
                  <button
                    type="button"
                    onClick={() => { void handleGenerate(); }}
                    disabled={isGenerating}
                    className="w-full rounded-xl bg-glow-500 py-2.5 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400 hover:shadow-glow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-night-950/60" />
                        {dict.build.generating}
                      </span>
                    ) : dict.build.generateImage}
                  </button>
                )}
              </div>
            </aside>
          )}

          {/* ── Right panel: Dialogue ────────────────────────────────── */}
          <section className="flex min-h-0 flex-col rounded-2xl border border-night-700 bg-night-900/80 shadow-card">
            <div className="shrink-0 border-b border-night-700/60 px-4 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-night-500">
                {dict.build.dialogue}
              </h2>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
              {messages.filter((m) => m.role !== "system").map((msg) => (
                <div key={msg.id} className={
                  msg.role === "user"
                      ? "flex justify-end"
                      : "flex justify-start"
                }>
                  <div className={
                    "max-w-[88%]"
                  }>
                    {msg.role !== "system" && (
                      <div className={`mb-1.5 flex items-center gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                        {msg.role === "assistant" && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-glow-500/30 bg-glow-500/10 text-glow-300">
                            <SparklesIcon className="h-3.5 w-3.5" />
                          </span>
                        )}
                        <span className={`text-[11px] font-medium ${msg.role === "user" ? "text-emerald-300" : "text-glow-300"}`}>
                          {msg.role === "user" ? dict.build.youLabel : dict.build.aiBotLabel}
                        </span>
                        {msg.role === "user" && (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/35 bg-emerald-500/20 text-emerald-100">
                            <UserIcon className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    )}

                    {msg.role !== "system" && (
                      <div className={
                        msg.role === "user"
                          ? "rounded-2xl rounded-br-md border border-emerald-400/30 bg-emerald-500/15 px-3 py-2.5 text-sm leading-relaxed text-emerald-50"
                          : "rounded-2xl rounded-bl-md border border-night-700/70 bg-night-800/80 px-3 py-2.5 text-sm leading-relaxed text-night-100"
                      }>
                        {!(msg.loading && (!msg.images || msg.images.length === 0)) && (
                          <p className="whitespace-pre-wrap break-words text-inherit">{normalizePromptText(msg.content)}</p>
                        )}

                        {msg.tags && msg.tags.length > 0 && !(msg.loading && (!msg.images || msg.images.length === 0)) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.tags.map((tag) => (
                              <span key={`${msg.id}-${tag}`} className="rounded-full border border-night-600/60 bg-night-950/60 px-2 py-0.5 font-mono text-[10px] text-night-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {msg.referenceImages && msg.referenceImages.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {msg.referenceImages.map((item, idx) => (
                              <button key={`${msg.id}-ref-${idx}`} type="button" onClick={() => setActiveReferencePreview(item.url)}
                                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-night-600 bg-night-800 px-2 py-0.5 font-mono text-[10px] text-night-300">
                                <span className="text-night-500">▣</span>
                                <span className="max-w-[160px] truncate">{item.name}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {msg.images && msg.images.length > 0 && (
                          <div className={`mt-3 mr-auto grid gap-2 ${resolveImageGridColsClass(msg.images.length)} ${resolveImageGalleryWidthClass(msg.images.length)}`}>
                            {msg.images.map((src, idx) => {
                              const useSquareTiles = shouldUseSquareImageTiles(msg.images.length);
                              return (
                              <div
                                key={`${msg.id}-img-${idx}`}
                                className="relative overflow-hidden rounded-xl border border-night-700 text-left transition hover:border-night-500"
                              >
                                <button type="button" onClick={() => openGeneratedPreview(msg.images || [], idx)} className="block w-full bg-night-900 text-left">
                                  {/* Use native img for generated assets to avoid host whitelist mismatch during gateway switching. */}
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={src}
                                    alt={`Generated preview ${idx + 1}`}
                                    className={useSquareTiles ? "aspect-square w-full object-cover" : "h-auto w-full object-contain"}
                                  />
                                </button>
                                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-night-950/75 to-transparent" />
                                <span className="absolute bottom-2 left-2 text-[10px] text-night-200">
                                  {dict.build.clickToPreview}
                                </span>
                                <span className="absolute bottom-2 right-2">
                                  <button
                                    type="button"
                                    onClick={() => { void handleDownloadImage(src); }}
                                    className="inline-flex items-center rounded-full border border-night-500 bg-night-900/90 px-2 py-0.5 text-[10px] text-night-100 transition hover:border-night-300"
                                  >
                                    <span className="inline-flex items-center gap-1">
                                      <ArrowDownTrayIcon className="h-2.5 w-2.5" />
                                      {dict.build.download}
                                    </span>
                                  </button>
                                </span>
                              </div>
                              );
                            })}
                          </div>
                        )}

                        {msg.loading && (!msg.images || msg.images.length === 0) && (
                          <div className="mt-1 inline-flex items-center gap-2 text-xs text-glow-300">
                            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-glow-400 border-t-transparent" />
                            {dict.build.generating}...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat mode input */}
            {!isTemplateMode && (
              <div className="shrink-0 border-t border-night-700/60 p-3">
                <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={dict.build.chatPlaceholder}
                  rows={4}
                  className="w-full resize-y rounded-xl border border-night-700 bg-night-950/60 px-3 py-2 text-sm text-night-100 outline-none transition placeholder:text-night-600 focus:border-glow-500/50 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
                />
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <select value={ratio} onChange={(e) => setRatio(e.target.value)} className={selectClass}>
                    {ASPECT_RATIOS.map((r) => <option key={r} value={r}>{dict.build.aspectRatio}: {r}</option>)}
                  </select>
                  {hasClerkKey && authLoaded && !isSignedIn ? (
                    <SignInButton mode="modal">
                      <button
                        type="button"
                        className="rounded-xl bg-glow-500 py-2 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400"
                      >
                        {dict.build.generateImage}
                      </button>
                    </SignInButton>
                  ) : (
                    <button
                      type="button"
                      onClick={() => { void handleGenerate(); }}
                      disabled={isGenerating}
                      className="rounded-xl bg-glow-500 py-2 text-sm font-semibold text-night-950 shadow-glow-sm transition hover:bg-glow-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGenerating ? dict.build.generating : dict.build.generateImage}
                    </button>
                  )}
                </div>
                {generateError && (
                  <p className="mt-2 text-xs text-red-400">{generateError}</p>
                )}
              </div>
            )}
          </section>
        </section>
      </main>

      {activeGeneratedPreview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-night-950/90 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            aria-label="Close preview"
            onClick={closeGeneratedPreview}
          />
          <div className="relative z-[121] max-h-[92vh] max-w-[92vw]">
            <button
              type="button"
              onClick={() => { void handleDownloadImage(activeGeneratedPreview); }}
              className="absolute right-12 top-2 rounded-full border border-night-600 bg-night-900/80 px-2.5 py-0.5 text-xs text-night-100 transition hover:border-night-400 disabled:opacity-60"
              aria-label={dict.build.downloadImageAria}
              disabled={isDownloadingImage}
            >
              <span className="inline-flex items-center gap-1">
                <ArrowDownTrayIcon className="h-3 w-3" />
                {isDownloadingImage ? dict.build.downloading : dict.build.download}
              </span>
            </button>
            <button
              type="button"
              onClick={closeGeneratedPreview}
              className="absolute right-2 top-2 rounded-full border border-night-600 bg-night-900/80 px-2 py-0.5 text-sm text-night-200 transition hover:border-night-400"
              aria-label="Close preview"
            >
              ×
            </button>
            {activeGeneratedPreviewImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevGeneratedPreview}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-night-600 bg-night-900/85 px-3 py-1.5 text-sm text-night-100 transition hover:border-night-400"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={showNextGeneratedPreview}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-night-600 bg-night-900/85 px-3 py-1.5 text-sm text-night-100 transition hover:border-night-400"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeGeneratedPreview} alt="Generated image preview" className="max-h-[92vh] max-w-[92vw] rounded-xl border border-night-700 object-contain" />
            {activeGeneratedPreviewImages.length > 1 && (
              <p className="mt-2 text-center text-xs text-night-300">
                {activeGeneratedPreviewIndex + 1} / {activeGeneratedPreviewImages.length}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default BuildPage;

export const getServerSideProps: GetServerSideProps = async () => {
  return { props: { templates: await getPromptTemplates() } };
}
