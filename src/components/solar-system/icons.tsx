/**
 * Özel tasarım SVG ikon seti — astronomik stil.
 * Hiçbir emoji kullanılmaz; her ikon elle çizilmiş vektördür.
 */

interface IconProps {
  className?: string;
}

/** Başlık ikonu: Güneş + eliptik yörünge (sahne logosu). */
export function SunOrbitIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
      <ellipse
        cx="12"
        cy="12"
        rx="9.4"
        ry="4.1"
        transform="rotate(-22 12 12)"
      />
      <circle cx="19.2" cy="8.2" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Müzik: dalgalar halinde ses titreşimi. */
export function MusicWaveIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M3 12h1.6" />
      <path d="M7 8.5v7" />
      <path d="M11 5.5v13" />
      <path d="M15 8v8" />
      <path d="M19 10.5v3" />
      <path d="M22 11.4v1.2" opacity="0.5" />
    </svg>
  );
}

/** Bilgi havuzu: açık kitap + yıldız. */
export function PoolIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 5.5c2.8-1.4 5.6-1.4 8.4 0v13c-2.8-1.4-5.6-1.4-8.4 0v-13Z" />
      <path d="M21 5.5c-2.8-1.4-5.6-1.4-8.4 0v13c2.8-1.4 5.6-1.4 8.4 0v-13Z" />
      <path
        d="M12.9 9.1l.55 1.12 1.23.18-.9.87.22 1.23-1.1-.58-1.1.58.22-1.23-.9-.87 1.23-.18.55-1.12Z"
        fill="currentColor"
        stroke="none"
        opacity="0.9"
      />
    </svg>
  );
}

/** Teoriler: yörünge + soru işareti taşıyan elips. */
export function TheoryIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="2.5" />
      <ellipse cx="12" cy="12" rx="9" ry="3.6" transform="rotate(24 12 12)" />
      <circle cx="5.6" cy="15.8" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="18.8" cy="7.4" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Akıllı tahta: tahta + stand + dokunma dalgası. */
export function BoardIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="12" rx="1.6" />
      <path d="M12 16v3.2" />
      <path d="M8 20.5h8" />
      <path d="M9.4 12.2a3.7 3.7 0 0 1 5.2 0" opacity="0.85" />
      <circle cx="12" cy="8.9" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Tam ekran: köşe okları. */
export function ExpandIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9" />
      <path d="M20 9V5.5A1.5 1.5 0 0 0 18.5 4H15" />
      <path d="M4 15v3.5A1.5 1.5 0 0 0 5.5 20H9" />
      <path d="M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15" />
    </svg>
  );
}

/** 3D kesit: katmanlı daireler. */
export function Layers3DIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="12" r="8.6" />
      <circle cx="12" cy="12" r="5.4" opacity="0.75" />
      <circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none" opacity="0.9" />
      <path d="M12 3.4v17.2" opacity="0.4" strokeDasharray="2 2.4" />
    </svg>
  );
}

/** Galaksi kolu: minik sarmal. */
export function SpiralIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 12c0-3 2.4-4.6 4.8-4.1 2.9.6 4.4 3.6 3.6 6.5" />
      <path d="M12 12c0 3-2.4 4.6-4.8 4.1-2.9-.6-4.4-3.6-3.6-6.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Akıllı tahta (EBA) — duvara asılı panel + dokunma halkası. */
export function DeviceBoardIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="3" y="4.5" width="18" height="11.5" rx="1.6" />
      <path d="M8 19.5h8" />
      <path d="M12 16v3.5" />
      <circle cx="12" cy="10.2" r="2.5" />
      <circle cx="12" cy="10.2" r="0.55" fill="currentColor" stroke="none" />
      <path d="M12 6.2v1.1M12 13.1v1.1M8.9 10.2H10M14 10.2h1.1" />
    </svg>
  );
}

/** Telefon — dikey ekran + dokunmatik dalga. */
export function DevicePhoneIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="7" y="2.5" width="10" height="19" rx="2.2" />
      <path d="M10.5 5h3" />
      <path d="M12 18.6h.01" strokeWidth="2.2" />
      <path
        d="M17.6 9.4c1 .9 1 3.3 0 4.2M19.4 7.8c1.7 1.6 1.7 5.8 0 7.4"
        opacity="0.75"
      />
    </svg>
  );
}

/** Bilgisayar — monitör + klavye. */
export function DevicePcIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect x="2.5" y="4" width="19" height="12" rx="1.7" />
      <path d="M7.5 19.5h9" />
      <path d="M12 16v3.5" />
      <path d="M6.5 8.5h4M6.5 11h2.5" opacity="0.7" />
      <circle cx="16.6" cy="10.4" r="1.9" opacity="0.7" />
    </svg>
  );
}
