import Link from "next/link";
import {
  Activity,
  BookOpen,
  CheckSquare,
  FileSpreadsheet,
  HelpCircle,
  Plus,
  Users,
} from "lucide-react";
import { getAdminDashboardStats } from "@/services/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    {
      label: "Тіркелген қолданушылар",
      value: stats.usersCount,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Тесттер саны",
      value: stats.testsCount,
      icon: CheckSquare,
      color: "text-success",
    },
    {
      label: "Сұрақтар банкі",
      value: stats.questionsCount,
      icon: HelpCircle,
      color: "text-warning",
    },
    {
      label: "Жарияланған сабақтар",
      value: stats.publishedLessonsCount,
      icon: BookOpen,
      color: "text-primary",
    },
    {
      label: "Тест талпыныстары",
      value: stats.attemptsCount,
      icon: Activity,
      color: "text-success",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Әкімшілік басқару панелі
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Платформаның жалпы көрсеткіштері мен оқу материалдарын басқару
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-xs hover:bg-[#233FA5]"
          >
            <Plus className="h-4 w-4" />
            Сұрақ қосу
          </Link>
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
          >
            <FileSpreadsheet className="h-4 w-4 text-success" />
            Excel импорт
          </Link>
        </div>
      </div>

      {/* 5 метрик платформы */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-xs"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-medium">{c.label}</span>
                <Icon className={`h-4 w-4 ${c.color}`} />
              </div>
              <div className="mt-3 text-2xl font-bold text-foreground">
                {c.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Активность платформы */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <h2 className="text-base font-bold text-foreground">
            Соңғы тест тапсырулар
          </h2>
          {stats.recentAttempts.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Әзірге тест тапсырулар жоқ.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {stats.recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-xl border border-border p-3.5"
                >
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      {att.userName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {att.testTitle}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                        att.status === "completed"
                          ? "bg-success/15 text-success"
                          : "bg-warning/15 text-warning"
                      }`}
                    >
                      {att.status === "completed"
                        ? `${att.percentage}%`
                        : "Орындалуда"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground">
              Жаңа тіркелген қолданушылар
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Барлығы
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {stats.recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-xl border border-border p-3.5"
              >
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {u.full_name || "Аты көрсетілмеген"}
                  </div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <span className="rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
