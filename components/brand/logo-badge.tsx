/**
 * The small-size ClauseGuard mark: a solid copper badge with the shield
 * silhouette, exactly matching app/icon.tsx and app/apple-icon.tsx.
 *
 * shield-mark.tsx's detailed shield/scale/book line art is documented as
 * needing ~40px and up before it stops "reading as texture, not a shape."
 * Every real usage of the logo in this app -- the nav bar, the footer -- sits
 * at 24-32px, well under that line, which is why the header mark and the
 * browser tab icon used to look like two different unfinished attempts at a
 * logo instead of one mark used twice. This component is that one mark.
 */
export function LogoBadge({
  size = 28,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        background: "#b04000",
        borderRadius: "22%",
      }}
    >
      <svg
        width={size * 0.6}
        height={size * 0.6}
        viewBox="0 0 100 100"
        role="img"
        aria-label="ClauseGuard"
      >
        <path
          d="M50,6 L82,19 L82,49 C82,71 68,85 50,94 C32,85 18,71 18,49 L18,19 Z"
          fill="#ffffff"
        />
      </svg>
    </span>
  );
}
