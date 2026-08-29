export default function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const src = light ? "/images/domio-logo-white.png" : "/images/domio-logo.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Domio"
      className={`h-5 w-auto select-none ${className}`}
    />
  );
}
