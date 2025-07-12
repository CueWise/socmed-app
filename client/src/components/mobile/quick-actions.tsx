import { useState } from "react";
import { 
  Plus, 
  Camera, 
  Calendar, 
  BarChart3, 
  Clock, 
  Zap,
  Image as ImageIcon,
  Video,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PostEditorModal from "@/components/posts/post-editor-modal";

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  color: string;
  action: () => void;
}

export default function QuickActions() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: "create-post",
      label: "New Post",
      icon: Plus,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => setShowPostEditor(true)
    },
    {
      id: "take-photo",
      label: "Photo",
      icon: Camera,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        // Trigger camera/photo upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.click();
      }
    },
    {
      id: "schedule",
      label: "Schedule",
      icon: Clock,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        // Open calendar with current time
        window.location.href = '/calendar';
      }
    },
    {
      id: "video",
      label: "Video",
      icon: Video,
      color: "bg-red-500 hover:bg-red-600",
      action: () => {
        // Trigger video upload
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.click();
      }
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: ImageIcon,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => {
        // Open gallery picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        input.click();
      }
    },
    {
      id: "analytics",
      label: "Insights",
      icon: BarChart3,
      color: "bg-indigo-500 hover:bg-indigo-600",
      action: () => {
        window.location.href = '/analytics';
      }
    }
  ];

  const mainAction = quickActions[0];
  const secondaryActions = quickActions.slice(1);

  return (
    <>
      {/* Floating Action Button with expandable menu */}
      <div className="fixed bottom-20 right-4 z-50 md:hidden">
        {/* Overlay for expanded state */}
        {isExpanded && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
        
        {/* Secondary Actions */}
        <div className={cn(
          "absolute bottom-16 right-0 space-y-3 transition-all duration-300 z-50",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}>
          {secondaryActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="flex items-center justify-end space-x-2"
                style={{
                  transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
                }}
              >
                <span className="bg-white px-3 py-1 rounded-full text-sm font-medium shadow-lg border">
                  {action.label}
                </span>
                <Button
                  size="icon"
                  className={cn(
                    "w-12 h-12 rounded-full shadow-lg text-white border-2 border-white",
                    action.color
                  )}
                  onClick={() => {
                    action.action();
                    setIsExpanded(false);
                  }}
                >
                  <Icon className="h-5 w-5" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Main FAB */}
        <div className="relative">
          <Button
            size="icon"
            className={cn(
              "w-14 h-14 rounded-full shadow-lg transition-all duration-300 text-white z-50 relative",
              mainAction.color
            )}
            onClick={() => {
              // Primary action: create post
              mainAction.action();
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
          
          {/* Small expand button */}
          <Button
            size="icon"
            className={cn(
              "w-8 h-8 rounded-full shadow-md transition-all duration-300 text-white absolute -top-2 -left-2 z-50",
              "bg-gray-600 hover:bg-gray-700",
              isExpanded && "rotate-45"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Action Bar for larger screens */}
      <div className="hidden md:flex fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-lg space-x-2 z-50">
        {quickActions.slice(0, 4).map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 rounded-full px-4"
              onClick={action.action}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm">{action.label}</span>
            </Button>
          );
        })}
      </div>

      <PostEditorModal 
        open={showPostEditor} 
        onOpenChange={setShowPostEditor} 
      />
    </>
  );
}