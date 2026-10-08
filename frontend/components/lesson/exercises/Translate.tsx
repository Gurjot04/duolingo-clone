"use client";
import { useState } from "react";
import { sfx } from "@/lib/sound";
import SpeakerBubble from "./SpeakerBubble";
import { ExerciseProps } from "./types";

interface Chip { id: number; text: string }

/** Word bank: tap words to build the sentence; tap again to take them back. */
export default function Translate({ exercise, locked, result, onAnswer }: ExerciseProps) {
  const { source = "", bank = [], es_to_en } = exercise.data;
  const chips: Chip[] = bank.map((text, id) => ({ id, text }));
  const [chosen, setChosen] = useState<number[]>([]);

  const update = (next: number[]) => {
    setChosen(next);
    onAnswer(next.length ? next.map((i) => chips[i].text).join(" ") : null);
  };
  const add = (id: number) => { if (!locked) { sfx.tap(); update([...chosen, id]); } };
  const remove = (id: number) => { if (!locked) update(chosen.filter((c) => c !== id)); };

  return (
    <div>
      <h1 className="ex-title">{exercise.prompt}</h1>
      <SpeakerBubble text={source} lang={es_to_en ? "es-ES" : "en-US"} canSpeak={!!es_to_en} />
      <div className={`answer-lines ${locked ? result : ""}`}>
        {chosen.map((id) => (
          <button key={id} className="chip" onClick={() => remove(id)}>{chips[id].text}</button>
        ))}
      </div>
      <div className="word-bank">
        {chips.map((c) => (
          <div key={c.id} className="chip-slot">
            {chosen.includes(c.id) ? <span className="chip ghost">{c.text}</span>
              : <button className="chip" onClick={() => add(c.id)}>{c.text}</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
