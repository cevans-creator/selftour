/**
 * KeySherpa Logo System
 * 3 concept directions — swap `activeVariant` to preview each
 */

interface LogoMarkProps {
  size?: number;
  color?: string;
  className?: string;
}

interface LogoFullProps {
  height?: number;
  color?: string;
  accentColor?: string;
  className?: string;
}

/**
 * Concept A — "The Keyhole Peak"
 * A keyhole silhouette where the negative space at the bottom
 * forms an upward mountain peak. Story: "Access meets guidance —
 * a keyhole with a summit inside."
 */
export function LogoMarkA({ size = 32, color = "#2C2A26", className }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Keyhole body */}
      <path
        d="M20 4C14.477 4 10 8.477 10 14c0 3.866 2.195 7.213 5.4 8.882L13 36h14l-2.4-13.118C27.805 21.213 30 17.866 30 14c0-5.523-4.477-10-10-10z"
        fill={color}
      />
      {/* Mountain peak negative space */}
      <path
        d="M16 36l4-8 4 8"
        fill="#F5F1EA"
      />
      {/* Keyhole circle negative space */}
      <circle cx="20" cy="14" r="3.5" fill="#F5F1EA" />
    </svg>
  );
}

/**
 * Concept B — "The Key Path"
 * A simplified key profile where the teeth form ascending steps
 * like a mountain trail. Story: "A key whose teeth trace a path
 * upward — unlocking is a guided ascent."
 */
export function LogoMarkB({ size = 32, color = "#2C2A26", className }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Key shaft */}
      <rect x="10" y="17" width="16" height="4" rx="1" fill={color} />
      {/* Key ring (circle at left) */}
      <circle cx="10" cy="19" r="7" stroke={color} strokeWidth="3.5" fill="none" />
      {/* Key teeth — ascending steps like mountain path */}
      <path
        d="M20 21v5h3v-3h3v-2h3v-2h4v-2h-13z"
        fill={color}
      />
    </svg>
  );
}

/**
 * Concept C — "The Summit Door"
 * An arch/doorway shape with a mountain peak integrated at the top.
 * Clean, architectural, works at any size. Story: "A doorway crowned
 * by a peak — the threshold where home meets journey."
 */
export function LogoMarkC({ size = 32, color = "#2C2A26", className }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      {/* Door arch with peak */}
      <path
        d="M8 36V18c0-1 0.5-2 1.5-2.8L20 4l10.5 11.2c1 0.8 1.5 1.8 1.5 2.8v18"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Door opening */}
      <path
        d="M15 36V24c0-2.761 2.239-5 5-5s5 2.239 5 5v12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Keyhole dot */}
      <circle cx="20" cy="27" r="1.5" fill={color} />
    </svg>
  );
}

/**
 * Full wordmark lockups
 */
export function LogoFullA({ height = 28, color = "#2C2A26", accentColor = "#A0522D", className }: LogoFullProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMarkA size={height} color={accentColor} />
      <span style={{ fontFamily: "var(--font-fraunces)", fontSize: height * 0.55, color, letterSpacing: "0.02em", fontWeight: 500 }}>
        Key<span style={{ color: accentColor }}>Sherpa</span>
      </span>
    </span>
  );
}

export function LogoFullB({ height = 28, color = "#2C2A26", accentColor = "#A0522D", className }: LogoFullProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMarkB size={height} color={accentColor} />
      <span style={{ fontFamily: "var(--font-fraunces)", fontSize: height * 0.55, color, letterSpacing: "0.02em", fontWeight: 500 }}>
        Key<span style={{ color: accentColor }}>Sherpa</span>
      </span>
    </span>
  );
}

export function LogoFullC({ height = 28, color = "#2C2A26", accentColor = "#A0522D", className }: LogoFullProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMarkC size={height} color={accentColor} />
      <span style={{ fontFamily: "var(--font-fraunces)", fontSize: height * 0.55, color, letterSpacing: "0.02em", fontWeight: 500 }}>
        Key<span style={{ color: accentColor }}>Sherpa</span>
      </span>
    </span>
  );
}

// ─── Active selection — change this to swap concepts site-wide ─────────
export const LogoMark = LogoMarkC;
export const LogoFull = LogoFullC;
