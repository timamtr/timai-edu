import { Suspense } from "react";
import { StudentShell } from "@/components/layout/student-shell";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
          Жүктелуде...
        </div>
      }
    >
      <StudentShell>{children}</StudentShell>
    </Suspense>
  );
}
