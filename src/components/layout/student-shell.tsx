import { requireAuth } from "@/features/auth/server-auth";
import { StudentNav } from "./student-nav";

export async function StudentShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <StudentNav profile={profile} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
