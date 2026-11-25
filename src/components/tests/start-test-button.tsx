"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Play } from "lucide-react";

export function StartTestButton({
  testId,
  hasInProgress,
}: {
  testId: string;
  hasInProgress: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tests/${testId}/start`, {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok || !json.attemptId) {
        setError(json.error || "Тестті бастау мүмкін болмады");
        setLoading(false);
        return;
      }
      router.push(`/tests/attempts/${json.attemptId}/play`);
    } catch {
      setError("Желі қатесі. Қайталап көріңіз.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleStart}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-xs transition-colors hover:bg-[#233FA5] disabled:opacity-60"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {hasInProgress ? "Аяқталмаған тестті жалғастыру" : "Тестті бастау"}
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
