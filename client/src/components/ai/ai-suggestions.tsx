import { TrendingUp, Lightbulb, Hash, CalendarCheck2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AISuggestion {
  id: string;
  type: "timing" | "content" | "hashtag" | "trend";
  title: string;
  description: string;
  action?: string;
  priority: "high" | "medium" | "low";
}

export default function AISuggestions() {
  // Mock suggestions - in real app these would come from API
  const suggestions: AISuggestion[] = [
    {
      id: "1",
      type: "timing",
      title: "Optimal posting time",
      description: "Post at 2:00 PM for 23% higher engagement based on your audience activity",
      action: "CalendarCheck2 for 2:00 PM",
      priority: "high",
    },
    {
      id: "2", 
      type: "content",
      title: "Content idea",
      description: '"How-to" posts get 67% more engagement this week. Consider creating tutorial content.',
      action: "Create tutorial",
      priority: "medium",
    },
    {
      id: "3",
      type: "hashtag",
      title: "Trending hashtags",
      description: "#TechTrends2024 is gaining momentum in your industry (+45% usage)",
      action: "Use hashtag",
      priority: "medium",
    },
    {
      id: "4",
      type: "trend",
      title: "Audience engagement",
      description: "Video content performs 3x better than images for your audience this month",
      priority: "low",
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "timing":
        return <CalendarCheck2 className="h-5 w-5" />;
      case "content":
        return <Lightbulb className="h-5 w-5" />;
      case "hashtag":
        return <Hash className="h-5 w-5" />;
      case "trend":
        return <TrendingUp className="h-5 w-5" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getColorClasses = (type: string) => {
    switch (type) {
      case "timing":
        return "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-600 dark:text-purple-400";
      case "content":
        return "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 text-blue-600 dark:text-blue-400";
      case "hashtag":
        return "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400";
      case "trend":
        return "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 text-orange-600 dark:text-orange-400";
      default:
        return "from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 text-gray-600 dark:text-gray-400";
    }
  };

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case "high":
        return "w-2 h-2 bg-red-500 rounded-full";
      case "medium":
        return "w-2 h-2 bg-orange-500 rounded-full";
      case "low":
        return "w-2 h-2 bg-green-500 rounded-full";
      default:
        return "w-2 h-2 bg-gray-500 rounded-full";
    }
  };

  const handleSuggestionAction = (suggestion: AISuggestion) => {
    console.log("Acting on suggestion:", suggestion);
    // Implementation would vary based on suggestion type
    switch (suggestion.type) {
      case "timing":
        // Open post scheduler with suggested time
        break;
      case "content":
        // Open content creator with suggested topic
        break;
      case "hashtag":
        // Add hashtag to clipboard or saved hashtags
        break;
      case "trend":
        // Show trend details or content ideas
        break;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span className="material-icons text-primary">auto_awesome</span>
          <span>AI Suggestions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              "p-4 rounded-lg bg-gradient-to-r",
              getColorClasses(suggestion.type)
            )}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(suggestion.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {suggestion.title}
                  </p>
                  <div className={getPriorityDot(suggestion.priority)} />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                  {suggestion.description}
                </p>
                {suggestion.action && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSuggestionAction(suggestion)}
                    className="text-xs h-7 px-3"
                  >
                    {suggestion.action}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* View More Link */}
        <Button
          variant="ghost"
          className="w-full text-primary hover:text-primary/80 text-sm"
        >
          View All AI Suggestions
        </Button>
      </CardContent>
    </Card>
  );
}
