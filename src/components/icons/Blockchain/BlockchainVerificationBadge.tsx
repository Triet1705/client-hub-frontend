export function BlockchainVerificationBadge({
  className,
  primaryColor = "#10b981",
  accentColor = "#00f0ff",
}: {
  className?: string;
  primaryColor?: string;
  accentColor?: string;
}) {
  return (
    <svg
      viewBox="0 0 128 128"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke={primaryColor}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="64" cy="64" r="56" strokeWidth="2" opacity="0.4" />
      <path
        d="M 64 20 L 88 32 L 88 56 L 64 68 L 40 56 L 40 32 Z"
        strokeWidth="2.5"
      />
      <path d="M 50 64 L 60 74 L 78 52" strokeWidth="3" opacity="0.9" />
      <path
        d="M 64 72 L 88 84 L 88 108 L 64 120 L 40 108 L 40 84 Z"
        strokeWidth="2.5"
      />
      <path d="M 48 96 L 80 96" strokeWidth="1.5" opacity="0.6" />
      <circle cx="40" cy="56" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="88" cy="56" r="3" fill="currentColor" opacity="0.8" />
      <circle cx="64" cy="120" r="3" fill="currentColor" opacity="0.8" />
    </svg>
  );
}
