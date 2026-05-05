import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { resolveLocale, t } from "../../utils/i18n";
import type { PromptTemplateEditMode } from "../../utils/promptTemplates";

type VariableInput = { key: string; description: string; example: string };

const inputClass = "w-full rounded-xl border border-night-700 bg-night-950/60 px-3 py-2 text-sm text-night-100 outline-none transition placeholder:text-night-600 focus:border-glow-500/50 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]";

async function readApiResponse(res: Response): Promise<{ data: Record<string, unknown>; raw: string }> {
  const raw = await res.text();
  if (!raw) return { data: {}, raw: "" };
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return { data: parsed, raw };
  } catch {
    return { data: {}, raw };
  }
}

const NewPromptPage: NextPage = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const dict = t(locale);
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const { isLoaded, isSignedIn } = useAuth();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [style, setStyle] = useState("");
  const [editMode, setEditMode] = useState<PromptTemplateEditMode>("both");
  const [author, setAuthor] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [finalPrompt, setFinalPrompt] = useState("");
  const [variables, setVariables] = useState<VariableInput[]>([]);
  const [imagesBase64, setImagesBase64] = useState<string[]>([]);
  const [imageUrlsText, setImageUrlsText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [adminChecked, setAdminChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const pageText = useMemo(() => dict.promptNewPage, [dict]);

  useEffect(() => {
    let cancelled = false;
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/me");
        const data = await res.json() as { isAdmin?: boolean };
        if (!cancelled) {
          setIsAdmin(Boolean(data.isAdmin));
          setAdminChecked(true);
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          setAdminChecked(true);
        }
      }
    }
    void checkAdmin();
    return () => { cancelled = true; };
  }, []);

  function addVariable() {
    setVariables((prev) => [...prev, { key: "", description: "", example: "" }]);
  }

  function updateVariable(index: number, patch: Partial<VariableInput>) {
    setVariables((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  }

  function removeVariable(index: number) {
    setVariables((prev) => prev.filter((_, i) => i !== index));
  }

  async function toBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImages(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const b64 = await Promise.all(files.map((f) => toBase64(f)));
    setImagesBase64(b64.filter(Boolean));
  }

  async function handleSubmit() {
    setError("");
    setOk("");
    setSubmitting(true);
    try {
      const payload = {
        title,
        desc,
        prompt_template: promptTemplate,
        tags: tagsText.split(",").map((s) => s.trim()).filter(Boolean),
        author,
        source_url: sourceUrl,
        style,
        edit_mode: editMode,
        final_prompt: finalPrompt,
        variables: variables.filter((v) => v.key.trim()).map((v) => ({
          key: v.key.trim(),
          description: v.description.trim(),
          example: v.example.trim(),
        })),
        imagesBase64,
        imageUrls: imageUrlsText
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const { data, raw } = await readApiResponse(res);
      const errorMsg = typeof data.error === "string"
        ? data.error
        : (raw || `HTTP ${res.status}`);
      if (!res.ok || data.error) {
        throw new Error(errorMsg);
      }
      setOk(pageText.success);
      if (typeof data.slug === "string" && data.slug) {
        setTimeout(() => {
          void router.push(`/prompts/${data.slug}`);
        }, 800);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleImportJson(file: File | null) {
    if (!file) return;
    setError("");
    setOk("");
    setImporting(true);
    try {
      const text = await file.text();
      let parsed: unknown;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error(pageText.invalidJson);
      }

      const res = await fetch("/api/prompts/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const { data, raw } = await readApiResponse(res);
      const errorMsg = typeof data.error === "string"
        ? data.error
        : (raw || `HTTP ${res.status}`);
      if (!res.ok || data.error) {
        throw new Error(errorMsg);
      }

      const successCount = Number(data.successCount ?? 0);
      const failedCount = Number(data.failedCount ?? 0);
      setOk(
        `${pageText.importDonePrefix}${successCount}${pageText.importDoneMiddle}${failedCount}${pageText.importDoneSuffix}`,
      );
      if (failedCount > 0 && Array.isArray(data.result)) {
        const firstError = data.result.find((r: { ok?: boolean; error?: string }) => !r.ok && r.error)?.error;
        if (firstError) setError(firstError);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  }

  return (
    <>
      <Head>
        <title>{pageText.title}</title>
        <meta name="description" content={pageText.desc} />
      </Head>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-2xl border border-night-700 bg-night-900/70 p-5 sm:p-6">
          <h1 className="font-display text-3xl font-semibold italic text-night-50">{pageText.title}</h1>
          <p className="mt-2 text-sm text-night-400">{pageText.desc}</p>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-night-400">Title</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-night-400">Desc</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} className={`${inputClass} min-h-[96px]`} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-night-400">Prompt Template</label>
              <textarea value={promptTemplate} onChange={(e) => setPromptTemplate(e.target.value)} className={`${inputClass} min-h-[140px] font-mono text-xs`} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-night-400">Style</label>
              <input value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-night-400">{pageText.editModeLabel}</label>
              <select value={editMode} onChange={(e) => setEditMode(e.target.value as PromptTemplateEditMode)} className={inputClass}>
                <option value="both">{pageText.editModeBoth}</option>
                <option value="direct_only">{pageText.editModeDirectOnly}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-night-400">Tags (comma)</label>
              <input value={tagsText} onChange={(e) => setTagsText(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-night-400">Author</label>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-night-400">Source URL</label>
              <input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-night-400">Final Prompt (optional)</label>
              <textarea value={finalPrompt} onChange={(e) => setFinalPrompt(e.target.value)} className={`${inputClass} min-h-[100px] font-mono text-xs`} />
            </div>

            <div className="md:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-xs text-night-400">Variables</label>
                <button type="button" onClick={addVariable} className="rounded-full border border-night-600 px-3 py-1 text-xs text-night-200">
                  + Variable
                </button>
              </div>
              <div className="space-y-2">
                {variables.map((v, i) => (
                  <div key={`var-${i}`} className="grid grid-cols-1 gap-2 rounded-xl border border-night-700 bg-night-950/50 p-2 md:grid-cols-4">
                    <input placeholder="key" value={v.key} onChange={(e) => updateVariable(i, { key: e.target.value })} className={inputClass} />
                    <input placeholder="description" value={v.description} onChange={(e) => updateVariable(i, { description: e.target.value })} className={inputClass} />
                    <input placeholder="example" value={v.example} onChange={(e) => updateVariable(i, { example: e.target.value })} className={inputClass} />
                    <button type="button" onClick={() => removeVariable(i)} className="rounded-xl border border-red-500/40 px-3 py-2 text-xs text-red-300">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-xs text-night-400">Images</label>
              <input type="file" accept="image/*" multiple onChange={(e) => { void handleImages(e.target.files); }} className={inputClass} />
              {imagesBase64.length > 0 && (
                <p className="mt-2 text-xs text-night-400">{imagesBase64.length} image(s) ready</p>
              )}
              <label className="mb-1 mt-3 block text-xs text-night-400">Image URLs (one per line)</label>
              <textarea
                value={imageUrlsText}
                onChange={(e) => setImageUrlsText(e.target.value)}
                placeholder={"https://example.com/a.jpg\nhttps://example.com/b.png"}
                className={`${inputClass} min-h-[96px] font-mono text-xs`}
              />
            </div>

            <div className="md:col-span-2 rounded-xl border border-night-700 bg-night-950/40 p-3">
              <p className="text-xs font-semibold text-night-200">{pageText.importTitle}</p>
              <p className="mt-1 text-xs text-night-500">{pageText.importHint}</p>
              <div className="mt-2 flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-full border border-night-600 px-3 py-1.5 text-xs text-night-200 transition hover:border-night-500">
                  <input
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    disabled={importing || !isAdmin}
                    onChange={(e) => { void handleImportJson(e.target.files?.[0] || null); e.currentTarget.value = ""; }}
                  />
                  {importing ? pageText.importing : pageText.importButton}
                </label>
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {ok && <p className="mt-4 text-sm text-emerald-400">{ok}</p>}

          <div className="mt-6">
            {hasClerkKey && isLoaded && !isSignedIn ? (
              <SignInButton mode="modal">
                <button type="button" className="rounded-full bg-glow-500 px-6 py-2.5 text-sm font-semibold text-night-950">
                  {pageText.signIn}
                </button>
              </SignInButton>
            ) : !adminChecked ? (
              <button
                type="button"
                disabled
                className="rounded-full bg-night-700 px-6 py-2.5 text-sm font-semibold text-night-300"
              >
                ...
              </button>
            ) : !isAdmin ? (
              <button
                type="button"
                disabled
                className="rounded-full bg-night-700 px-6 py-2.5 text-sm font-semibold text-night-300"
              >
                {pageText.forbidden}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { void handleSubmit(); }}
                disabled={submitting}
                className="rounded-full bg-glow-500 px-6 py-2.5 text-sm font-semibold text-night-950 disabled:opacity-60"
              >
                {submitting ? pageText.submitting : pageText.submit}
              </button>
            )}
          </div>
        </section>
      </main>
    </>
  );
};

export default NewPromptPage;
