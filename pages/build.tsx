import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { resolveLocale, t } from "../utils/i18n";
import { getPromptTemplates, type PromptTemplate } from "../utils/promptTemplates";

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  content: string;
  tags?: string[];
  images?: string[];
  referenceImages?: Array<{ name: string; url: string }>;
};

type VariableDef = {
  key: string;
  description?: string;
  example?: string;
};
type QualityKey = "draft" | "standard" | "high" | "ultra";

function extractVariableDefs(template: PromptTemplate | undefined): VariableDef[] {
  if (!template) {
    return [];
  }

  if (template.variables && template.variables.length > 0) {
    return template.variables.map((variable) => ({
      key: variable.key,
      description: variable.description,
      example: variable.example,
    }));
  }

  const keys = new Set<string>();
  const regex = /\{([^}]+)\}/g;
  let match: RegExpExecArray | null = null;
  while ((match = regex.exec(template.prompt_template)) !== null) {
    const key = match[1] ? match[1].trim() : "";
    if (key) {
      keys.add(key);
    }
  }

  return Array.from(keys).map((key) => ({ key }));
}

function fillPrompt(templatePrompt: string, values: Record<string, string>): string {
  let output = templatePrompt;
  for (const [key, value] of Object.entries(values)) {
    output = output.split(`{${key}}`).join(value.trim() || `{${key}}`);
  }
  return output;
}

function keyLabel(key: string): string {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function renderHighlightedPromptTemplate(templatePrompt: string) {
  const parts = templatePrompt.split(/(\{[^}]+\})/g);
  return parts.map((part, idx) => {
    const isVariable = /^\{[^}]+\}$/.test(part);
    if (!isVariable) {
      return (
        <span key={`text-${idx}`} className="text-white/90">
          {part}
        </span>
      );
    }

    return (
      <span
        key={`var-${idx}`}
        className="rounded-md border border-cyan-300/35 bg-cyan-400/15 px-1.5 py-0.5 font-semibold text-cyan-100"
      >
        {part}
      </span>
    );
  });
}

const BuildPage: NextPage<{ templates: PromptTemplate[] }> = ({ templates }) => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const templateSlug = typeof router.query.template === "string" ? router.query.template : "";
  const isTemplateMode = Boolean(templateSlug);

  const activeTemplate = useMemo(
    () => (isTemplateMode ? templates.find((template) => template.slug === templateSlug) || templates[0] : undefined),
    [templates, templateSlug, isTemplateMode],
  );
  const templateKey = isTemplateMode ? activeTemplate?.slug || templateSlug : "default";

  const variableDefs = useMemo(() => extractVariableDefs(activeTemplate), [activeTemplate]);

  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [ratio, setRatio] = useState("3:4");
  const [quality, setQuality] = useState<QualityKey>("high");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTemplateInfoExpanded, setIsTemplateInfoExpanded] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [referenceImages, setReferenceImages] = useState<Array<{ name: string; url: string }>>([]);
  const [activeReferencePreview, setActiveReferencePreview] = useState<string>("");
  const [hasLoadedConversation, setHasLoadedConversation] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-1",
      role: "system",
      content: dict.build.systemReady,
    },
  ]);

  const initialMessages = useMemo<ChatMessage[]>(() => {
    if (!isTemplateMode) {
      return [
        {
          id: "system-chat-1",
          role: "system",
          content: dict.build.systemReadyChat,
        },
      ];
    }

    const base: ChatMessage[] = [
      {
        id: "system-1",
        role: "system",
        content: dict.build.systemReady,
      },
    ];

    if (activeTemplate) {
      base.push({
        id: `template-system-${activeTemplate.slug}`,
        role: "system",
        content: `${dict.build.templateLoaded} ${activeTemplate.title}`,
        tags: [activeTemplate.style || dict.common.uncategorized, ...activeTemplate.tags.slice(0, 3)],
      });
    }

    return base;
  }, [
    activeTemplate,
    dict.build.systemReady,
    dict.build.systemReadyChat,
    dict.build.templateLoaded,
    dict.common.uncategorized,
    isTemplateMode,
  ]);

  useEffect(() => {
    if (!isTemplateMode) {
      return;
    }

    if (!activeTemplate) {
      return;
    }

    const nextValues: Record<string, string> = {};
    for (const variable of extractVariableDefs(activeTemplate)) {
      nextValues[variable.key] = variable.example || "";
    }

    setVariableValues(nextValues);
    setReferenceImages([]);
    setActiveReferencePreview("");
  }, [activeTemplate, isTemplateMode]);

  useEffect(() => {
    if (isTemplateMode) {
      return;
    }
    setReferenceImages([]);
    setActiveReferencePreview("");
  }, [isTemplateMode]);

  useEffect(() => {
    if (!templateKey || (isTemplateMode && !activeTemplate)) {
      return;
    }

    let isCancelled = false;

    async function loadConversation() {
      try {
        const response = await fetch(`/api/conversations?templateKey=${encodeURIComponent(templateKey)}`);
        if (!response.ok) {
          if (!isCancelled) {
            setMessages(initialMessages);
            setHasLoadedConversation(true);
          }
          return;
        }

        const payload = await response.json();
        const stored = payload?.conversation?.messages;
        if (!isCancelled) {
          if (Array.isArray(stored) && stored.length > 0) {
            setMessages(stored);
          } else {
            setMessages(initialMessages);
          }
          setHasLoadedConversation(true);
        }
      } catch {
        if (!isCancelled) {
          setMessages(initialMessages);
          setHasLoadedConversation(true);
        }
      }
    }

    setHasLoadedConversation(false);
    void loadConversation();

    return () => {
      isCancelled = true;
    };
  }, [
    activeTemplate,
    initialMessages,
    isTemplateMode,
    templateKey,
  ]);

  const finalPrompt = useMemo(() => {
    if (!activeTemplate) {
      return "";
    }
    return fillPrompt(activeTemplate.prompt_template, variableValues);
  }, [activeTemplate, variableValues]);

  function handleVariableChange(key: string, value: string) {
    setVariableValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleGenerate() {
    const promptToSend = isTemplateMode ? finalPrompt : chatInput;
    if (!promptToSend.trim()) {
      return;
    }

    const qualityLabel = dict.build.qualityOptions[quality] || quality;
    const configTags = [`${dict.build.aspectRatio}:${ratio}`, `${dict.build.quality}:${qualityLabel}`].filter(Boolean);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: promptToSend,
      tags: configTags,
      referenceImages: referenceImages.map((item) => ({ name: item.name, url: item.url })),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    window.setTimeout(() => {
      const outputs = (activeTemplate?.images || templates[0]?.images || []).slice(0, 2);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: dict.build.generationDone,
        tags: configTags,
        images: outputs,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsGenerating(false);
      if (!isTemplateMode) {
        setChatInput("");
      }
    }, 900);
  }

  const requiredReferenceImageCount = isTemplateMode
    ? Math.max(0, activeTemplate?.reference_image_count || 0)
    : 0;

  function handleReferenceUpload(slotIndex: number, file: File | null) {
    if (!file) {
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setReferenceImages((prev) => {
      const next = [...prev];
      next[slotIndex] = { name: file.name, url: objectUrl };
      return next;
    });
    setActiveReferencePreview(objectUrl);
  }

  function handleRemoveReferenceImage(slotIndex: number) {
    setReferenceImages((prev) => {
      const next = [...prev];
      const removed = next[slotIndex];
      if (removed?.url) {
        URL.revokeObjectURL(removed.url);
      }
      next[slotIndex] = undefined as never;
      return next.filter(Boolean);
    });
    setActiveReferencePreview("");
  }

  useEffect(() => {
    if (!hasLoadedConversation || !templateKey) {
      return;
    }

    const timeout = window.setTimeout(async () => {
      try {
        await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            templateKey,
            messages,
          }),
        });
      } catch {
        // Ignore save failures to avoid blocking the UI.
      }
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hasLoadedConversation, messages, templateKey]);

  return (
    <>
      <Head>
        <title>{dict.build.title}</title>
        <meta name="description" content={dict.build.description} />
      </Head>

      <main className="mx-auto h-[calc(100vh-72px)] max-w-[1960px] px-4 py-4 text-white sm:px-6 lg:px-8">
        <section
          className={`grid h-full min-h-0 grid-cols-1 gap-4 ${
            isTemplateMode ? "xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]" : ""
          }`}
        >
          {isTemplateMode && (
            <aside className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <h2 className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
                {dict.build.promptBuilder}
              </h2>

              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {activeTemplate && (
                  <>
                    <div className="mb-4 overflow-hidden rounded-xl border border-white/10 bg-black/25">
                      <button
                        type="button"
                        onClick={() => setIsTemplateInfoExpanded((prev) => !prev)}
                        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition hover:bg-white/5"
                      >
                        <p className="min-w-0 truncate text-sm font-semibold">{activeTemplate.title}</p>
                        <span className="text-xs text-white/55">
                          {isTemplateInfoExpanded ? dict.build.collapse : dict.build.expand}
                        </span>
                      </button>
                      {isTemplateInfoExpanded && (
                        <div className="border-t border-white/10 px-3 py-3">
                          <p className="text-xs text-white/65">{activeTemplate.desc}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {(activeTemplate.tags || []).slice(0, 5).map((tag) => (
                              <span
                                key={`${activeTemplate.slug}-${tag}`}
                                className="rounded-full border border-white/20 bg-black/30 px-2 py-0.5 text-[11px] text-white/75"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 rounded-xl border border-white/10 bg-black/25 p-3">
                      <p className="mb-1 text-xs uppercase tracking-[0.12em] text-white/50">{dict.build.promptTemplate}</p>
                      <p className="text-sm leading-relaxed">{renderHighlightedPromptTemplate(activeTemplate.prompt_template)}</p>
                    </div>

                    <div className="mb-4 space-y-3">
                      {variableDefs.map((variable) => (
                        <div key={variable.key}>
                          <label className="mb-1 block text-xs text-white/60">{keyLabel(variable.key)}</label>
                          <input
                            value={variableValues[variable.key] || ""}
                            onChange={(event) => handleVariableChange(variable.key, event.target.value)}
                            placeholder={variable.example || `{${variable.key}}`}
                            className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
                          />
                          {variable.description && (
                            <p className="mt-1 text-[11px] text-white/45">{variable.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-white/60">{dict.build.aspectRatio}</label>
                    <select
                      value={ratio}
                      onChange={(event) => setRatio(event.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
                    >
                      <option value="1:1">1:1</option>
                      <option value="3:4">3:4</option>
                      <option value="4:5">4:5</option>
                      <option value="16:9">16:9</option>
                      <option value="9:16">9:16</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs text-white/60">{dict.build.quality}</label>
                    <select
                      value={quality}
                      onChange={(event) => setQuality(event.target.value as QualityKey)}
                      className="w-full rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
                    >
                      <option value="draft">{dict.build.qualityOptions.draft}</option>
                      <option value="standard">{dict.build.qualityOptions.standard}</option>
                      <option value="high">{dict.build.qualityOptions.high}</option>
                      <option value="ultra">{dict.build.qualityOptions.ultra}</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <p className="text-xs text-white/45">{dict.build.minimalSettings}</p>
                  </div>
                </div>

                {requiredReferenceImageCount > 0 && (
                  <div className="mb-4 rounded-xl border border-white/10 bg-black/25 p-3">
                    <p className="mb-2 text-xs uppercase tracking-[0.12em] text-white/50">
                      {dict.build.referenceImages} ({requiredReferenceImageCount})
                    </p>

                    <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {Array.from({ length: requiredReferenceImageCount }).map((_, idx) => (
                        <label
                          key={`reference-upload-${idx}`}
                          className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-white/20 bg-black/25 px-3 py-2 text-xs text-white/70 transition hover:border-white/35 hover:text-white"
                        >
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => handleReferenceUpload(idx, event.target.files?.[0] || null)}
                          />
                          {dict.build.uploadRef} {idx + 1}
                        </label>
                      ))}
                    </div>

                    {referenceImages.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-2">
                        {referenceImages.map((item, idx) => (
                          <button
                            key={`reference-tag-${item.name}-${idx}`}
                            type="button"
                            onClick={() => setActiveReferencePreview(item.url)}
                            className="group inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/35 px-2.5 py-1 text-xs text-white/85 transition hover:border-white/35"
                          >
                            <span aria-hidden="true">🖼</span>
                            <span className="max-w-[150px] truncate">{item.name}</span>
                            <span
                              className="ml-1 rounded-full px-1 text-white/60 hover:bg-white/15 hover:text-white"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleRemoveReferenceImage(idx);
                              }}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  handleRemoveReferenceImage(idx);
                                }
                              }}
                            >
                              ×
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeReferencePreview && (
                      <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                        <Image
                          src={activeReferencePreview}
                          alt="Selected reference preview"
                          width={1200}
                          height={900}
                          className="h-auto w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="mt-3 w-full shrink-0 rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? dict.build.generating : dict.build.generateImage}
              </button>
            </aside>
          )}

          <section className="flex min-h-0 flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h2 className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
              {dict.build.dialogue}
            </h2>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-xl p-3 text-sm leading-relaxed ${
                    message.role === "system"
                      ? "border border-cyan-300/20 bg-cyan-400/10 text-cyan-100"
                      : message.role === "assistant"
                        ? "border border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                        : "border border-white/15 bg-white/5 text-white"
                  }`}
                >
                  <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-white/55">{message.role}</p>
                  <p>{message.content}</p>

                  {message.tags && message.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {message.tags.map((tag) => (
                        <span
                          key={`${message.id}-${tag}`}
                          className="rounded-full border border-white/20 bg-black/25 px-2 py-0.5 text-[11px] text-white/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {message.referenceImages && message.referenceImages.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.referenceImages.map((item, idx) => (
                        <button
                          key={`${message.id}-reference-${idx}`}
                          type="button"
                          onClick={() => setActiveReferencePreview(item.url)}
                          className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-black/25 px-2.5 py-1 text-xs text-white/85"
                        >
                          <span aria-hidden="true">🖼</span>
                          <span className="max-w-[170px] truncate">{item.name}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {message.images && message.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {message.images.map((src, idx) => (
                        <figure
                          key={`${message.id}-${src}-${idx}`}
                          className="overflow-hidden rounded-lg border border-white/10 bg-black/20"
                        >
                          <Image
                            src={src}
                            alt={`Generated preview ${idx + 1}`}
                            width={1200}
                            height={1600}
                            className="h-auto w-full object-cover"
                          />
                        </figure>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!isTemplateMode && (
              <div className="mt-3 shrink-0 rounded-xl border border-white/10 bg-black/20 p-3">
                <textarea
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder={dict.build.chatPlaceholder}
                  rows={4}
                  className="w-full resize-y rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
                />
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <select
                    value={ratio}
                    onChange={(event) => setRatio(event.target.value)}
                    className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
                  >
                    <option value="1:1">{dict.build.aspectRatio}: 1:1</option>
                    <option value="3:4">{dict.build.aspectRatio}: 3:4</option>
                    <option value="4:5">{dict.build.aspectRatio}: 4:5</option>
                    <option value="16:9">{dict.build.aspectRatio}: 16:9</option>
                    <option value="9:16">{dict.build.aspectRatio}: 9:16</option>
                  </select>
                  <select
                    value={quality}
                    onChange={(event) => setQuality(event.target.value as QualityKey)}
                    className="rounded-xl border border-white/15 bg-black/35 px-3 py-2 text-sm text-white outline-none focus:border-white/35"
                  >
                    <option value="draft">{dict.build.quality}: {dict.build.qualityOptions.draft}</option>
                    <option value="standard">{dict.build.quality}: {dict.build.qualityOptions.standard}</option>
                    <option value="high">{dict.build.quality}: {dict.build.qualityOptions.high}</option>
                    <option value="ultra">{dict.build.quality}: {dict.build.qualityOptions.ultra}</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="rounded-xl border border-white/15 bg-white px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isGenerating ? dict.build.generating : dict.build.generateImage}
                  </button>
                </div>
              </div>
            )}
          </section>
        </section>
      </main>
    </>
  );
};

export default BuildPage;

export async function getStaticProps() {
  return {
    props: {
      templates: getPromptTemplates(),
    },
  };
}
