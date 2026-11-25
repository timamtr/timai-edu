import { requireRole } from "@/features/auth/server-auth";
import { getAdminUsersData } from "@/services/admin";
import { UsersTable } from "@/components/admin/users-table";

export default async function AdminUsersPage() {
  const admin = await requireRole(["admin"]);
  const users = await getAdminUsersData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Пайдаланушыларды басқару
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Тіркелген оқушылар, мұғалімдер және әкімшілер тізімі ({users.length})
        </p>
      </div>

      <UsersTable initialUsers={users} currentAdminId={admin.id} />
    </div>
  );
}
