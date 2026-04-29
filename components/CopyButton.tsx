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
      className="rounded-lg border border-white/20 bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
    >
      {copied ? "Copied" : "Copy Prompt"}
    </button>
  );
}
