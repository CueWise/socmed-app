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
                  <div className="mt-2 relative overflow-hidden rounded-md border border-input">
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Write your caption..."
                      className="w-full h-[450px] resize-none text-base font-medium leading-relaxed pb-16 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      maxLength={2200}
                    />
                    {/* Bottom toolbar with icons and counters */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-input px-3 py-3 flex items-center justify-between z-10">
                      {/* Left side icons */}
                      <div className="flex items-center space-x-3">
                        {/* Media Icon - Combined Image/Video */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-gray-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Add media">
                          <div className="relative w-5 h-5">
                            {/* Image icon */}
                            <svg className="absolute inset-0 w-4 h-4 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21,15 16,10 5,21"/>
                            </svg>
                            {/* Video icon overlay */}
                            <svg className="absolute top-0.5 right-0 w-3 h-3 text-white/80 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                              <polygon points="5,3 19,12 5,21 5,3"/>
                            </svg>
                          </div>
                        </button>
                        
                        {/* Emoji Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-yellow-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Add emoji">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="m9,9h.01"/>
                            <path d="m15,9h.01"/>
                            <path d="m8,15s1.5,2,4,2,4-2,4-2"/>
                          </svg>
                        </button>
                        
                        {/* Hashtag Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Add hashtag">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="4" y1="9" x2="20" y2="9"/>
                            <line x1="4" y1="15" x2="20" y2="15"/>
                            <line x1="10" y1="3" x2="8" y2="21"/>
                            <line x1="16" y1="3" x2="14" y2="21"/>
                          </svg>
                        </button>
                        
                        {/* Mention Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-green-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Add mention">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                          </svg>
                        </button>
                        
                        {/* Location Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Add location">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                            <circle cx="12" cy="10" r="3"/>
                          </svg>
                        </button>
                        
                        {/* Link Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Add link">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                          </svg>
                        </button>
                        
                        {/* Reddit Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Reddit">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                          </svg>
                        </button>
                        
                        {/* Video Icon */}
                        <button className="p-2 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-400/50 group" 
                                style={{background: 'linear-gradient(145deg, #1f2937 0%, #374151 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'}}
                                title="Video">
                          <svg className="w-5 h-5 text-white/90 group-hover:text-white transition-colors" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <polygon points="23 7 16 12 23 17 23 7"/>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                          </svg>
                        </button>
                      </div>
                      
                      {/* Right side counters */}
                      <div className="flex items-center space-x-4 text-sm font-medium">
                        <div className="flex items-center space-x-1">
                          <span className="text-purple-600 font-semibold">{(content.match(/#\w+/g) || []).length}</span>
                          <span className="text-gray-500">/30</span>
                          <span className="text-purple-600 font-bold">#</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className={`font-semibold ${content.length > 2000 ? 'text-red-500' : content.length > 1800 ? 'text-orange-500' : 'text-gray-700'}`}>
                            {content.length}
                          </span>
                          <span className="text-gray-500">/2200</span>
                          <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.017 0L15.22 9.344h9.91l-8.017 5.821 3.059 9.435L12.017 18.8 3.862 24.6l3.059-9.435L-2.096 9.344h9.91L12.017 0z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
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
                      <div className="mt-2 flex gap-3">
                        <div className="flex-1">
                          <Label className="text-xs text-gray-600">Date</Label>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex-1">
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