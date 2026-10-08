"use client";
import { useEffect, useState } from "react";
import { sfx, speak } from "@/lib/sound";
import { ExerciseProps } from "./types";

export default function MultipleChoice({ exercise, locked, result, onAnswer }: ExerciseProps) {
  const { options = [], shown, speak: spoken, es_to_en } = exercise.data;
  const [picked, setPicked] = useState<string | null>(null);

  const pick = (o: string) => {
    if (locked) return;
    sfx.tap();
    setPicked(o);
    onAnswer(o);
    if (!es_to_en && spoken) speak(o);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= options.length) pick(options[n - 1]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <h1 className="ex-title">{exercise.prompt}</h1>
      {es_to_en && shown && (
        <div className="prompt-row"><button className="speaker" onClick={() => speak(shown)}>🔊</button><div className="bubble">{shown}</div></div>
      )}
      {!es_to_en && shown && <div className="big-word">{shown}</div>}
      <div className="choices">
        {options.map((o, i) => {
          const state = picked === o ? (locked ? (result === "correct" ? "correct" : "wrong") : "selected") : "";
          return (
            <button key={o} className={`choice ${state}`} onClick={() => pick(o)}>
              <span className="key">{i + 1}</span><span>{o}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
