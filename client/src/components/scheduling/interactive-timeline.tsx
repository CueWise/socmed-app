import { useState, useEffect, useRef } from "react";
import { format, addDays, startOfDay, isToday, isSameDay, addHours } from "date-fns";
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCalendarPosts } from "@/hooks/use-posts";
import { useBrandStore } from "@/hooks/use-brand";
import PostEditorModal from "@/components/posts/post-editor-modal";

// Platform colors for visual distinction
const platformColors = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  twitter: "bg-blue-400",
  tiktok: "bg-black",
  linkedin: "bg-blue-700"
};

// Time slots for the timeline (24-hour format)
const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return {
    time: `${hour}:00`,
    label: i === 0 ? '12 AM' : i === 12 ? '12 PM' : i < 12 ? `${i} AM` : `${i - 12} PM`
  };
});

// Optimal posting times by platform
const optimalTimes = {
  instagram: [9, 11, 13, 15, 17, 19, 21], // 9 AM, 11 AM, 1 PM, 3 PM, 5 PM, 7 PM, 9 PM
  facebook: [6, 9, 12, 15, 18], // 6 AM, 9 AM, 12 PM, 3 PM, 6 PM
  twitter: [8, 12, 17, 19], // 8 AM, 12 PM, 5 PM, 7 PM
  tiktok: [6, 10, 19, 20], // 6 AM, 10 AM, 7 PM, 8 PM
  linkedin: [7, 8, 17, 18] // 7 AM, 8 AM, 5 PM, 6 PM
};

interface InteractiveTimelineProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onTimeSlotClick: (date: Date, hour: number) => void;
}

export default function InteractiveTimeline({ 
  selectedDate, 
  onDateChange, 
  onTimeSlotClick 
}: InteractiveTimelineProps) {
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const { selectedBrand } = useBrandStore();

  // Generate week days starting from today
  useEffect(() => {
    const generateWeek = () => {
      const startDate = startOfDay(selectedDate);
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(addDays(startDate, i));
      }
      setCurrentWeek(week);
    };
    generateWeek();
  }, [selectedDate]);

  // Get posts for the current week
  const startOfWeek = currentWeek[0];
  const endOfWeek = currentWeek[6];
  const { data: posts = [] } = useCalendarPosts(
    startOfWeek,
    endOfWeek,
    selectedBrand?.id
  );

  // Navigate to previous/next week
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = addDays(selectedDate, direction === 'prev' ? -7 : 7);
    onDateChange(newDate);
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, hour: number) => {
    const scheduledDateTime = addHours(startOfDay(date), hour);
    setSelectedTimeSlot({ date, hour });
    onTimeSlotClick(scheduledDateTime, hour);
    setShowPostModal(true);
  };

  // Get posts for a specific date and hour
  const getPostsForTimeSlot = (date: Date, hour: number) => {
    return posts.filter(post => {
      if (!post.scheduledAt) return false;
      const postDate = new Date(post.scheduledAt);
      return isSameDay(postDate, date) && postDate.getHours() === hour;
    });
  };

  // Check if time slot is optimal for any platform
  const isOptimalTime = (hour: number) => {
    return Object.values(optimalTimes).some(times => times.includes(hour));
  };

  // Get optimal platforms for a specific hour
  const getOptimalPlatforms = (hour: number) => {
    const platforms = [];
    for (const [platform, times] of Object.entries(optimalTimes)) {
      if (times.includes(hour)) {
        platforms.push(platform);
      }
    }
    return platforms;
  };

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Interactive Scheduling Timeline
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Timeline Grid */}
          <div className="relative overflow-x-auto" ref={timelineRef}>
            <div className="min-w-[800px]">
              {/* Header with days */}
              <div className="grid grid-cols-8 gap-1 mb-4">
                <div className="text-xs font-medium text-gray-500 p-2">Time</div>
                {currentWeek.map((date, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "text-center p-2 rounded-lg transition-colors cursor-pointer",
                      isToday(date) && "bg-blue-100 text-blue-800 font-medium",
                      isSameDay(date, selectedDate) && "bg-blue-500 text-white"
                    )}
                    onClick={() => onDateChange(date)}
                  >
                    <div className="text-xs font-medium">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-lg font-bold">
                      {format(date, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline slots */}
              <div className="space-y-1">
                {timeSlots.map((slot, slotIndex) => (
                  <div key={slotIndex} className="grid grid-cols-8 gap-1">
                    {/* Time label */}
                    <div className="text-xs text-gray-500 p-2 text-right">
                      {slot.label}
                    </div>

                    {/* Time slots for each day */}
                    {currentWeek.map((date, dayIndex) => {
                      const hour = slotIndex;
                      const postsInSlot = getPostsForTimeSlot(date, hour);
                      const isOptimal = isOptimalTime(hour);
                      const optimalPlatforms = getOptimalPlatforms(hour);
                      const isPast = new Date() > addHours(startOfDay(date), hour);

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            "relative h-12 border border-gray-200 rounded-lg cursor-pointer transition-all hover:bg-gray-50",
                            isOptimal && "bg-green-50 border-green-200",
                            isPast && "bg-gray-100 opacity-60",
                            postsInSlot.length > 0 && "border-blue-300"
                          )}
                          onClick={() => !isPast && handleTimeSlotClick(date, hour)}
                        >
                          {/* Optimal time indicator */}
                          {isOptimal && (
                            <div className="absolute top-1 right-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                          )}

                          {/* Posts in this slot */}
                          {postsInSlot.map((post, postIndex) => (
                            <div
                              key={post.id}
                              className={cn(
                                "absolute inset-1 rounded text-xs text-white p-1 flex items-center justify-center",
                                post.platforms?.[0] && platformColors[post.platforms[0] as keyof typeof platformColors] || "bg-gray-500"
                              )}
                              style={{
                                top: `${postIndex * 20}%`,
                                height: `${100 / postsInSlot.length}%`
                              }}
                            >
                              <div className="truncate font-medium">
                                {post.platforms?.join(', ')}
                              </div>
                            </div>
                          ))}

                          {/* Add button for empty slots */}
                          {postsInSlot.length === 0 && !isPast && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <Plus className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Optimal posting time</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Scheduled post</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded"></div>
              <span>Available slot</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span>Past time</span>
            </div>
          </div>

          {/* Platform optimal times info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Optimal Posting Times by Platform</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {Object.entries(optimalTimes).map(([platform, times]) => (
                <div key={platform} className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded", platformColors[platform as keyof typeof platformColors])}></div>
                  <span className="capitalize">{platform}:</span>
                  <span className="text-gray-600">
                    {times.map(hour => 
                      hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour < 12 ? `${hour} AM` : `${hour - 12} PM`
                    ).join(', ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Creation Modal */}
      <PostEditorModal
        open={showPostModal}
        onOpenChange={setShowPostModal}
        defaultDate={selectedTimeSlot ? addHours(startOfDay(selectedTimeSlot.date), selectedTimeSlot.hour) : undefined}
      />
    </div>
  );
}