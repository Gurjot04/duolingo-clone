"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LessonPlayer from "@/components/lesson/LessonPlayer";
import Mascot from "@/components/Mascot";
import { api, ApiError, Lesson } from "@/lib/api";

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.lesson(Number(id)).then(setLesson).catch((e: ApiError) =>
      setError(e.message === "out_of_hearts" ? "You’re out of hearts. Earn some back to keep learning!" : e.message));
  }, [id]);

  if (error) {
    return (
      <div className="empty-state full">
        <Mascot mood="sad" size={150} />
        <h2>Can’t start this lesson</h2>
        <p>{error}</p>
        <button className="btn btn-green" onClick={() => router.push("/")}>BACK TO LEARN</button>
      </div>
    );
  }
  if (!lesson) return <div className="empty-state full"><Mascot mood="happy" size={120} className="bounce" /><p>Loading lesson…</p></div>;
  return <LessonPlayer lesson={lesson} />;
}
