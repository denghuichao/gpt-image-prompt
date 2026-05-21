import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { useState } from "react";
import { resolveLocale } from "../utils/i18n";

type ChannelKind = "link" | "qr";
type Variant = "compact" | "cards";

type Channel = {
  id: string;
  label: string;
  description: string;
  actionLabel: string;
  kind: ChannelKind;
  href?: string;
  qrImageSrc?: string;
};

function XLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M18.244 2H21.5l-7.12 8.14L22 22h-5.96l-4.67-6.11L5.88 22H2.62l7.62-8.7L2 2h6.11l4.22 5.56L18.244 2zm-1.14 18h1.65L5.03 3.9H3.26L17.104 20z"
      />
    </svg>
  );
}

function GitHubLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 .5A11.5 11.5 0 0 0 .5 12.3c0 5.2 3.4 9.6 8.1 11.1.6.1.8-.2.8-.6v-2.1c-3.3.7-4-1.6-4-1.6-.6-1.5-1.4-1.9-1.4-1.9-1.2-.8.1-.8.1-.8 1.3.1 2 .7 2 .7 1.2 2 3.2 1.5 3.9 1.1.1-.9.5-1.5.8-1.9-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.4-2.3 1.1-3.2-.1-.3-.5-1.5.1-3.1 0 0 .9-.3 3.2 1.2a11 11 0 0 1 5.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.6.2 2.8.1 3.1.7.9 1.1 2 1.1 3.2 0 4.6-2.8 5.6-5.4 5.9.4.4.8 1.1.8 2.3v3.4c0 .3.2.7.8.6a11.8 11.8 0 0 0 8.1-11.1A11.5 11.5 0 0 0 12 .5Z"
      />
    </svg>
  );
}

function WeChatLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M9.3 4.2c-4 0-7.1 2.7-7.1 6.2 0 2 1 3.8 2.9 5l-.8 3 3.2-1.7c.6.1 1.2.2 1.8.2 4 0 7.1-2.7 7.1-6.2s-3.1-6.5-7.1-6.5Zm-2.5 5.3a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm5 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"
      />
      <path
        fill="currentColor"
        d="M16.7 10c-2.8 0-5.1 1.8-5.1 4.2s2.3 4.3 5.1 4.3c.5 0 1-.1 1.5-.2l2.5 1.3-.6-2.3c1.1-.8 1.7-1.9 1.7-3.1 0-2.4-2.3-4.2-5.1-4.2Zm-1.8 3.1a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Zm3.7 0a.8.8 0 1 1 0-1.6.8.8 0 0 1 0 1.6Z"
      />
    </svg>
  );
}

function TelegramLogoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M20.7 4.2 3.8 10.7c-1.2.5-1.2 1.2-.2 1.5l4.3 1.3 1.7 5.3c.2.7.1.9.9.9.6 0 .9-.3 1.2-.6l2.4-2.3 4.9 3.6c.9.5 1.6.2 1.8-.8l2.9-13.7c.4-1.3-.5-1.8-1.4-1.4Zm-11 9-.4 4.1-.9-3-2.5-.8 11.9-4.7-8.1 4.4Z"
      />
    </svg>
  );
}

function getChannelIcon(id: string, className?: string) {
  switch (id) {
    case "email":
      return <EnvelopeIcon className={className} />;
    case "x":
      return <XLogoIcon className={className} />;
    case "github":
      return <GitHubLogoIcon className={className} />;
    case "wechat":
      return <WeChatLogoIcon className={className} />;
    case "telegram":
      return <TelegramLogoIcon className={className} />;
    default:
      return null;
  }
}

export default function SupportChannels({ variant = "compact" }: { variant?: Variant }) {
  const router = useRouter();
  const locale = resolveLocale(router.locale);
  const [activeQr, setActiveQr] = useState<Channel | null>(null);
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@imagepromptbase.xyz";
  const supportXUrl = process.env.NEXT_PUBLIC_SUPPORT_X_URL || "https://x.com/LouwlouAiDev";
  const supportGitHubUrl = process.env.NEXT_PUBLIC_SUPPORT_GITHUB_URL || "https://github.com/denghuichao/gpt-image-2-prompts";
  const copy = locale === "zh"
    ? {
        x: "关注动态与联系",
        github: "查看开源与项目更新",
        email: "邮件咨询合作与支持",
        wechat: "扫码添加微信",
        telegram: "扫码添加 Telegram",
        open: "打开",
        emailAction: "发邮件",
        qrAction: "查看二维码",
        qrHint: "扫码联系",
      }
    : {
        x: "Follow updates and reach out",
        github: "See projects and open-source work",
        email: "Email for support or partnerships",
        wechat: "Scan to connect on WeChat",
        telegram: "Scan to connect on Telegram",
        open: "Open",
        emailAction: "Send email",
        qrAction: "View QR code",
        qrHint: "Scan to connect",
      };

  const channels: Channel[] = [
    {
      id: "email",
      label: "Email",
      href: `mailto:${supportEmail}`,
      description: supportEmail,
      actionLabel: copy.emailAction,
      kind: "link",
    },
    {
      id: "x",
      label: "X",
      href: supportXUrl,
      description: copy.x,
      actionLabel: copy.open,
      kind: "link",
    },
    {
      id: "github",
      label: "GitHub",
      href: supportGitHubUrl,
      description: copy.github,
      actionLabel: copy.open,
      kind: "link",
    },
    {
      id: "wechat",
      label: "WeChat",
      description: copy.wechat,
      actionLabel: copy.qrAction,
      kind: "qr",
      qrImageSrc: "/wechat.jpg",
    },
    {
      id: "telegram",
      label: "Telegram",
      description: copy.telegram,
      actionLabel: copy.qrAction,
      kind: "qr",
      qrImageSrc: "/telegram.jpg",
    },
  ];

  return (
    <>
      {variant === "compact" ? (
        <div className="flex flex-wrap gap-3">
          {channels.map((channel) => (
            channel.kind === "link" ? (
              <a
                key={channel.id}
                href={channel.href}
                target={channel.href?.startsWith("mailto:") ? undefined : "_blank"}
                rel={channel.href?.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={channel.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-night-700 bg-night-900/60 text-night-300 transition hover:border-night-500 hover:text-night-100"
              >
                {getChannelIcon(channel.id, "h-4 w-4")}
              </a>
            ) : (
              <button
                key={channel.id}
                type="button"
                aria-label={channel.label}
                onClick={() => setActiveQr(channel)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-night-700 bg-night-900/60 text-night-300 transition hover:border-night-500 hover:text-night-100"
              >
                {getChannelIcon(channel.id, "h-4 w-4")}
              </button>
            )
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {channels.map((channel) => (
            channel.kind === "link" ? (
              <a
                key={channel.id}
                href={channel.href}
                target={channel.href?.startsWith("mailto:") ? undefined : "_blank"}
                rel={channel.href?.startsWith("mailto:") ? undefined : "noreferrer"}
                className="group rounded-2xl border border-night-700/70 bg-night-900/55 p-5 transition hover:border-night-500/70 hover:bg-night-900/80"
              >
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-glow-500/10 text-glow-300">
                      {getChannelIcon(channel.id, "h-5 w-5")}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-night-50">{channel.label}</div>
                      <div className="mt-1 break-words text-sm leading-6 text-night-400">
                        {channel.description}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex w-fit items-center rounded-full border border-night-700 bg-night-950/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-night-400 transition group-hover:border-night-500 group-hover:text-night-100">
                    {channel.actionLabel}
                  </div>
                </div>
              </a>
            ) : (
              <button
                key={channel.id}
                type="button"
                onClick={() => setActiveQr(channel)}
                className="group rounded-2xl border border-night-700/70 bg-night-900/55 p-5 text-left transition hover:border-night-500/70 hover:bg-night-900/80"
              >
                <div className="flex min-w-0 flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-glow-500/10 text-glow-300">
                      {getChannelIcon(channel.id, "h-5 w-5")}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-night-50">{channel.label}</div>
                      <div className="mt-1 break-words text-sm leading-6 text-night-400">
                        {channel.description}
                      </div>
                    </div>
                  </div>
                  <div className="inline-flex w-fit items-center rounded-full border border-night-700 bg-night-950/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-night-400 transition group-hover:border-night-500 group-hover:text-night-100">
                    {channel.actionLabel}
                  </div>
                </div>
              </button>
            )
          ))}
        </div>
      )}

      {activeQr && (
        <div className="fixed inset-0 z-[1500] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close QR modal"
            onClick={() => setActiveQr(null)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-[360px] rounded-3xl border border-night-700 bg-night-950 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-lg font-semibold text-night-50">{activeQr.label}</p>
                <p className="mt-1 text-sm text-night-400">{copy.qrHint}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveQr(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-night-700 text-night-300 transition hover:border-night-500 hover:text-night-100"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-night-800 bg-white p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={activeQr.qrImageSrc} alt={`${activeQr.label} QR code`} className="h-auto w-full rounded-xl" />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
