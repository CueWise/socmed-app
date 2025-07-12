import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  BarChart3, 
  Image, 
  Puzzle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import BrandSwitcher from "@/components/brands/brand-switcher";

interface SidebarProps {
  onClose?: () => void;
}

const navigationItems = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Content Calendar",
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
  {
    name: "Brand Library",
    href: "/library",
    icon: Image,
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Puzzle,
  },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const [location] = useLocation();

  return (
    <nav className="w-64 bg-white dark:bg-gray-800 material-shadow flex flex-col h-full">
      {/* Mobile close button */}
      {onClose && (
        <div className="p-4 flex justify-end md:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <div className="p-4 space-y-2 flex-1">
        {/* Navigation Items */}
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact 
            ? location === item.href 
            : location.startsWith(item.href) && item.href !== "/";

          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors w-full cursor-pointer",
                  isActive 
                    ? "bg-primary/10 text-primary dark:bg-primary/20" 
                    : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
                )}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Brand Switcher */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <BrandSwitcher />
      </div>
    </nav>
  );
}
