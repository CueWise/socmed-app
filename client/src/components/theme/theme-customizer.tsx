import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorTheme {
  name: string;
  description: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  preview: string[];
}

const colorThemes: ColorTheme[] = [
  {
    name: "Ocean Blue",
    description: "Professional and calming",
    primary: "220 98% 61%", // Blue
    secondary: "210 40% 92%",
    accent: "210 40% 98%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    preview: ["#3b82f6", "#e2e8f0", "#f8fafc"]
  },
  {
    name: "Forest Green",
    description: "Natural and trustworthy",
    primary: "142 76% 36%", // Green
    secondary: "138 76% 97%",
    accent: "138 76% 94%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    preview: ["#16a34a", "#dcfce7", "#f0fdf4"]
  },
  {
    name: "Sunset Orange",
    description: "Creative and energetic",
    primary: "25 95% 53%", // Orange
    secondary: "25 95% 95%",
    accent: "25 95% 92%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    preview: ["#f97316", "#fed7aa", "#fff7ed"]
  },
  {
    name: "Royal Purple",
    description: "Elegant and sophisticated",
    primary: "271 81% 56%", // Purple
    secondary: "271 81% 95%",
    accent: "271 81% 92%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    preview: ["#8b5cf6", "#e9d5ff", "#faf5ff"]
  },
  {
    name: "Cherry Red",
    description: "Bold and impactful",
    primary: "0 84% 60%", // Red
    secondary: "0 84% 95%",
    accent: "0 84% 92%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    preview: ["#ef4444", "#fecaca", "#fef2f2"]
  },
  {
    name: "Rose Pink",
    description: "Modern and friendly",
    primary: "330 81% 60%", // Pink
    secondary: "330 81% 95%",
    accent: "330 81% 92%",
    background: "0 0% 100%",
    foreground: "222.2 84% 4.9%",
    preview: ["#ec4899", "#fce7f3", "#fdf2f8"]
  },
  {
    name: "Midnight Dark",
    description: "Sleek dark theme",
    primary: "220 98% 61%",
    secondary: "215 28% 17%",
    accent: "216 12% 84%",
    background: "222.2 84% 4.9%",
    foreground: "210 40% 98%",
    preview: ["#3b82f6", "#1e293b", "#0f172a"]
  },
  {
    name: "Warm Neutral",
    description: "Comfortable and balanced",
    primary: "20 14% 4%", // Warm gray
    secondary: "60 9% 98%",
    accent: "60 5% 96%",
    background: "0 0% 100%",
    foreground: "20 14% 4%",
    preview: ["#0c0a09", "#fafaf9", "#f5f5f4"]
  }
];

export default function ThemeCustomizer() {
  const [selectedTheme, setSelectedTheme] = useState(colorThemes[0]);
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = (theme: ColorTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary);
    root.style.setProperty('--secondary', theme.secondary);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--background', theme.background);
    root.style.setProperty('--foreground', theme.foreground);
    
    // Save theme preference
    localStorage.setItem('socialflow-theme', JSON.stringify(theme));
    setSelectedTheme(theme);
    setIsOpen(false);
  };

  // Load saved theme on component mount
  useState(() => {
    const savedTheme = localStorage.getItem('socialflow-theme');
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
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 touch-manipulation"
        >
          <Palette className="h-4 w-4" />
          Themes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Your Theme</DialogTitle>
          <DialogDescription>
            Choose a color scheme that matches your style and brand preferences.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {colorThemes.map((theme) => (
            <Card 
              key={theme.name}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md border-2",
                selectedTheme.name === theme.name 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-gray-200 hover:border-gray-300"
              )}
              onClick={() => applyTheme(theme)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{theme.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {theme.description}
                    </CardDescription>
                  </div>
                  {selectedTheme.name === theme.name && (
                    <Badge variant="default" className="ml-2">
                      <Check className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2 mb-3">
                  {theme.preview.map((color, index) => (
                    <div
                      key={index}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Primary</span>
                    <span 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: theme.preview[0] }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-medium mb-2">Theme Preview</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Your selected theme: <strong>{selectedTheme.name}</strong> - {selectedTheme.description}
          </p>
          <div className="flex items-center space-x-2 mt-3">
            <Button size="sm" className="touch-manipulation">Primary Button</Button>
            <Button variant="outline" size="sm" className="touch-manipulation">
              Secondary Button
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}