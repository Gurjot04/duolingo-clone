"use client";
import { PathSkill } from "@/lib/api";
import { Check, Crown, Lock, SkillGlyph, Star } from "./Icons";

interface Props {
  skill: PathSkill;
  color: string;
  offset: number;
  open: boolean;
  onToggle: () => void;
  onStart: () => void;
  xpPerLesson: number;
}

const SHADES: Record<string, string> = {
  "#58cc02": "#58a700", "#ce82ff": "#a560e8", "#ff9600": "#cc7a00", "#1cb0f6": "#1899d6",
};

function Ring({ done, total, color }: { done: number; total: number; color: string }) {
  const r = 46, c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#e5e5e5" strokeWidth="7" />
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - done / total)} transform="rotate(-90 50 50)"
        style={{ transition: "stroke-dashoffset .8s ease" }} />
    </svg>
  );
}

export default function PathNode({ skill, color, offset, open, onToggle, onStart, xpPerLesson }: Props) {
  const { status } = skill;
  const locked = status === "locked", done = status === "completed";
  const face = locked ? "#e5e5e5" : done ? "#ffc800" : color;
  const edge = locked ? "#b7b7b7" : done ? "#e5a400" : SHADES[color] || "#58a700";
  const showRing = status === "available" && skill.lessons_completed > 0 || skill.is_current;

  return (
    <div className="node-slot" style={{ transform: `translateX(${offset}px)` }}>
      {skill.is_current && !open && <div className="start-bubble">START<i /></div>}
      <div className="node-wrap">
        {showRing && <Ring done={skill.lessons_completed} total={skill.lessons_total} color={color} />}
        <button className={`node ${status}`} style={{ background: face, boxShadow: `0 8px 0 ${edge}` }}
          onClick={onToggle} aria-label={`${skill.title} (${status})`}>
          {locked ? <Lock size={32} /> : done ? <Check size={38} /> : skill.icon === "star" ? <Star size={38} /> : <SkillGlyph name={skill.icon} size={38} />}
        </button>
        {!locked && skill.lessons_completed > 0 && (
          <span className="crown-badge"><Crown size={18} />{skill.lessons_completed}</span>
        )}
      </div>

      {open && (
        <div className="node-popover" style={{ background: locked ? "#e5e5e5" : color }}>
          <i style={{ background: locked ? "#e5e5e5" : color }} />
          <div className="np-title" style={{ color: locked ? "#afafaf" : "#fff" }}>{skill.title}</div>
          <div className="np-sub" style={{ color: locked ? "#afafaf" : "#fff" }}>
            {locked ? "Complete all levels above to unlock this!"
              : `Level ${Math.min(skill.lessons_completed + 1, skill.lessons_total)} of ${skill.lessons_total}`}
          </div>
          {!locked && (
            <button className="btn btn-white btn-block" style={{ color }} onClick={onStart}>
              {done ? "PRACTICE AGAIN" : `START +${xpPerLesson} XP`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
