import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";


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

  return (
    <nav className="bg-white border-t border-gray-200 shadow-lg safe-area-inset-bottom">
        <div className="flex items-center justify-around py-1 px-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location === item.href 
              : location.startsWith(item.href) && item.href !== "/";

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-3 relative transition-colors touch-manipulation select-none-touch min-w-[60px] min-h-[44px] cursor-pointer",
                    isActive 
                      ? "text-primary" 
                      : "text-gray-500 hover:text-gray-700"
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
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
  );
}
