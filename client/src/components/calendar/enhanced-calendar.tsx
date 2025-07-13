import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Plus, X, Edit2 } from "lucide-react";
import { FaInstagram, FaFacebook, FaTiktok, FaTwitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCalendarPosts } from "@/hooks/use-posts";
import { useBrand } from "@/hooks/use-brand";
import { useIsMobile } from "@/hooks/use-mobile";

interface TooltipData {
  visible: boolean;
  posts: any[];
  date: Date | null;
  position: { x: number; y: number };
}

interface MobilePopoutData {
  visible: boolean;
  posts: any[];
  date: Date | null;
}

interface EnhancedCalendarProps {
  onDateSelect?: (date: Date | null) => void;
  selectedDate?: Date | null;
  onCreatePost?: (date?: Date) => void;
  onEditPost?: (post: any, date?: Date) => void;
  showCreateButton?: boolean;
  title?: string;
  className?: string;
}

export default function EnhancedCalendar({
  onDateSelect,
  selectedDate: externalSelectedDate,
  onCreatePost,
  onEditPost,
  showCreateButton = false,
  title = "Content Calendar",
  className
}: EnhancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData>({
    visible: false,
    posts: [],
    date: null,
    position: { x: 0, y: 0 }
  });
  const [mobilePopout, setMobilePopout] = useState<MobilePopoutData>({
    visible: false,
    posts: [],
    date: null
  });
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  
  const { selectedBrand } = useBrand();
  const isMobile = useIsMobile();
  const calendarRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Use external selectedDate if provided, otherwise use internal state
  const selectedDate = externalSelectedDate ?? internalSelectedDate;
  
  // Get posts for the current month only for the selected brand
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const { data: posts = [] } = useCalendarPosts(monthStart, monthEnd, selectedBrand?.id);

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

  const handleDateClick = (date: Date) => {
    const now = Date.now();
    const dayPosts = getPostsForDate(date);
    const timeSinceLastClick = now - lastClickTime;
    const isDoubleClick = timeSinceLastClick < 500;
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(date);
    clickedDate.setHours(0, 0, 0, 0);
    const isDateInPast = clickedDate < today;
    
    // Handle mobile
    if (isMobile) {
      if (dayPosts.length > 0) {
        // Show popout for posts on mobile
        setMobilePopout({
          visible: true,
          posts: dayPosts,
          date
        });
        return;
      } else if (!isDateInPast) {
        // Show create post popout for empty dates (not in past)
        setMobilePopout({
          visible: true,
          posts: [],
          date
        });
        return;
      }
    } else {
      // Handle desktop
      if (dayPosts.length > 0) {
        if (isDoubleClick) {
          // Double-click on existing posts opens first post for editing
          if (dayPosts[0]) {
            onEditPost?.(dayPosts[0], date);
            return;
          }
        }
      } else if (isDoubleClick && !isDateInPast) {
        // Double-click on empty dates (not in past) opens create post
        onCreatePost?.(date);
        return;
      }
    }
    
    setLastClickTime(now);
    
    const newSelectedDate = selectedDate?.toDateString() === date.toDateString() ? null : date;
    
    if (externalSelectedDate === undefined) {
      setInternalSelectedDate(newSelectedDate);
    }
    
    onDateSelect?.(newSelectedDate);
  };

  const handleDateHover = (event: React.MouseEvent, date: Date) => {
    // Only show hover tooltip on desktop
    if (isMobile) return;
    
    const dayPosts = getPostsForDate(date);
    const rect = event.currentTarget.getBoundingClientRect();
    
    setTooltip({
      visible: true,
      posts: dayPosts,
      date,
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      }
    });
  };

  const handleMouseLeave = () => {
    // Only hide tooltip on desktop
    if (!isMobile) {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  };
  
  const closeMobilePopout = () => {
    setMobilePopout({ visible: false, posts: [], date: null });
  };
  
  const handlePostEdit = (post: any) => {
    onEditPost?.(post, mobilePopout.date || undefined);
    closeMobilePopout();
  };
  
  const handleCreateFromPopout = () => {
    onCreatePost?.(mobilePopout.date || undefined);
    closeMobilePopout();
  };

  // Platform icons mapping
  const platformIcons = {
    instagram: FaInstagram,
    facebook: FaFacebook,
    tiktok: FaTiktok,
    twitter: FaTwitter,
  };

  const platformColors = {
    instagram: "text-pink-500",
    facebook: "text-blue-600",
    tiktok: "text-gray-900",
    twitter: "text-blue-400",
  };

  // Add swipe gesture support for mobile
  useEffect(() => {
    if (!isMobile || !calendarRef.current) return;

    let startX: number;
    let startY: number;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!startX || !startY) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = startX - currentX;
      const diffY = startY - currentY;

      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        e.preventDefault();
        
        if (diffX > 0) {
          navigateMonth('next');
        } else {
          navigateMonth('prev');
        }
      }
    };

    const handleTouchEnd = () => {
      startX = 0;
      startY = 0;
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
  }, [isMobile]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Check if selected date is in the past
  const isSelectedDateInPast = selectedDate && selectedDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className={cn("text-lg", isMobile && "text-base")}>
              {title}
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
          
          {/* Create Post Button with validation */}
          {showCreateButton && (
            <div className="flex justify-end mt-2">
              <Button
                onClick={() => onCreatePost?.(selectedDate || undefined)}
                disabled={isSelectedDateInPast}
                className={cn(
                  "min-h-[44px]",
                  isSelectedDateInPast && "opacity-50 cursor-not-allowed"
                )}
              >
                <Plus className="h-4 w-4 mr-2" />
                {selectedDate ? "Schedule Post" : "Create Post"}
              </Button>
            </div>
          )}
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
          
          {/* Calendar Grid */}
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
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              
              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={(e) => handleDateHover(e, date)}
                  onMouseLeave={handleMouseLeave}
                  className={cn(
                    "calendar-day p-2 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative touch-active transition-colors",
                    isToday && "bg-primary/10 dark:bg-primary/20 border-primary",
                    isSelected && "bg-blue-100 dark:bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/50",
                    isMobile && "min-h-[60px] touch-manipulation"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday && "text-primary font-bold"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  {/* Enhanced post indicators with icons and thumbnails */}
                  {dayPosts.length > 0 && (
                    <div className="space-y-1">
                      {dayPosts.slice(0, isMobile ? 1 : 2).map((post, postIndex) => (
                        <div key={postIndex} className="flex items-center space-x-1">
                          {/* Platform icons */}
                          <div className="flex -space-x-1">
                            {post.platforms?.slice(0, 3).map((platform: string, platformIndex: number) => {
                              const IconComponent = platformIcons[platform as keyof typeof platformIcons];
                              return IconComponent ? (
                                <div
                                  key={platformIndex}
                                  className="w-4 h-4 bg-white rounded-full flex items-center justify-center border border-gray-200"
                                >
                                  <IconComponent 
                                    className={cn(
                                      "w-3 h-3",
                                      platformColors[platform as keyof typeof platformColors]
                                    )} 
                                  />
                                </div>
                              ) : null;
                            })}
                          </div>
                          
                          {/* Media thumbnail */}
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300 overflow-hidden">
                              <img 
                                src={post.mediaUrls[0]} 
                                alt="" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          
                          {/* Content preview (truncated) */}
                          <div className="text-xs text-gray-600 truncate flex-1 min-w-0">
                            {post.content?.substring(0, 15)}...
                          </div>
                        </div>
                      ))}
                      
                      {/* Show more indicator */}
                      {dayPosts.length > (isMobile ? 1 : 2) && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayPosts.length - (isMobile ? 1 : 2)} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Mobile Swipe Hint */}
          {isMobile && (
            <div className="text-center text-xs text-gray-500 mt-4">
              Swipe left/right to navigate months
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desktop Tooltip */}
      {tooltip.visible && !isMobile && (
        <div
          ref={tooltipRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-[300px] max-w-[400px]"
          style={{
            left: `${tooltip.position.x}px`,
            top: `${tooltip.position.y}px`,
            transform: 'translate(-50%, -100%)',
            zIndex: 1000
          }}
        >
          <div className="mb-2">
            <h4 className="font-semibold text-sm">
              {tooltip.date?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h4>
            {tooltip.posts.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">Double-click to edit first post</p>
            )}
          </div>
          
          {tooltip.posts.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {tooltip.posts.map((post, index) => (
                <div key={index} className="border-b border-gray-100 pb-2 last:border-b-0">
                  {/* Platforms */}
                  <div className="flex items-center space-x-2 mb-2">
                    {post.platforms?.map((platform: string, idx: number) => {
                      const IconComponent = platformIcons[platform as keyof typeof platformIcons];
                      return IconComponent ? (
                        <div key={idx} className="flex items-center space-x-1">
                          <IconComponent 
                            className={cn(
                              "w-4 h-4",
                              platformColors[platform as keyof typeof platformColors]
                            )} 
                          />
                          <span className="text-xs text-gray-600 capitalize">{platform}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  {/* Content preview */}
                  <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                    {post.content}
                  </p>
                  
                  {/* Media thumbnails */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="flex space-x-2 mb-2">
                      {post.mediaUrls.slice(0, 3).map((url: string, idx: number) => (
                        <img 
                          key={idx}
                          src={url} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded border border-gray-200"
                        />
                      ))}
                      {post.mediaUrls.length > 3 && (
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{post.mediaUrls.length - 3}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Status and time */}
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded",
                      post.status === 'published' && "bg-green-100 text-green-800",
                      post.status === 'scheduled' && "bg-blue-100 text-blue-800",
                      post.status === 'draft' && "bg-gray-100 text-gray-800"
                    )}>
                      {post.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(post.scheduledAt).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No posts scheduled for this date</p>
              <p className="text-xs text-gray-400 mt-1">Click to create a new post</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Popout Dialog */}
      <Dialog open={mobilePopout.visible} onOpenChange={closeMobilePopout}>
        <DialogContent className="max-w-[90vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>
                {mobilePopout.date?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </DialogTitle>
            <DialogDescription>
              {mobilePopout.posts.length > 0 
                ? "Tap any post below to edit it" 
                : "No posts scheduled for this date. Tap below to create one."}
            </DialogDescription>
          </DialogHeader>
          
          {mobilePopout.posts.length > 0 ? (
            <div className="space-y-4">
              {mobilePopout.posts.map((post, index) => (
                <div 
                  key={index} 
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handlePostEdit(post)}
                >
                  {/* Platforms */}
                  <div className="flex items-center space-x-3 mb-3">
                    {post.platforms?.map((platform: string, idx: number) => {
                      const IconComponent = platformIcons[platform as keyof typeof platformIcons];
                      return IconComponent ? (
                        <div key={idx} className="flex items-center space-x-2">
                          <IconComponent 
                            className={cn(
                              "w-5 h-5",
                              platformColors[platform as keyof typeof platformColors]
                            )} 
                          />
                          <span className="text-sm text-gray-700 capitalize font-medium">{platform}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                  
                  {/* Content preview */}
                  <p className="text-gray-800 mb-3 leading-relaxed">
                    {post.content}
                  </p>
                  
                  {/* Media thumbnails */}
                  {post.mediaUrls && post.mediaUrls.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {post.mediaUrls.slice(0, 6).map((url: string, idx: number) => (
                        <img 
                          key={idx}
                          src={url} 
                          alt="" 
                          className="w-full h-20 object-cover rounded border border-gray-200"
                        />
                      ))}
                      {post.mediaUrls.length > 6 && (
                        <div className="w-full h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-sm text-gray-600 font-medium">+{post.mediaUrls.length - 6}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Status and time */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className={cn(
                      "text-sm px-3 py-1 rounded-full font-medium",
                      post.status === 'published' && "bg-green-100 text-green-800",
                      post.status === 'scheduled' && "bg-blue-100 text-blue-800",
                      post.status === 'draft' && "bg-gray-100 text-gray-800"
                    )}>
                      {post.status}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(post.scheduledAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <Edit2 className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center py-2">
                <p className="text-sm text-gray-500">Tap any post above to edit</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No posts scheduled for this date</p>
              <Button 
                onClick={handleCreateFromPopout}
                className="min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}