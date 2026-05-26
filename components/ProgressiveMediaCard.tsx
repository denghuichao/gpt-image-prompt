import type { ImgHTMLAttributes } from "react";
import { useEffect, useState } from "react";

type ProgressiveMediaCardProps = {
  src: string;
  alt: string;
  aspectClassName?: string;
  className?: string;
  fit?: "cover" | "contain";
  loadingLabel?: string;
  errorLabel?: string;
  onError?: () => void;
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt" | "onError" | "onLoad" | "className">;
  imageClassName?: string;
};

function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        fill="currentColor"
        d="M4.5 5.75A1.75 1.75 0 0 1 6.25 4h11.5A1.75 1.75 0 0 1 19.5 5.75v12.5A1.75 1.75 0 0 1 17.75 20H6.25A1.75 1.75 0 0 1 4.5 18.25zm2 .2v12.1h11V5.95zM8 10.5a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5m8.8 7.05-3.2-3.95-2.2 2.7-1.5-1.8-3.1 3.05z"
      />
    </svg>
  );
}

function resolvePreviewSrc(src: string) {
  if (!src.startsWith("/prompt_images/") || src.startsWith("/prompt_images/preview/")) {
    return src;
  }
  return src.replace("/prompt_images/", "/prompt_images/preview/");
}

export default function ProgressiveMediaCard({
  src,
  alt,
  aspectClassName = "aspect-[4/5]",
  className = "",
  fit = "cover",
  loadingLabel = "Loading image",
  errorLabel = "Image unavailable",
  onError,
  imgProps,
  imageClassName = "",
}: ProgressiveMediaCardProps) {
  const resolvedSrc = src ? resolvePreviewSrc(src) : "";
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(resolvedSrc ? "loading" : "error");

  useEffect(() => {
    setStatus(resolvedSrc ? "loading" : "error");
  }, [resolvedSrc]);

  const isLoaded = status === "loaded";
  const hasError = status === "error";

  return (
    <div
      className={`relative w-full overflow-hidden bg-night-900 ${aspectClassName} ${className}`}
      aria-busy={!isLoaded}
    >
      {resolvedSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...imgProps}
          src={resolvedSrc}
          alt={alt}
          loading={imgProps?.loading || "lazy"}
          decoding={imgProps?.decoding || "async"}
          onLoad={() => setStatus("loaded")}
          onError={() => {
            setStatus("error");
            onError?.();
          }}
          className={`absolute inset-0 h-full w-full transition duration-300 ${fit === "contain" ? "object-contain" : "object-cover"} ${isLoaded ? "opacity-100" : "opacity-0"} ${imageClassName}`}
        />
      )}

      <div
        className={`absolute inset-0 transition-opacity duration-300 ${isLoaded ? "pointer-events-none opacity-0" : "opacity-100"}`}
        role="status"
        aria-live="polite"
      >
        {hasError ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_56%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] px-4 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-night-700 bg-night-800/90 text-night-300 shadow-inner">
              <PlaceholderIcon />
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-night-300">
                {errorLabel}
              </p>
              <p className="text-[11px] leading-relaxed text-night-500">
                {alt}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex h-full w-full flex-col justify-end bg-[linear-gradient(180deg,rgba(15,23,42,0.08),rgba(15,23,42,0.42)_48%,rgba(2,6,23,0.92))] p-3">
            <div className="overflow-hidden rounded-xl border border-night-700/70 bg-night-800/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="h-3.5 w-20 rounded-full bg-night-700/90 animate-pulse" />
              <div className="mt-3 space-y-2">
                <div className="h-3 rounded-full bg-night-700/70 animate-pulse" />
                <div className="h-3 w-4/5 rounded-full bg-night-700/70 animate-pulse" />
                <div className="h-3 w-2/3 rounded-full bg-night-700/70 animate-pulse" />
              </div>
              <p className="mt-4 text-[11px] font-medium text-night-500">
                {loadingLabel}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
