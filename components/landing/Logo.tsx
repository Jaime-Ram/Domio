export default function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/DomioLogo.png"
      alt="Domio"
      className={`h-5 w-auto select-none ${className}`}
      style={light ? { filter: "brightness(0) invert(1)" } : undefined}
    />
  );
}
