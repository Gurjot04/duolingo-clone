"use client";
import { useState } from "react";
import { sfx } from "@/lib/sound";
import { ExerciseProps } from "./types";

export default function FillBlank({ exercise, locked, result, onAnswer }: ExerciseProps) {
  const { sentence = "", options = [] } = exercise.data;
  const [picked, setPicked] = useState<string | null>(null);
  const [before, after] = sentence.split("___");

  const pick = (o: string) => {
    if (locked) return;
    sfx.tap();
    const next = picked === o ? null : o;
    setPicked(next);
    onAnswer(next);
  };

  return (
    <div>
      <h1 className="ex-title">{exercise.prompt}</h1>
      <div className="sentence">
        <span>{before}</span>
        <span className={`blank ${picked ? "filled" : ""} ${locked ? result : ""}`}>{picked ?? " "}</span>
        <span>{after}</span>
      </div>
      <div className="choices row">
        {options.map((o) => (
          <button key={o} className={`choice ${picked === o ? "selected" : ""}`} onClick={() => pick(o)}>{o}</button>
        ))}
      </div>
    </div>
  );
}
