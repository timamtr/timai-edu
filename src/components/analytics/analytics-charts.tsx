"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TopicAnalyticsItem } from "@/services/analytics";

export function AnalyticsCharts({
  dynamics,
  topicBreakdown,
}: {
  dynamics: Array<{
    attemptLabel: string;
    testTitle: string;
    percentage: number;
  }>;
  topicBreakdown: TopicAnalyticsItem[];
}) {
  const solvedTopics = topicBreakdown
    .filter((t) => t.accuracy !== null)
    .map((t) => ({
      name: t.title.length > 22 ? `${t.title.slice(0, 22)}…` : t.title,
      fullTitle: t.title,
      accuracy: t.accuracy ?? 0,
      solved: t.answeredCount,
    }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Динамика результатов по попыткам */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground">
            Тест нәтижелерінің динамикасы
          </h2>
          <p className="text-xs text-muted-foreground">
            Соңғы тапсырылған тесттер бойынша өсу көрсеткіші
          </p>
        </div>

        {dynamics.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center text-xs text-muted-foreground">
            Динамиканы көру үшін кемінде бір тест тапсырыңыз.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={dynamics}
                margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="analyticsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3157D5" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3157D5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E9F2"
                  vertical={false}
                />
                <XAxis
                  dataKey="attemptLabel"
                  tick={{ fontSize: 12, fill: "#778197" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 12, fill: "#778197" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Нәтиже"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E9F2",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="percentage"
                  stroke="#3157D5"
                  strokeWidth={2.5}
                  fill="url(#analyticsGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Успеваемость по темам */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground">
            Тақырыптар бойынша дәлдік (%)
          </h2>
          <p className="text-xs text-muted-foreground">
            Әр бөлімдегі дұрыс жауаптардың үлесі
          </p>
        </div>

        {solvedTopics.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center text-xs text-muted-foreground">
            Тақырыптар бойынша статистика сұрақтарға жауап бергеннен кейін
            пайда болады.
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={solvedTopics}
                layout="vertical"
                margin={{ top: 5, right: 16, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E9F2"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#778197" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={130}
                  tick={{ fontSize: 11, fill: "#182033" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Дәлдік"]}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #E5E9F2",
                    backgroundColor: "#FFFFFF",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="accuracy" radius={[0, 6, 6, 0]} barSize={18}>
                  {solvedTopics.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.accuracy >= 70
                          ? "#20A779"
                          : entry.accuracy >= 50
                          ? "#F3A63B"
                          : "#E65B67"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
