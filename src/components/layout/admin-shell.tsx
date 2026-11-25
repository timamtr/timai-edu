import { requireRole } from "@/features/auth/server-auth";
import { AdminNav } from "./admin-nav";

export async function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["admin"]);

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      <AdminNav profile={profile} />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
