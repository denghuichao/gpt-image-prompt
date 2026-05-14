export default function BrandMark({
  className,
  iconClassName,
  imageClassName,
}: {
  className?: string;
  iconClassName?: string;
  imageClassName?: string;
}) {
  return (
    <span className={className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/favicon.png"
        alt=""
        aria-hidden="true"
        className={`${iconClassName || ""} object-contain ${imageClassName || ""}`.trim()}
      />
    </span>
  );
}
