import { Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileQuestion,
  FileSpreadsheet,
} from "lucide-react";
import { requireAuth } from "@/features/auth/server-auth";
import { getPublishedTestsData } from "@/services/testing";

async function VariantsPageContent() {
  const profile = await requireAuth();
  const { untVariants } = await getPublishedTestsData(profile.id);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
          ҰБТ форматы
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          ҰБТ сынақ нұсқалары
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Нақты Ұлттық бірыңғай тестілеу ерекшелігіне сай құрастырылған толық
          сынақ нұсқалары.
        </p>
      </div>

      {untVariants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <FileSpreadsheet className="mx-auto h-9 w-9 text-muted-foreground" />
          <p className="mt-3 text-sm font-semibold text-foreground">
            ҰБТ нұсқалары әзірге қосылмаған
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Әкімші панелінде «ҰБТ нұсқасы» санатымен тест құрған кезде барлық
            нұсқалар осы бетте шығады.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {untVariants.map((variant, index) => (
            <div
              key={variant.id}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-shadow hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    Нұсқа #{index + 1}
                  </span>
                  {variant.bestPercentage !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-bold text-success">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Үздік: {variant.bestPercentage}%
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-lg font-bold text-foreground">
                  {variant.title}
                </h2>
                {variant.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {variant.description}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <FileQuestion className="h-4 w-4 text-primary" />
                    {variant.questionsCount} сұрақ
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-primary" />
                    {variant.duration_minutes} минут
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <Link
                  href={`/tests/${variant.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#233FA5]"
                >
                  Нұсқаны бастау
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function VariantsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 animate-pulse rounded-2xl bg-card" />
          ))}
        </div>
      }
    >
      <VariantsPageContent />
    </Suspense>
  );
}
