import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon: string;
  color: "primary" | "secondary" | "success" | "warning" | "error";
}

export default function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = "neutral",
  subtitle,
  icon, 
  color 
}: StatsCardProps) {
  const colorClasses = {
    primary: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    secondary: "bg-pink-100 dark:bg-pink-900 text-pink-600 dark:text-pink-300",
    success: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300",
    warning: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300",
    error: "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300",
  };

  const changeColorClasses = {
    positive: "text-green-600 dark:text-green-400",
    negative: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-2 sm:p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 overflow-hidden">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
              {title}
            </p>
            <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 dark:text-white truncate leading-tight">
              {value}
            </p>
            {(change || subtitle) && (
              <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center gap-1">
                {change && (
                  <div className={cn(
                    "flex items-center text-xs font-medium",
                    changeColorClasses[changeType]
                  )}>
                    {changeType === "positive" && <TrendingUp className="h-2.5 w-2.5 mr-1 flex-shrink-0" />}
                    {changeType === "negative" && <TrendingDown className="h-2.5 w-2.5 mr-1 flex-shrink-0" />}
                    <span className="truncate">{change}</span>
                  </div>
                )}
                {subtitle && (
                  <span className="text-xs text-gray-500 truncate">
                    {subtitle}
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0",
            colorClasses[color]
          )}>
            <span className="material-icons text-sm sm:text-base">
              {icon}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
