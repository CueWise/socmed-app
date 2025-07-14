import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import EnhancedCaptionField from "@/components/ui/enhanced-caption-field";
import InstagramMediaThumbnail from "@/components/ui/instagram-media-thumbnail";
import { 
  X, ArrowLeft, Upload, Trash2, MoreHorizontal, 
  StickyNote, Calendar, Hash, Sparkles, ChevronLeft, 
  ChevronRight, Download, Play 
} from "lucide-react";
import { 
  FaInstagram, FaFacebook, FaTwitter, FaTiktok, 
  FaPlus, FaPaperPlane, FaRegClock, FaRegSave,
  FaRegCalendarAlt, FaRegCompass, FaRegCopy, 
  FaRegBookmark, FaRegHeart, FaRegComment, FaShareAlt
} from "react-icons/fa";

interface PostEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  postId?: number;
  initialData?: any;
}

const platforms = [
  { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-500' },
  { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
  { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-blue-400' },
  { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'text-black' }
];

interface PostData {
  content: string;
  platforms: string[];
  scheduledAt?: Date;
  mediaUrls?: string[];
  mediaTypes?: string[];
  hashtags?: string[];
  status: string;
  notes?: string;
  brandId?: number;
  createdBy?: string;
}

export default function PostEditorModal({ 
  open, 
  onOpenChange, 
  defaultDate,
  postId,
  initialData 
}: PostEditorModalProps) {
  // State management
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(defaultDate);
  const [status, setStatus] = useState("draft");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaTypes, setMediaTypes] = useState<string[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  
  // UI state
  const [isDesktop, setIsDesktop] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [selectedPreviewPlatform, setSelectedPreviewPlatform] = useState('instagram');
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Desktop detection
  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  // Initialize data
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      setSelectedPlatforms(initialData.platforms || []);
      setStatus(initialData.status || "draft");
      setMediaUrls(initialData.mediaUrls || []);
      setMediaTypes(initialData.mediaTypes || []);
      setHashtags(initialData.hashtags || []);
    }
  }, [initialData]);

  // Set initial preview platform
  useEffect(() => {
    if (selectedPlatforms.length > 0) {
      setSelectedPreviewPlatform(selectedPlatforms[0]);
    }
  }, [selectedPlatforms]);

  // Mutations
  const createPostMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) throw new Error('Failed to save post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({ title: postId ? "Post updated!" : "Post created!" });
      handleClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to save post", variant: "destructive" });
    }
  });

  // Handle functions
  const handleClose = () => {
    onOpenChange(false);
    setContent("");
    setSelectedPlatforms([]);
    setMediaFiles([]);
    setMediaUrls([]);
    setMediaTypes([]);
    setShowNotes(false);
    setShowMainMenu(false);
  };

  const handleSubmit = () => {
    if (!content.trim() || selectedPlatforms.length === 0) return;
    
    const postData: PostData = {
      content: content.trim(),
      platforms: selectedPlatforms,
      scheduledAt,
      mediaUrls,
      mediaTypes,
      hashtags,
      status,
      brandId: 1, // Default brand
      createdBy: "current-user"
    };
    
    createPostMutation.mutate(postData);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setMediaFiles(prev => [...prev, ...files]);
    
    // Upload files and get URLs
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        if (response.ok) {
          const data = await response.json();
          setMediaUrls(prev => [...prev, data.url]);
          setMediaTypes(prev => [...prev, file.type]);
        }
      } catch (error) {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    }
  };

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const removeMedia = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
    setMediaTypes(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const allMedia = mediaUrls.map((url, index) => ({
    url,
    type: mediaTypes[index] || 'image/jpeg'
  }));

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className={cn(
        "bg-white rounded-xl shadow-2xl overflow-hidden flex",
        isDesktop 
          ? "w-[90vw] h-[85vh] max-w-none" 
          : "w-full max-w-4xl h-[95vh] flex-col"
      )}>
        
        {isDesktop ? (
          <>
            {/* Desktop Layout - Side by Side */}
            {/* Left Panel - Edit Form (60%) */}
            <div className="w-[60%] flex flex-col border-r border-gray-200">
              {/* Header */}
              <div className="h-16 border-b bg-white flex items-center justify-between px-6">
                <h1 className="text-xl font-semibold">
                  {postId ? "Edit Post" : "Create Post"}
                </h1>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotes(!showNotes)}
                    className="p-2"
                  >
                    <StickyNote className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMainMenu(!showMainMenu)}
                    className="p-2"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Platform Selection */}
                <div>
                  <Label className="text-sm font-medium">Platforms</Label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      return (
                        <div
                          key={platform.id}
                          onClick={() => handlePlatformToggle(platform.id)}
                          className={cn(
                            "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                            isSelected 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className={cn("h-5 w-5", platform.color)} />
                            <span className="font-medium">{platform.name}</span>
                            <Checkbox 
                              checked={isSelected}
                              className="ml-auto"
                              readOnly
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <Label className="text-sm font-medium">Caption</Label>
                  <div className="mt-2">
                    <EnhancedCaptionField
                      value={content}
                      onChange={setContent}
                      placeholder="Write your caption..."
                      maxLength={2200}
                      className="min-h-[120px]"
                    />
                  </div>
                </div>

                {/* Media Upload */}
                <div>
                  <Label className="text-sm font-medium">Media</Label>
                  <div className="mt-2 space-y-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-dashed"
                    >
                      <div className="text-center">
                        <Upload className="h-6 w-6 mx-auto mb-2 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          Upload photos and videos
                        </span>
                      </div>
                    </Button>

                    {/* Media Thumbnails */}
                    {allMedia.length > 0 && (
                      <div className="grid grid-cols-3 gap-3">
                        {allMedia.map((media, index) => (
                          <div key={index} className="relative group">
                            <InstagramMediaThumbnail
                              src={media.url}
                              alt={`Media ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeMedia(index)}
                              className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-3 pt-6">
                  <Button
                    onClick={handleSubmit}
                    disabled={createPostMutation.isPending || !content.trim() || selectedPlatforms.length === 0}
                    className="w-full"
                  >
                    {createPostMutation.isPending ? "Saving..." : postId ? "Update Post" : "Create Post"}
                  </Button>
                  <Button variant="outline" onClick={handleClose} className="w-full">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Preview (40%) */}
            <div className="w-[40%] bg-gray-50 relative">
              {/* Preview Header */}
              <div className="h-16 border-b bg-white flex items-center justify-between px-4">
                <h3 className="text-lg font-semibold">Post Preview</h3>
              </div>
              
              {/* Platform Tabs */}
              <div className="flex border-b bg-white">
                {selectedPlatforms.map((platformId) => {
                  const platform = platforms.find(p => p.id === platformId);
                  if (!platform) return null;
                  const Icon = platform.icon;
                  const isActive = selectedPreviewPlatform === platformId;
                  return (
                    <button
                      key={platformId}
                      onClick={() => setSelectedPreviewPlatform(platformId)}
                      className={cn(
                        "flex-1 p-3 flex items-center justify-center gap-2 hover:bg-gray-100 border-b-2 transition-colors",
                        isActive 
                          ? "border-blue-500 bg-white text-blue-600" 
                          : "border-transparent text-gray-600"
                      )}
                    >
                      <Icon className={cn("h-4 w-4", platform.color)} />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {selectedPlatforms.length > 0 ? (
                  <div className="space-y-4">
                    {selectedPreviewPlatform === 'instagram' && (
                      <div className="bg-white rounded-lg p-4 shadow-sm max-w-sm mx-auto">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full"></div>
                          <div>
                            <div className="font-semibold text-sm">brand_name</div>
                            <div className="text-xs text-gray-500">Just now</div>
                          </div>
                        </div>
                        
                        {allMedia.length > 0 && (
                          <div className="rounded-lg overflow-hidden mb-3">
                            <InstagramMediaThumbnail
                              src={allMedia[0].url}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                        
                        {content && <div className="text-sm mb-3">{content}</div>}
                        
                        <div className="flex items-center justify-between text-gray-600">
                          <div className="flex items-center gap-4">
                            <FaRegHeart className="h-5 w-5" />
                            <FaRegComment className="h-5 w-5" />
                            <FaShareAlt className="h-5 w-5" />
                          </div>
                          <FaRegBookmark className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 mt-8">
                    Select platforms to see preview
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Mobile Layout */
          <div className="flex-1 flex flex-col">
            {/* Mobile Header */}
            <div className="h-16 border-b bg-white flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {postId ? "Edit Post" : "Create Post"}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNotes(!showNotes)}
                  className="p-2"
                >
                  <StickyNote className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMainMenu(!showMainMenu)}
                  className="p-2"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Mobile Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Mobile form content would go here */}
            </div>
          </div>
        )}

        {/* Sliding Menu */}
        <div className={cn(
          "fixed top-0 right-0 h-full bg-white/95 backdrop-blur-sm border-l shadow-lg transform transition-transform duration-300 ease-in-out z-20",
          isDesktop ? "w-[40%]" : "w-80",
          showMainMenu ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Menu Header */}
          <div className="h-16 border-b flex items-center justify-between px-6">
            <h3 className="font-semibold text-lg">Menu</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMainMenu(false)}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Menu Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => {
                      setStatus('draft');
                      handleSubmit();
                    }}
                    disabled={!content.trim() || selectedPlatforms.length === 0}
                  >
                    <FaRegSave className="mr-2 h-4 w-4" />
                    Save as Draft
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}