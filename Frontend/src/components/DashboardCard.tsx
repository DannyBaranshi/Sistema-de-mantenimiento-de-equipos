import type { ReactNode } from "react";

interface DashboardCardProps {
  title: string;
  value: number | string;
  icon?: ReactNode;
  accent?: "blue" | "green" | "yellow" | "red" | "gray";
}

const ACCENTS = {
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  green: "border-green-200 bg-green-50 text-green-700",
  yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
  red: "border-red-200 bg-red-50 text-red-700",
  gray: "border-gray-200 bg-gray-50 text-gray-700",
};

export default function DashboardCard({ title, value, icon, accent = "blue" }: DashboardCardProps) {
  return (
    <div className={`rounded-xl border p-5 ${ACCENTS[accent]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <div>{icon}</div>}
      </div>
      <p className="mt-2 text-3xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}
