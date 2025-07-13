import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { usePosts } from "@/hooks/use-posts";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ContentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { data: posts } = usePosts();
  const isMobile = useIsMobile();
  const calendarRef = useRef<HTMLDivElement>(null);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();
  
  const getPostsForDate = (date: Date | null) => {
    if (!date || !posts) return [];
    
    return posts.filter(post => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  // Add swipe gesture support for mobile
  useEffect(() => {
    if (!isMobile || !calendarRef.current) return;

    let startX: number;
    let startY: number;
    let isSwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwipe = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      // Detect horizontal swipe (more horizontal than vertical movement)
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        isSwipe = true;
        e.preventDefault(); // Prevent scrolling
        
        // Swipe left to go to next month
        if (diffX > 0) {
          navigateMonth('next');
        }
        // Swipe right to go to previous month
        else {
          navigateMonth('prev');
        }
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
      isSwipe = false;
    };

    const element = calendarRef.current;
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, navigateMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const platformColors: Record<string, string> = {
    instagram: "bg-pink-200 dark:bg-pink-800",
    facebook: "bg-blue-200 dark:bg-blue-800", 
    tiktok: "bg-gray-900 dark:bg-gray-300",
    twitter: "bg-blue-200 dark:bg-blue-800",
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn("text-lg", isMobile && "text-base")}>
            Content Calendar
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "icon"}
              onClick={() => navigateMonth('prev')}
              className={cn(
                "touch-manipulation select-none",
                isMobile && "min-h-[44px] px-3"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 min-w-[120px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "icon"}
              onClick={() => navigateMonth('next')}
              className={cn(
                "touch-manipulation select-none",
                isMobile && "min-h-[44px] px-3"
              )}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid with Touch Gesture Support */}
        <div 
          ref={calendarRef}
          className={cn(
            "grid grid-cols-7 gap-1 mb-4 select-none-touch",
            isMobile && "touch-manipulation"
          )}
        >
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="calendar-day" />;
            }
            
            const dayPosts = getPostsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={index}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "calendar-day p-2 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative touch-active transition-colors",
                  isToday && "bg-primary/10 dark:bg-primary/20 border-primary",
                  selectedDate?.toDateString() === date.toDateString() && "bg-blue-100 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/50",
                  isMobile && "min-h-[60px] touch-manipulation"
                )}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday && "text-primary font-bold"
                )}>
                  {date.getDate()}
                </div>
                
                {dayPosts.length > 0 && (
                  <div className="space-y-1">
                    {dayPosts.slice(0, 2).map((post, postIndex) => (
                      <div key={postIndex} className="space-y-0.5">
                        {post.platforms?.slice(0, 2).map((platform, platformIndex) => (
                          <div
                            key={platformIndex}
                            className={cn(
                              "w-full h-1 rounded platform-" + platform,
                              platformColors[platform] || "bg-gray-300"
                            )}
                            title={`${platform} post scheduled`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Platform Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full" />
            <span>Instagram</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span>Facebook</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-900 dark:bg-gray-300 rounded-full" />
            <span>TikTok</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-400 rounded-full" />
            <span>Twitter</span>
          </div>
        </div>
        
        {/* Mobile Swipe Hint */}
        {isMobile && (
          <div className="text-center text-xs text-gray-500 mt-4">
            Swipe left/right to navigate months
          </div>
        )}
      </CardContent>
      
      {/* Mobile Floating Action Button - Temporarily removed to prevent conflicts */}
      {/* Floating button removed to avoid conflicts with mobile navigation */}
    </Card>
  );
}
