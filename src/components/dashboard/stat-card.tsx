"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {typeof value === "number" ? <CountUp to={value} /> : value}
            </p>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs font-medium",
                  trendDirection === "up" && "text-green-600",
                  trendDirection === "down" && "text-red-600",
                  trendDirection === "neutral" && "text-muted-foreground"
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
          <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
