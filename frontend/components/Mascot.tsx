// Original mascot: "Ribbit" the frog (hand-drawn SVG, not a Duolingo character).
export type Mood = "happy" | "sad" | "cheer" | "wink";

export default function Mascot({ mood = "happy", size = 140, className = "" }: { mood?: Mood; size?: number; className?: string }) {
  const sad = mood === "sad";
  const cheer = mood === "cheer";
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={`mascot ${className}`} aria-label="Ribbit the frog">
      {/* body */}
      <ellipse cx="80" cy="108" rx="48" ry="40" fill="#58cc02" />
      <ellipse cx="80" cy="120" rx="30" ry="26" fill="#b8f28b" />
      {/* arms */}
      <path d={cheer ? "M36 100C22 86 20 70 26 58" : "M36 108C26 114 22 124 26 132"} stroke="#58cc02" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d={cheer ? "M124 100C138 86 140 70 134 58" : "M124 108C134 114 138 124 134 132"} stroke="#58cc02" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* head */}
      <ellipse cx="80" cy="70" rx="50" ry="38" fill="#58cc02" />
      {/* eye bumps */}
      <circle cx="52" cy="42" r="20" fill="#58cc02" />
      <circle cx="108" cy="42" r="20" fill="#58cc02" />
      <circle cx="52" cy="42" r="15" fill="#fff" />
      <circle cx="108" cy="42" r="15" fill="#fff" />
      {mood === "wink" ? (
        <>
          <circle cx="54" cy="44" r="7" fill="#3c3c3c" />
          <path d="M98 44q10 -8 20 0" stroke="#3c3c3c" strokeWidth="4" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="54" cy={sad ? 47 : 44} r="7" fill="#3c3c3c" />
          <circle cx="106" cy={sad ? 47 : 44} r="7" fill="#3c3c3c" />
          <circle cx="57" cy="41" r="2.500" fill="#fff" />
          <circle cx="109" cy="41" r="2.500" fill="#fff" />
        </>
      )}
      {sad && <path d="M70 24l-22 6M90 24l22 6" stroke="#3c3c3c" strokeWidth="3.500" strokeLinecap="round" />}
      {/* cheeks */}
      <ellipse cx="38" cy="78" rx="8" ry="5" fill="#ff8a8a" opacity=".6" />
      <ellipse cx="122" cy="78" rx="8" ry="5" fill="#ff8a8a" opacity=".6" />
      {/* mouth */}
      {sad ? (
        <path d="M60 92q20 -16 40 0" stroke="#3c3c3c" strokeWidth="4.500" strokeLinecap="round" fill="none" />
      ) : cheer ? (
        <path d="M54 78q26 34 52 0z" fill="#3c3c3c" />
      ) : (
        <path d="M58 80q22 22 44 0" stroke="#3c3c3c" strokeWidth="4.500" strokeLinecap="round" fill="none" />
      )}
      {cheer && <path d="M66 90q14 10 28 0q-6 -8 -14 -8t-14 8z" fill="#ff6b6b" />}
      {/* nostrils */}
      <circle cx="74" cy="64" r="2" fill="#3a9e00" />
      <circle cx="86" cy="64" r="2" fill="#3a9e00" />
      {/* sad tear */}
      {sad && <path d="M44 60q-5 10 0 14q5 -4 0 -14z" fill="#49c0f8" />}
    </svg>
  );
}
