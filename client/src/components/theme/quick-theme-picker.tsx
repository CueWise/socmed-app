import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface QuickTheme {
  name: string;
  color: string;
  primaryHsl: string;
}

const quickThemes: QuickTheme[] = [
  { name: "Ocean Blue", color: "#3b82f6", primaryHsl: "220 98% 61%" },
  { name: "Forest Green", color: "#16a34a", primaryHsl: "142 76% 36%" },
  { name: "Sunset Orange", color: "#f97316", primaryHsl: "25 95% 53%" },
  { name: "Royal Purple", color: "#8b5cf6", primaryHsl: "271 81% 56%" },
  { name: "Cherry Red", color: "#ef4444", primaryHsl: "0 84% 60%" },
  { name: "Rose Pink", color: "#ec4899", primaryHsl: "330 81% 60%" }
];

export default function QuickThemePicker() {
  const [selectedTheme, setSelectedTheme] = useState(quickThemes[0]);

  const applyTheme = (theme: QuickTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primaryHsl);
    
    // Save theme preference
    localStorage.setItem('socialflow-quick-theme', JSON.stringify(theme));
    setSelectedTheme(theme);
  };

  // Load saved theme on component mount
  useState(() => {
    const savedTheme = localStorage.getItem('socialflow-quick-theme');
    if (savedTheme) {
      try {
        const theme = JSON.parse(savedTheme);
        applyTheme(theme);
      } catch (e) {
        console.log('Failed to load saved theme');
      }
    }
  });

  return (
    <div className="flex items-center space-x-2 p-3 border-t border-gray-200 dark:border-gray-700">
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        Quick Colors:
      </span>
      <div className="flex space-x-2">
        {quickThemes.map((theme) => (
          <Button
            key={theme.name}
            variant="ghost"
            size="sm"
            className={cn(
              "w-8 h-8 p-0 rounded-full border-2 transition-all touch-manipulation",
              selectedTheme.name === theme.name 
                ? "border-gray-800 dark:border-gray-200 ring-2 ring-offset-1 ring-gray-400" 
                : "border-gray-300 hover:border-gray-400"
            )}
            style={{ backgroundColor: theme.color }}
            onClick={() => applyTheme(theme)}
            aria-label={`Apply ${theme.name} theme`}
          >
            {selectedTheme.name === theme.name && (
              <Check className="h-3 w-3 text-white drop-shadow-sm" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}