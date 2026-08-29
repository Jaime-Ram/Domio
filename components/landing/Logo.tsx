export default function Logo({
  className = "",
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  const color = light ? "#ffffff" : "#1d3014";
  return (
    <span
      className={`inline-flex items-center gap-1.5 select-none ${className}`}
      aria-label="Domio"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ height: "1.25em", width: "1.25em" }}
      >
        <path d="M5 18.7L5 10.8Q5 9.5 6.01 8.68L10.99 4.62Q12 3.8 13.01 4.62L17.99 8.68Q19 9.5 19 10.8L19 18.7Q19 20 17.7 20L6.3 20Q5 20 5 18.7Z" />
      </svg>
      <span className="text-lg font-semibold tracking-tight" style={{ color }}>
        Domio
      </span>
    </span>
  );
}
