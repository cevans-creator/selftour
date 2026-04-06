"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { CountUp } from "@/components/ui/motion";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) {
  const trendDirection =
    trend?.value === 0 ? "neutral" : trend?.value && trend.value > 0 ? "up" : "down";

  return (
    <div className={cn(
      "rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-[#316ee0]/25 hover:bg-white/[0.05]",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/45 tracking-wide uppercase">{title}</p>
          <p className="mt-2 text-3xl font-light text-white tracking-tight">
            {typeof value === "number" ? <CountUp to={value} /> : value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-white/35">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                "mt-2 flex items-center gap-1 text-xs font-medium",
                trendDirection === "up" && "text-green-400",
                trendDirection === "down" && "text-red-400",
                trendDirection === "neutral" && "text-white/35"
              )}
            >
              {trendDirection === "up" && <TrendingUp className="h-3 w-3" />}
              {trendDirection === "down" && <TrendingDown className="h-3 w-3" />}
              {trendDirection === "neutral" && <Minus className="h-3 w-3" />}
              <span>
                {trend.value > 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
        <div className="ml-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#316ee0]/10 text-[#316ee0] ring-1 ring-[#316ee0]/20">
          {icon}
        </div>
      </div>
    </div>
  );
}
