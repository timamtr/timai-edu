"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";

export function BookmarkButton({
  questionId,
  initialBookmarked,
}: {
  questionId: string;
  initialBookmarked: boolean;
}) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    const optimistic = !bookmarked;
    setBookmarked(optimistic);

    try {
      const res = await fetch("/api/bookmarks/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      if (res.ok) {
        const json = await res.json();
        setBookmarked(Boolean(json.bookmarked));
      } else {
        setBookmarked(!optimistic);
      }
    } catch {
      setBookmarked(!optimistic);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={bookmarked ? "Таңдаулылардан өшіру" : "Таңдаулыларға қосу"}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors ${
        bookmarked
          ? "border-warning/40 bg-warning/15 text-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Bookmark
        className={`h-3.5 w-3.5 ${bookmarked ? "fill-warning text-warning" : ""}`}
      />
      <span>{bookmarked ? "Сақталған" : "Сақтау"}</span>
    </button>
  );
}
