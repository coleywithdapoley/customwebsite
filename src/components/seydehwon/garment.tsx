import type { Product } from "@/lib/products";

type Props = {
  product: Product;
  className?: string;
};

/** Stylized garment silhouettes for the virtual rack */
export function Garment({ product, className = "" }: Props) {
  const { fill, accent, shape } = product;

  if (product.image) {
    return (
      <img
        src={product.image}
        alt={product.name}
        draggable={false}
        className={`${className} bg-transparent object-contain object-top [filter:drop-shadow(0_12px_18px_rgba(0,0,0,0.2))]`}
      />
    );
  }

  if (shape === "hoodie") {
    return (
      <svg viewBox="0 0 120 160" className={className} aria-hidden>
        <path
          d="M35 28 C35 18, 48 10, 60 10 C72 10, 85 18, 85 28 L92 42 L110 55 L100 70 L88 62 L88 150 L32 150 L32 62 L20 70 L10 55 L28 42 Z"
          fill={fill}
        />
        <path
          d="M48 28 C48 22, 54 18, 60 18 C66 18, 72 22, 72 28"
          fill="none"
          stroke={accent ?? "#00000033"}
          strokeWidth="3"
        />
        <circle cx="60" cy="78" r="10" fill="#00000022" />
      </svg>
    );
  }

  if (shape === "jacket") {
    return (
      <svg viewBox="0 0 120 160" className={className} aria-hidden>
        <path
          d="M30 30 L45 18 L60 24 L75 18 L90 30 L108 50 L96 62 L88 56 L88 150 L32 150 L32 56 L24 62 L12 50 Z"
          fill={fill}
        />
        <path d="M60 24 L60 150" stroke="#00000033" strokeWidth="2" />
        <path d="M32 70 L50 78 M88 70 L70 78" stroke="#00000044" strokeWidth="2" />
      </svg>
    );
  }

  if (shape === "longsleeve") {
    return (
      <svg viewBox="0 0 120 160" className={className} aria-hidden>
        <path
          d="M34 32 C40 18, 50 14, 60 14 C70 14, 80 18, 86 32 L108 48 L98 62 L86 54 L86 150 L34 150 L34 54 L22 62 L12 48 Z"
          fill={fill}
        />
      </svg>
    );
  }

  if (shape === "cap") {
    return (
      <svg viewBox="18 44 84 54" className={className} aria-hidden>
        <ellipse cx="60" cy="78" rx="38" ry="16" fill={fill} />
        <path d="M28 78 Q60 48 92 78" fill={fill} />
        <path d="M22 82 L55 88 L98 84" stroke={accent ?? "#00000055"} strokeWidth="6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  if (shape === "bag") {
    return (
      <svg viewBox="24 16 72 118" className={className} aria-hidden>
        <path d="M40 40 Q60 20 80 40" fill="none" stroke={fill} strokeWidth="5" />
        <rect x="28" y="48" width="64" height="80" rx="4" fill={fill} />
        <rect x="40" y="70" width="40" height="8" rx="2" fill="#00000022" />
      </svg>
    );
  }

  if (shape === "shoe") {
    return (
      <svg viewBox="16 66 100 52" className={className} aria-hidden>
        <path
          d="M22 100 C30 78, 55 70, 78 78 C95 84, 108 92, 110 105 L110 112 L20 112 Z"
          fill={fill}
          stroke={accent ?? "#222"}
          strokeWidth="2"
        />
        <path d="M30 100 L70 92" stroke={accent ?? "#222"} strokeWidth="2" />
      </svg>
    );
  }

  // tee default
  return (
    <svg viewBox="0 0 120 160" className={className} aria-hidden>
      <path
        d="M38 36 C44 22, 52 18, 60 18 C68 18, 76 22, 82 36 L104 48 L94 62 L82 54 L82 140 L38 140 L38 54 L26 62 L16 48 Z"
        fill={fill}
      />
      <circle cx="60" cy="72" r="7" fill="#00000018" />
    </svg>
  );
}

export function Hanger({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 42" className={className} aria-hidden>
      <path
        d="M45 3.5 a3 3 0 0 1 0 6 V14"
        fill="none"
        stroke="#5c5348"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 32 L45 15 L74 32"
        fill="none"
        stroke="#c9a56b"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 32 H72"
        stroke="#b08a52"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
