import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  BarChart3, 
  Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import PostEditorModal from "@/components/posts/post-editor-modal";
import QuickThemePicker from "@/components/theme/quick-theme-picker";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    name: "Drafts",
    href: "/drafts",
    icon: FileText,
    badge: "5",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export default function MobileNav() {
  const [location] = useLocation();
  const [showPostEditor, setShowPostEditor] = useState(false);

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg safe-area-inset-bottom">
        <div className="flex items-center justify-around py-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location === item.href 
              : location.startsWith(item.href) && item.href !== "/";

            // Add FAB in the middle
            if (index === 2) {
              return (
                <div key="fab" className="flex flex-col items-center">
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg touch-manipulation select-none-touch touch-active"
                    onClick={() => setShowPostEditor(true)}
                    aria-label="Create new post"
                  >
                    <Plus className="h-6 w-6 text-white" />
                  </Button>
                </div>
              );
            }

            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={cn(
                    "flex flex-col items-center space-y-1 px-2 py-3 relative transition-colors touch-manipulation select-none-touch min-w-[60px] min-h-[44px]",
                    isActive 
                      ? "text-primary" 
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.name}</span>
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-xs bg-orange-500 text-white"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </a>
              </Link>
            );
          })}
        </div>
        
        {/* Quick Theme Picker for Mobile */}
        <QuickThemePicker />
      </nav>

      <PostEditorModal 
        open={showPostEditor} 
        onOpenChange={setShowPostEditor} 
      />
    </>
  );
}
