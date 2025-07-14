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
    href: "/brand-library",
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
    <nav className="w-full bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Mobile close button */}
      {onClose && (
        <div className="p-4 flex justify-end md:hidden">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Desktop Header */}
      <div className="hidden md:block p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CueWise</h1>
            <p className="text-sm text-gray-500">Social Media Management</p>
          </div>
        </div>
      </div>

      {/* Brand Switcher - Desktop Enhancement */}
      <div className="p-4 md:p-6 border-b border-gray-100">
        <BrandSwitcher />
      </div>

      <div className="p-4 md:p-6 space-y-2 flex-1">
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
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 w-full cursor-pointer group",
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm" 
                    : "hover:bg-gray-50 text-gray-700 hover:text-gray-900 hover:shadow-sm"
                )}
                onClick={onClose}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-colors",
                  isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                )} />
                <span className="font-medium">{item.name}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer for mobile only */}
      <div className="md:hidden p-4 border-t border-gray-200">
        <BrandSwitcher />
      </div>
    </nav>
  );
}
