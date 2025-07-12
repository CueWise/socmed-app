import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAnalyticsSummary } from "@/hooks/use-analytics";
import { useBrand } from "@/hooks/use-brand";

interface StatItem {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export default function MobileStatsBar() {
  const { selectedBrand } = useBrand();
  const { data: analyticsSummary } = useAnalyticsSummary(selectedBrand?.id);

  const stats: StatItem[] = [
    {
      label: "Reach",
      value: analyticsSummary?.totalReach?.toLocaleString() || '0',
      change: 12.5,
      trend: 'up'
    },
    {
      label: "Engagement",
      value: analyticsSummary?.totalEngagement?.toLocaleString() || '0',
      change: 8.3,
      trend: 'up'
    },
    {
      label: "Views",
      value: analyticsSummary?.totalViews?.toLocaleString() || '0',
      change: -2.1,
      trend: 'down'
    },
    {
      label: "Posts",
      value: analyticsSummary?.totalPosts?.toString() || '0',
      change: 0,
      trend: 'neutral'
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return <Minus className="h-3 w-3 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex justify-between items-center space-x-1">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex-1 text-center">
            <div className="text-lg font-bold text-gray-900">
              {stat.value}
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {stat.label}
            </div>
            <div className={cn(
              "flex items-center justify-center space-x-1 text-xs",
              getTrendColor(stat.trend)
            )}>
              {getTrendIcon(stat.trend)}
              <span>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}