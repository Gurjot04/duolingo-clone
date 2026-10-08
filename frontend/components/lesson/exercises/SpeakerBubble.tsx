"use client";
import { Speaker } from "@/components/Icons";
import { speak } from "@/lib/sound";

/** Speech-bubble style prompt with a text-to-speech button (browser TTS). */
export default function SpeakerBubble({ text, lang = "es-ES", canSpeak = true }: { text: string; lang?: string; canSpeak?: boolean }) {
  return (
    <div className="prompt-row">
      {canSpeak && (
        <button className="speaker" onClick={() => speak(text, lang)} aria-label="Play audio"><Speaker size={30} /></button>
      )}
      <div className="bubble">{text}</div>
    </div>
  );
}
