import { CSSProperties } from "react";

interface P { size?: number; style?: CSSProperties; className?: string }

export const Flame = ({ size = 28, className, style, off = false }: P & { off?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M16 2c1 5 8 8 8 17a8 8 0 0 1-16 0c0-3 1.5-5 3-6.5 0 2.500 1 4 2.500 4C13 11 14 6 16 2z"
      fill={off ? "#cfcfcf" : "#ff9600"} />
    <path d="M16 15c.8 2.500 4 4 4 8a4 4 0 0 1-8 0c0-2 1-3 2-4 0 1.200.8 2 1.500 2 .5-2 .3-4 .5-6z"
      fill={off ? "#e5e5e5" : "#ffc800"} />
  </svg>
);

export const Gem = ({ size = 26, className, style }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M8 5h16l6 8-14 15L2 13z" fill="#1cb0f6" />
    <path d="M8 5l-6 8h28l-6-8" fill="#49c0f8" />
    <path d="M2 13h28L16 28z" fill="#1899d6" />
    <path d="M10 13l6 15 6-15" fill="#7fd5fa" opacity=".6" />
  </svg>
);

export const Heart = ({ size = 26, className, style, empty = false }: P & { empty?: boolean }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M16 29C5 21 2 15 2 10.500A6.500 6.500 0 0 1 8.500 4C12 4 14.800 6 16 8.500 17.200 6 20 4 23.500 4A6.500 6.500 0 0 1 30 10.500C30 15 27 21 16 29z"
      fill={empty ? "#e5e5e5" : "#ff4b4b"} />
    {!empty && <ellipse cx="9" cy="10" rx="2.500" ry="1.600" fill="#ff8a8a" transform="rotate(-30 9 10)" />}
  </svg>
);

export const Bolt = ({ size = 24, className, style }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M19 2L6 18h8l-2 12 14-17h-8z" fill="#ffc800" />
  </svg>
);

export const Star = ({ size = 34, color = "#fff", className, style }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M16 3l3.800 8 8.700 1.100-6.400 6 1.700 8.700L16 22.500 8.200 26.800 9.900 18.100 3.500 12.100l8.700-1.100z"
      fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const Check = ({ size = 34, color = "#fff", className, style }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M6 17l7 7L26 9" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Lock = ({ size = 30, color = "#afafaf", className, style }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <rect x="6" y="14" width="20" height="14" rx="3" fill={color} />
    <path d="M10 14v-3a6 6 0 0 1 12 0v3" fill="none" stroke={color} strokeWidth="3.500" />
  </svg>
);

export const Crown = ({ size = 20, className, style }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={style}>
    <path d="M3 24l-1-14 8 6 6-10 6 10 8-6-1 14z" fill="#ffc800" stroke="#e5a400" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const Trophy = ({ size = 28, color = "#ffc800" }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M9 4h14v8a7 7 0 0 1-14 0z" fill={color} />
    <path d="M9 7H4c0 5 2 8 6 8M23 7h5c0 5-2 8-6 8" fill="none" stroke={color} strokeWidth="2.500" />
    <rect x="14" y="19" width="4" height="5" fill={color} />
    <rect x="9" y="24" width="14" height="4" rx="1.500" fill={color} />
  </svg>
);

export const Speaker = ({ size = 28, color = "#1cb0f6" }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M4 12h6l8-6v20l-8-6H4z" fill={color} />
    <path d="M22 10a8 8 0 0 1 0 12M25 6a13 13 0 0 1 0 20" fill="none" stroke={color} strokeWidth="2.500" strokeLinecap="round" />
  </svg>
);

export const Close = ({ size = 26, color = "#afafaf" }: P & { color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M7 7l18 18M25 7L7 25" stroke={color} strokeWidth="4.500" strokeLinecap="round" />
  </svg>
);

// -------- nav icons (simple, chunky, playful)
export const NavLearn = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M16 3l11 7v12l-11 7-11-7V10z" fill="#ffc800" stroke="#e5a400" strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 3l11 7-11 7-11-7z" fill="#ffdf5c" />
    <path d="M4 22l12 7 12-7" fill="none" stroke="#e5a400" strokeWidth="2" />
  </svg>
);
export const NavLeague = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M16 2l11 4v9c0 7-5 12-11 15C10 27 5 22 5 15V6z" fill="#ce82ff" stroke="#a560e8" strokeWidth="2" strokeLinejoin="round" />
    <path d="M16 9l2 4.500 5 .5-3.800 3.200 1.200 5-4.400-2.700-4.400 2.700 1.200-5L9 14l5-.5z" fill="#fff" />
  </svg>
);
export const NavQuests = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="12" fill="#ff9600" stroke="#e08400" strokeWidth="2" />
    <circle cx="16" cy="16" r="7.500" fill="#fff" />
    <circle cx="16" cy="16" r="3.500" fill="#ff4b4b" />
  </svg>
);
export const NavShop = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <path d="M4 11l3-6h18l3 6z" fill="#ff4b4b" />
    <rect x="5" y="11" width="22" height="16" rx="2" fill="#ff8a8a" stroke="#ea2b2b" strokeWidth="2" />
    <rect x="12" y="17" width="8" height="10" fill="#ea2b2b" />
  </svg>
);
export const NavProfile = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx="16" cy="11" r="6.500" fill="#1cb0f6" stroke="#1899d6" strokeWidth="2" />
    <path d="M4 29c0-7 5-11 12-11s12 4 12 11z" fill="#1cb0f6" stroke="#1899d6" strokeWidth="2" />
  </svg>
);
export const NavMore = ({ size = 32 }: P) => (
  <svg width={size} height={size} viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="12" fill="#afafaf" stroke="#9a9a9a" strokeWidth="2" />
    <circle cx="10.500" cy="16" r="2" fill="#fff" />
    <circle cx="16" cy="16" r="2" fill="#fff" />
    <circle cx="21.500" cy="16" r="2" fill="#fff" />
  </svg>
);

export const SkillGlyph = ({ name, size = 34 }: { name: string; size?: number }) => {
  const c = "#fff";
  const common = { width: size, height: size, viewBox: "0 0 32 32" };
  switch (name) {
    case "chat": return <svg {...common}><path d="M4 6h24v16H15l-7 6v-6H4z" fill={c} /></svg>;
    case "people": return <svg {...common}><circle cx="11" cy="10" r="5" fill={c} /><circle cx="22" cy="12" r="4" fill={c} /><path d="M2 27c0-6 4-9 9-9s9 3 9 9zM18 27c0-4 2-6 5-6s7 2 7 6z" fill={c} /></svg>;
    case "apple": return <svg {...common}><path d="M16 9c-4-3-11-1-11 8 0 6 4 11 8 11 2 0 2-1 3-1s1 1 3 1c4 0 8-5 8-11 0-9-7-11-11-8z" fill={c} /><path d="M16 9c0-3 1-5 4-6" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" /></svg>;
    case "cup": return <svg {...common}><path d="M5 8h18v10a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8z" fill={c} /><path d="M23 11h3a3 3 0 0 1 0 8h-3" stroke={c} strokeWidth="3" fill="none" /></svg>;
    case "bell": return <svg {...common}><path d="M16 4a8 8 0 0 0-8 8c0 7-3 8-3 10h22c0-2-3-3-3-10a8 8 0 0 0-8-8z" fill={c} /><circle cx="16" cy="26" r="3" fill={c} /></svg>;
    case "house": return <svg {...common}><path d="M3 16L16 4l13 12h-4v12H7V16z" fill={c} /></svg>;
    case "numbers": return <svg {...common}><text x="16" y="25" textAnchor="middle" fontSize="24" fontWeight="900" fill={c} fontFamily="Nunito,sans-serif">123</text></svg>;
    case "palette": return <svg {...common}><path d="M16 3C8 3 3 9 3 15c0 7 6 14 13 14 3 0 3-3 1-5-2-3 0-5 3-5h5c3 0 4-2 4-5 0-6-6-11-13-11z" fill={c} /></svg>;
    default: return <Star size={size} />;
  }
};

export const AchievementGlyph = ({ name, size = 44 }: { name: string; size?: number }) => {
  const map: Record<string, string> = {
    footprints: "👣", book: "📚", flame: "🔥", fire2: "🌋", star: "⭐", bolt: "⚡", target: "🎯", trophy: "🏆",
  };
  return <span style={{ fontSize: size * 0.8, lineHeight: 1 }}>{map[name] || "🏅"}</span>;
};
