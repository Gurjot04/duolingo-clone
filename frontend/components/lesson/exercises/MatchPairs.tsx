"use client";
import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { sfx, speak } from "@/lib/sound";
import { ExerciseProps } from "./types";

type Sel = { side: "l" | "r"; text: string } | null;

/** Tap a Spanish word then its English match. Wrong pairs flash red (no heart lost). */
export default function MatchPairs({ exercise, locked, onAutoSubmit }: ExerciseProps) {
  const { left = [], right = [] } = exercise.data;
  const [sel, setSel] = useState<Sel>(null);
  const [matched, setMatched] = useState<string[][]>([]);
  const [wrong, setWrong] = useState<string[]>([]);
  const busy = useRef(false);

  const isMatched = (t: string) => matched.some((p) => p.includes(t));

  const tap = async (side: "l" | "r", text: string) => {
    if (locked || busy.current || isMatched(text)) return;
    sfx.tap();
    if (side === "l") speak(text);
    if (!sel || sel.side === side) return setSel({ side, text });

    const [l, r] = side === "r" ? [sel.text, text] : [text, sel.text];
    busy.current = true;
    try {
      const { correct } = await api.checkPair(exercise.id, l, r);
      if (correct) {
        sfx.correct();
        const next = [...matched, [l, r]];
        setMatched(next);
        setSel(null);
        if (next.length === left.length) setTimeout(() => onAutoSubmit(next), 450);
      } else {
        sfx.wrong();
        setWrong([l, r]);
        setTimeout(() => { setWrong([]); setSel(null); }, 500);
      }
    } finally { busy.current = false; }
  };

  const cls = (side: "l" | "r", t: string) =>
    isMatched(t) ? "matched" : wrong.includes(t) ? "wrong" : sel?.side === side && sel.text === t ? "selected" : "";

  return (
    <div>
      <h1 className="ex-title">{exercise.prompt}</h1>
      <div className="match-grid">
        <div className="match-col">{left.map((t) => <button key={t} className={`match-tile ${cls("l", t)}`} onClick={() => tap("l", t)}>{t}</button>)}</div>
        <div className="match-col">{right.map((t) => <button key={t} className={`match-tile ${cls("r", t)}`} onClick={() => tap("r", t)}>{t}</button>)}</div>
      </div>
    </div>
  );
}
