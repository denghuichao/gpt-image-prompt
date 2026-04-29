import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Failed to copy prompt", error);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-full border border-night-600 px-5 py-2.5 text-sm font-semibold text-night-200 transition hover:border-night-500 hover:bg-night-800 hover:text-night-50"
    >
      {copied ? "✓ Copied" : "Copy Prompt"}
    </button>
  );
}
