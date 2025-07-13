import { useState } from "react";
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostEditorModal from "@/components/posts/post-editor-modal";
import EnhancedCalendar from "@/components/calendar/enhanced-calendar";
import { useBrand } from "@/hooks/use-brand";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Calendar() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [platformFilter, setPlatformFilter] = useState("all");
  
  const { selectedBrand } = useBrand();
  const isMobile = useIsMobile();

  const handleCreatePost = (date?: Date) => {
    setShowPostEditor(true);
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
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
        </div>
      </div>

      {/* Enhanced Calendar */}
      <EnhancedCalendar
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onCreatePost={handleCreatePost}
        showCreateButton={true}
        title="Content Calendar"
      />

      {/* Post Editor Modal */}
      <PostEditorModal
        open={showPostEditor}
        onOpenChange={setShowPostEditor}
        defaultDate={selectedDate || undefined}
        postId={editingPost?.id}
        initialData={editingPost}
      />
    </div>
  );
}