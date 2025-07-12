import { useState, useEffect } from "react";
import { X, Sparkles, Hash, TrendingUp, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PostEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: Date;
  postId?: number;
  initialData?: any;
}

interface PostData {
  content: string;
  platforms: string[];
  scheduledAt?: Date;
  mediaUrls?: string[];
  hashtags?: string[];
}

export default function PostEditorModal({ 
  open, 
  onOpenChange, 
  defaultDate,
  postId,
  initialData
}: PostEditorModalProps) {
  const [content, setContent] = useState(initialData?.content || "");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
    initialData?.platforms || ["instagram"]
  );
  const [scheduledDate, setScheduledDate] = useState(
    initialData?.scheduledAt 
      ? new Date(initialData.scheduledAt).toISOString().split('T')[0]
      : defaultDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]
  );
  const [scheduledTime, setScheduledTime] = useState(
    initialData?.scheduledAt 
      ? new Date(initialData.scheduledAt).toTimeString().split(' ')[0].slice(0, 5)
      : "14:00"
  );
  const [hashtags, setHashtags] = useState<string[]>(initialData?.hashtags || []);
  const [mediaUrls, setMediaUrls] = useState<string[]>(initialData?.mediaUrls || []);
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      setSelectedPlatforms(initialData.platforms || ["instagram"]);
      setHashtags(initialData.hashtags || []);
      setMediaUrls(initialData.mediaUrls || []);
      
      if (initialData.scheduledAt) {
        const scheduleDate = new Date(initialData.scheduledAt);
        setScheduledDate(scheduleDate.toISOString().split('T')[0]);
        setScheduledTime(scheduleDate.toTimeString().split(' ')[0].slice(0, 5));
      }
    } else {
      // Reset form for new post
      setContent("");
      setSelectedPlatforms(["instagram"]);
      setHashtags([]);
      setMediaUrls([]);
      setScheduledDate(defaultDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
      setScheduledTime("14:00");
    }
  }, [initialData, defaultDate]);

  const platforms = [
    { id: "instagram", name: "Instagram", color: "from-purple-500 to-pink-500" },
    { id: "facebook", name: "Facebook", color: "bg-blue-600" },
    { id: "tiktok", name: "TikTok", color: "bg-gray-900 dark:bg-gray-300" },
    { id: "twitter", name: "Twitter", color: "bg-blue-400" },
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      if (postId) {
        // Update existing post
        const response = await apiRequest("PATCH", `/api/posts/${postId}`, {
          ...postData,
          scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`),
        });
        return response.json();
      } else {
        // Create new post
        const response = await apiRequest("POST", "/api/posts", {
          ...postData,
          createdBy: 1, // Mock user ID
          brandId: 1, // Mock brand ID
          scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`),
        });
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Success",
        description: postId ? "Post updated successfully" : "Post created successfully",
        variant: "success",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: postId ? "Failed to update post" : "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const generateCaptionMutation = useMutation({
    mutationFn: async (data: { topic: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-caption", data);
      return response.json();
    },
    onSuccess: (data) => {
      setContent(data.caption);
      toast({
        title: "Caption Generated",
        description: "AI has generated a new caption for your post",
      });
    },
  });

  const suggestHashtagsMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/suggest-hashtags", data);
      return response.json();
    },
    onSuccess: (data) => {
      setHashtags(data.hashtags || []);
      toast({
        title: "Hashtags Suggested",
        description: "AI has suggested relevant hashtags",
      });
    },
  });

  const optimizeContentMutation = useMutation({
    mutationFn: async (data: { content: string; platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/optimize-engagement", data);
      return response.json();
    },
    onSuccess: (data) => {
      setContent(data.optimizedContent);
      toast({
        title: "Content Optimized",
        description: `Content optimized for better engagement (Score: ${data.score}/100)`,
      });
    },
  });

  const suggestTimeMutation = useMutation({
    mutationFn: async (data: { platform: string }) => {
      const response = await apiRequest("POST", "/api/ai/suggest-time", data);
      return response.json();
    },
    onSuccess: (data) => {
      setScheduledTime(data.recommendedTime);
      toast({
        title: "Optimal Time Suggested",
        description: data.reasoning,
      });
    },
  });

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerateCaption = () => {
    if (!content.trim()) {
      toast({
        title: "Enter a topic",
        description: "Please enter a topic or some content first",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingCaption(true);
    generateCaptionMutation.mutate({
      topic: content,
      platform: selectedPlatforms[0] || "instagram",
    });
    setIsGeneratingCaption(false);
  };

  const handleSuggestHashtags = () => {
    if (!content.trim()) {
      toast({
        title: "Enter content first",
        description: "Please enter some content before generating hashtags",
        variant: "destructive",
      });
      return;
    }
    
    setIsGeneratingHashtags(true);
    suggestHashtagsMutation.mutate({
      content,
      platform: selectedPlatforms[0] || "instagram",
    });
    setIsGeneratingHashtags(false);
  };

  const handleOptimizeContent = () => {
    if (!content.trim()) {
      toast({
        title: "Enter content first",
        description: "Please enter some content before optimizing",
        variant: "destructive",
      });
      return;
    }
    
    setIsOptimizing(true);
    optimizeContentMutation.mutate({
      content,
      platform: selectedPlatforms[0] || "instagram",
    });
    setIsOptimizing(false);
  };

  const handleSuggestTime = () => {
    suggestTimeMutation.mutate({
      platform: selectedPlatforms[0] || "instagram",
    });
  };

  const resetForm = () => {
    setContent("");
    setSelectedPlatforms(["instagram"]);
    setScheduledDate(new Date().toISOString().split('T')[0]);
    setScheduledTime("14:00");
    setHashtags([]);
    setMediaUrls([]);
  };

  const handleSubmit = (action: 'draft' | 'review' | 'schedule') => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter some content for your post",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Platform required",
        description: "Please select at least one platform",
        variant: "destructive",
      });
      return;
    }

    const postData: PostData = {
      content: content + (hashtags.length > 0 ? '\n\n' + hashtags.map(tag => `#${tag}`).join(' ') : ''),
      platforms: selectedPlatforms,
      scheduledAt: new Date(`${scheduledDate}T${scheduledTime}`),
      hashtags,
      mediaUrls,
    };

    createPostMutation.mutate(postData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData 
              ? `${initialData.content?.split('.')[0] || initialData.content?.split('!')[0] || initialData.content?.slice(0, 50)}...`
              : "Create New Post"
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Select Platforms</Label>
            <div className="flex flex-wrap gap-3">
              {platforms.map((platform) => (
                <div key={platform.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={platform.id}
                    checked={selectedPlatforms.includes(platform.id)}
                    onCheckedChange={() => handlePlatformToggle(platform.id)}
                  />
                  <Label 
                    htmlFor={platform.id}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <div className={`w-6 h-6 rounded ${platform.color.includes('gradient') ? 'bg-gradient-to-r ' + platform.color : platform.color}`} />
                    <span className="text-sm">{platform.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Content Editor */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Caption</Label>
            <Textarea
              placeholder="Write your caption here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-32 resize-none"
            />
            
            {/* AI Actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateCaption}
                disabled={isGeneratingCaption}
                className="text-primary border-primary hover:bg-primary/10"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {isGeneratingCaption ? "Generating..." : "Generate Caption"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSuggestHashtags}
                disabled={isGeneratingHashtags}
                className="text-purple-600 border-purple-600 hover:bg-purple-50"
              >
                <Hash className="mr-2 h-4 w-4" />
                {isGeneratingHashtags ? "Generating..." : "Suggest Hashtags"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOptimizeContent}
                disabled={isOptimizing}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                {isOptimizing ? "Optimizing..." : "Optimize"}
              </Button>
            </div>

            {/* Hashtags Display */}
            {hashtags.length > 0 && (
              <div className="mt-3">
                <Label className="text-sm font-medium mb-2 block">Suggested Hashtags</Label>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag, index) => (
                    <span 
                      key={index} 
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Media</Label>
            
            {/* Show existing media if editing */}
            {mediaUrls.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Current media:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {mediaUrls.map((url, index) => (
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
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop media here, or click to browse
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports images, videos up to 100MB
              </p>
              <div className="flex justify-center gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Publish Date</Label>
              <Input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Publish Time</Label>
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSuggestTime}
                  className="text-primary"
                >
                  AI Best Time
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            variant="ghost"
            onClick={() => handleSubmit('draft')}
            disabled={createPostMutation.isPending}
          >
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSubmit('review')}
            disabled={createPostMutation.isPending}
            className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
          >
            Submit for Review
          </Button>
          <Button
            onClick={() => handleSubmit('schedule')}
            disabled={createPostMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createPostMutation.isPending ? "Creating..." : "Schedule Post"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
