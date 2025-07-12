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
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {value}
            </p>
            {(change || subtitle) && (
              <div className="mt-2 flex items-center">
                {change && (
                  <div className={cn(
                    "flex items-center text-sm font-medium",
                    changeColorClasses[changeType]
                  )}>
                    {changeType === "positive" && <TrendingUp className="h-3 w-3 mr-1" />}
                    {changeType === "negative" && <TrendingDown className="h-3 w-3 mr-1" />}
                    <span>{change}</span>
                  </div>
                )}
                {subtitle && !change && (
                  <span className="text-sm text-gray-500">{subtitle}</span>
                )}
                {change && subtitle && (
                  <span className="text-gray-500 text-sm ml-2">{subtitle}</span>
                )}
              </div>
            )}
          </div>
          
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            colorClasses[color]
          )}>
            <span className="material-icons text-xl">
              {icon}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
