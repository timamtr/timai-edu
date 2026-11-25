"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ProgressPoint {
  label: string;
  percentage: number;
}

export function ProgressChart({ data }: { data: ProgressPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-4 text-center">
        <p className="text-sm font-medium text-foreground">
          Әзірге тест нәтижелері жоқ
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Алғашқы тестті тапсырғаннан кейін прогресс графигі осында көрсетіледі.
        </p>
      </div>
    );
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3157D5" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#3157D5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E9F2" vertical={false} />
          <XAxis
            dataKey="label"
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
              fontSize: "13px",
            }}
          />
          <Area
            type="monotone"
            dataKey="percentage"
            stroke="#3157D5"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
