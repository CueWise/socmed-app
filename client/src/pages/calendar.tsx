import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Filter, X } from "lucide-react";
import { FaInstagram, FaFacebook, FaTiktok, FaTwitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostEditorModal from "@/components/posts/post-editor-modal";
import { usePosts } from "@/hooks/use-posts";
import { cn } from "@/lib/utils";

export default function Calendar() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [platformFilter, setPlatformFilter] = useState("all");
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    post: any;
    position: { x: number; y: number };
  }>({ visible: false, post: null, position: { x: 0, y: 0 } });
  
  const { data: posts } = usePosts();

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
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

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const platformColors: Record<string, string> = {
    instagram: "bg-pink-500",
    facebook: "bg-blue-600", 
    tiktok: "bg-gray-900 dark:bg-gray-300",
    twitter: "bg-blue-400",
  };

  // Helper function to render platform icons
  const renderPlatformIcon = (platform: string) => {
    const iconProps = { className: "h-4 w-4", style: { color: 'white' } };
    switch (platform) {
      case 'instagram': return <FaInstagram {...iconProps} />;
      case 'facebook': return <FaFacebook {...iconProps} />;
      case 'tiktok': return <FaTiktok {...iconProps} />;
      case 'twitter': return <FaTwitter {...iconProps} />;
      default: return null;
    }
  };

  // Handle calendar day click with tooltip
  const handleDayClick = (event: React.MouseEvent, date: Date) => {
    const postsForDate = getPostsForDate(date);
    if (postsForDate.length > 0) {
      const rect = event.currentTarget.getBoundingClientRect();
      setTooltip({
        visible: true,
        post: postsForDate[0], // Show first post for now
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 10
        }
      });
    }
  };

  // Handle tooltip click to open editor
  const handleTooltipClick = (post: any) => {
    setEditingPost(post);
    setShowPostEditor(true);
    setTooltip({ visible: false, post: null, position: { x: 0, y: 0 } });
  };

  // Close tooltip
  const closeTooltip = () => {
    setTooltip({ visible: false, post: null, position: { x: 0, y: 0 } });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Content Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Plan and schedule your social media content
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setShowPostEditor(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Post
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
                className="touch-target"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
                className="touch-target"
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
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
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
                  className={cn(
                    "calendar-day p-2 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer relative transition-colors",
                    isToday && "bg-primary/10 dark:bg-primary/20 border-primary",
                    isSelected && "bg-primary/20 dark:bg-primary/30"
                  )}
                  onClick={(e) => handleDayClick(e, date)}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday && "text-primary font-bold"
                  )}>
                    {date.getDate()}
                  </div>
                  
                  {dayPosts.length > 0 && (
                    <div className="space-y-1">
                      {dayPosts.slice(0, 3).map((post, postIndex) => (
                        <div key={postIndex} className="space-y-0.5">
                          {post.platforms?.map((platform, platformIndex) => (
                            <div
                              key={platformIndex}
                              className={cn(
                                "w-full h-1 rounded",
                                platformColors[platform] || "bg-gray-300"
                              )}
                              title={`${platform} post: ${post.content.slice(0, 50)}...`}
                            />
                          ))}
                        </div>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayPosts.length - 3} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Platform Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {Object.entries(platformColors).map(([platform, color]) => (
              <div key={platform} className="flex items-center space-x-2">
                <div className={cn("w-3 h-3 rounded-full", color)} />
                <span className="capitalize">{platform}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Date Details */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getPostsForDate(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No posts scheduled for this date
              </p>
            ) : (
              <div className="space-y-4">
                {getPostsForDate(selectedDate).map((post) => (
                  <div key={post.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {post.platforms?.map((platform) => (
                          <div key={platform} className="flex items-center space-x-1">
                            <div className={cn("w-2 h-2 rounded-full", platformColors[platform])} />
                            <span className="text-xs capitalize">{platform}</span>
                          </div>
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(post.scheduledAt!).toLocaleTimeString()}
                      </span>
                    </div>
                    {/* Media Preview */}
                    {post.mediaUrls && post.mediaUrls.length > 0 && (
                      <div className="mb-3">
                        <div className="grid grid-cols-2 gap-2">
                          {post.mediaUrls.slice(0, 4).map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                              {url.includes('.mp4') || url.includes('video') ? (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-xs text-gray-500">Video</span>
                                </div>
                              ) : (
                                <img 
                                  src={url} 
                                  alt={`Media ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                                      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                                        <rect width="100" height="100" fill="#f3f4f6"/>
                                        <text x="50" y="50" font-family="Arial" font-size="12" fill="#9ca3af" text-anchor="middle" dy="4">Image</text>
                                      </svg>
                                    `)}`;
                                  }}
                                />
                              )}
                              {post.mediaUrls.length > 4 && index === 3 && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">+{post.mediaUrls.length - 4}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                      {post.content.slice(0, 150)}...
                    </p>
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        post.status === 'scheduled' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        post.status === 'draft' && "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
                        post.status === 'pending_approval' && "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      )}>
                        {post.status.replace('_', ' ')}
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setEditingPost(post);
                          setShowPostEditor(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Preview Tooltip */}
      {tooltip.visible && tooltip.post && (
        <>
          {/* Backdrop to close tooltip */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={closeTooltip}
          />
          {/* Tooltip */}
          <div 
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm"
            style={{
              left: tooltip.position.x - 150, // Center horizontally
              top: tooltip.position.y - 200, // Position above click point
            }}
          >
            {/* Close button */}
            <button
              onClick={closeTooltip}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>

            {/* Clickable content area */}
            <div 
              className="cursor-pointer space-y-3 pr-8"
              onClick={() => handleTooltipClick(tooltip.post)}
            >
              {/* Thumbnail */}
              {tooltip.post.mediaUrls && tooltip.post.mediaUrls.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={tooltip.post.mediaUrls[0]} 
                    alt="Post preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `data:image/svg+xml;base64,${btoa(`
                        <svg width="100" height="60" xmlns="http://www.w3.org/2000/svg">
                          <rect width="100" height="60" fill="#f3f4f6"/>
                          <text x="50" y="30" font-family="Arial" font-size="10" fill="#9ca3af" text-anchor="middle" dy="3">Image</text>
                        </svg>
                      `)}`;
                    }}
                  />
                </div>
              )}

              {/* Platform icons */}
              <div className="flex space-x-2">
                {tooltip.post.platforms?.map((platform: string) => (
                  <div 
                    key={platform}
                    className={cn(
                      "rounded-full p-2 flex items-center justify-center",
                      platformColors[platform] || "bg-gray-400"
                    )}
                  >
                    {renderPlatformIcon(platform)}
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="flex items-center space-x-2">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  tooltip.post.status === 'scheduled' && "bg-blue-100 text-blue-800",
                  tooltip.post.status === 'draft' && "bg-gray-100 text-gray-800",
                  tooltip.post.status === 'pending_approval' && "bg-orange-100 text-orange-800"
                )}>
                  {tooltip.post.status.replace('_', ' ')}
                </span>
              </div>

              {/* Date and Time */}
              <div className="text-sm text-gray-600">
                <div className="font-medium">
                  {new Date(tooltip.post.scheduledAt).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="text-gray-500">
                  {new Date(tooltip.post.scheduledAt).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              </div>

              {/* Caption preview */}
              <div className="text-sm text-gray-700">
                <p className="line-clamp-3">
                  {tooltip.post.content.slice(0, 120)}
                  {tooltip.post.content.length > 120 && '...'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      <PostEditorModal 
        open={showPostEditor} 
        onOpenChange={(open) => {
          setShowPostEditor(open);
          if (!open) setEditingPost(null);
        }}
        defaultDate={selectedDate || undefined}
        postId={editingPost?.id}
        initialData={editingPost}
      />
    </div>
  );
}
