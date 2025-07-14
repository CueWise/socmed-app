import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import EnhancedCaptionField from "@/components/ui/enhanced-caption-field";
import InstagramMediaThumbnail from "@/components/ui/instagram-media-thumbnail";
import { 
  X, ArrowLeft, Upload, Trash2, MoreHorizontal, 
  StickyNote, Calendar, Hash, Sparkles, ChevronLeft, 
  ChevronRight, Download, Play, ChevronDown 
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
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
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
      
      // Initialize scheduled date and time
      if (initialData.scheduledAt) {
        const date = new Date(initialData.scheduledAt);
        setScheduledDate(date.toISOString().split('T')[0]);
        setScheduledTime(date.toTimeString().slice(0, 5));
        setScheduledAt(date);
      }
    }
  }, [initialData]);

  // Initialize scheduled date and time from defaultDate
  useEffect(() => {
    if (defaultDate) {
      setScheduledDate(defaultDate.toISOString().split('T')[0]);
      setScheduledTime(defaultDate.toTimeString().slice(0, 5));
    }
  }, [defaultDate]);

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
    
    // Combine scheduledDate and scheduledTime into scheduledAt
    let finalScheduledAt = scheduledAt;
    if (scheduledDate && scheduledTime) {
      finalScheduledAt = new Date(`${scheduledDate}T${scheduledTime}`);
    }
    
    const postData: PostData = {
      content: content.trim(),
      platforms: selectedPlatforms,
      scheduledAt: finalScheduledAt,
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
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
      
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setMediaUrls(prev => [...prev, ...data.urls]);
        setMediaTypes(prev => [...prev, ...data.types]);
      }
    } catch (error) {
      toast({ title: "Upload failed", variant: "destructive" });
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
          ? "w-[90vw] h-[95vh] max-w-none" 
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
              <div className="flex-1 overflow-y-auto p-6 flex flex-col space-y-6">
                {/* Platform Selection */}
                <div>
                  <Label className="text-sm font-medium">Platform Selection</Label>
                  <div className="mt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between"
                        >
                          <div className="flex items-center gap-2">
                            {selectedPlatforms.length > 0 ? (
                              <div className="flex items-center gap-1">
                                {platforms
                                  .filter(p => selectedPlatforms.includes(p.id))
                                  .map((platform) => {
                                    const Icon = platform.icon;
                                    return (
                                      <Icon key={platform.id} className={cn("h-4 w-4", platform.color)} />
                                    );
                                  })}
                              </div>
                            ) : (
                              <span className="text-gray-500">Select platforms</span>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-3">
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Select Platforms</h4>
                          <div className="grid grid-cols-2 gap-3">
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
                                    <span className="font-medium text-sm">{platform.name}</span>
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
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Caption */}
                <div className="flex flex-col">
                  <Label className="text-sm font-medium">Caption</Label>
                  <div className="mt-2">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your caption..."
                      className="w-full h-[380px] resize-none text-base font-medium leading-relaxed"
                      maxLength={2200}
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-right">
                    {content.length}/2200 characters
                  </div>
                </div>

                {/* Two Column Layout - Media & Scheduling */}
                <div className="flex gap-6 flex-1">
                  {/* Left Column - Media Thumbnails (35%) */}
                  <div className="w-[35%] flex flex-col">
                    <Label className="text-sm font-medium mb-3">Media Preview</Label>
                    <div 
                      className={cn(
                        "flex-1 flex items-center justify-center rounded-lg border-2 cursor-pointer transition-colors",
                        allMedia.length === 0 
                          ? "bg-gray-50 border-dashed border-gray-200 hover:bg-gray-100" 
                          : "bg-transparent border-transparent"
                      )}
                      onClick={() => allMedia.length === 0 && fileInputRef.current?.click()}
                    >
                      {allMedia.length > 0 ? (
                        <div className="flex flex-col items-center justify-start pt-4 space-y-4 relative w-full h-full">
                          {allMedia.map((media, index) => {
                            const isVideo = media.type.startsWith('video/');
                            const isPhoto = media.type.startsWith('image/');
                            return (
                              <div
                                key={index}
                                className="relative bg-white rounded-lg overflow-hidden shadow-md w-full aspect-square max-w-[200px]"
                              >
                                <InstagramMediaThumbnail
                                  src={media.url}
                                  type={media.type}
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  onClick={() => removeMedia(index)}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {/* Upload icon for photos only */}
                                {isPhoto && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      fileInputRef.current?.click();
                                    }}
                                    className="absolute top-2 left-2 bg-blue-500 text-white rounded-full p-1 hover:bg-blue-600 transition-colors z-10"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center text-gray-500">
                          <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-sm">Click to upload media</p>
                          <p className="text-xs mt-1">Upload images or videos</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column - Scheduling & Actions (65%) */}
                  <div className="w-[65%] flex flex-col space-y-6">
                    {/* Scheduling */}
                    <div>
                      <Label className="text-sm font-medium">Schedule Post</Label>
                      <div className="mt-2 space-y-3">
                        <div>
                          <Label className="text-xs text-gray-600">Date</Label>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Time</Label>
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="mt-1"
                          />
                        </div>
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
                          <SelectItem value="pending_approval">Pending Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3 pt-4">
                      <Button
                        onClick={handleSubmit}
                        disabled={createPostMutation.isPending || !content.trim() || selectedPlatforms.length === 0}
                        className="w-full"
                      >
                        {createPostMutation.isPending ? "Saving..." : (postId ? "Update Post" : "Create Post")}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleClose}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Hidden File Upload Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple={!allMedia.some(m => m.type.startsWith('video/'))}
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />


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

                    {selectedPreviewPlatform === 'facebook' && (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            B
                          </div>
                          <div>
                            <div className="font-semibold">Brand Name</div>
                            <div className="text-xs text-gray-500">Just now</div>
                          </div>
                        </div>
                        
                        {content && <div className="mb-3 text-sm">{content}</div>}
                        
                        {allMedia.length > 0 && (
                          <div className="rounded-lg overflow-hidden">
                            <InstagramMediaThumbnail
                              src={allMedia[0].url}
                              alt="Preview"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {selectedPreviewPlatform === 'twitter' && (
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
                            B
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">Brand Name</span>
                              <span className="text-gray-500">@brand</span>
                              <span className="text-gray-500">·</span>
                              <span className="text-gray-500 text-sm">now</span>
                            </div>
                            
                            {content && <div className="mb-3">{content}</div>}
                            
                            {allMedia.length > 0 && (
                              <div className="rounded-xl overflow-hidden border">
                                <InstagramMediaThumbnail
                                  src={allMedia[0].url}
                                  alt="Preview"
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {selectedPreviewPlatform === 'tiktok' && (
                      <div className="bg-black rounded-lg p-4 text-white shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-full"></div>
                            <span className="font-semibold">Brand Name</span>
                          </div>
                        </div>
                        
                        {allMedia.length > 0 && (
                          <div className="rounded-lg overflow-hidden mb-3">
                            <InstagramMediaThumbnail
                              src={allMedia[0].url}
                              alt="Preview"
                              className="w-full h-64 object-cover"
                            />
                          </div>
                        )}
                        
                        {content && <div className="text-sm">{content}</div>}
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
          
          {/* Notes Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Notes & Comments</h4>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          U
                        </div>
                        <div className="flex-1">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-medium text-gray-900">Current User</span>
                            <span className="text-xs text-gray-500">2 min ago</span>
                          </div>
                          <p className="text-gray-700 text-sm">Ready for review. Please check the caption and timing.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a note or comment..."
                      className="resize-none"
                      rows={3}
                    />
                    <Button size="sm" className="w-full">
                      Add Note
                    </Button>
                  </div>
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