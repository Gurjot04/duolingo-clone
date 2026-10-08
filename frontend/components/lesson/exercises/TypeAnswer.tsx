"use client";
import { useEffect, useRef, useState } from "react";
import SpeakerBubble from "./SpeakerBubble";
import { ExerciseProps } from "./types";

const ACCENTS = ["á", "é", "í", "ó", "ú", "ñ", "¿", "¡"];

export default function TypeAnswer({ exercise, locked, onAnswer }: ExerciseProps) {
  const { source = "", target_lang } = exercise.data;
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => ref.current?.focus(), []);

  const change = (v: string) => { setText(v); onAnswer(v.trim() ? v : null); };
  const toSpanish = target_lang === "Spanish";
  return (
    <div>
      <h1 className="ex-title">{exercise.prompt}</h1>
      <SpeakerBubble text={source} lang={toSpanish ? "en-US" : "es-ES"} canSpeak={!toSpanish} />
      <textarea ref={ref} className="type-input" rows={3} value={text} disabled={locked}
        placeholder={`Type in ${target_lang ?? "the answer"}`} spellCheck={false} autoCapitalize="off"
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }} />
      {toSpanish && (
        <div className="accent-row">
          {ACCENTS.map((a) => <button key={a} disabled={locked} className="accent" onClick={() => { change(text + a); ref.current?.focus(); }}>{a}</button>)}
        </div>
      )}
    </div>
  );
}
