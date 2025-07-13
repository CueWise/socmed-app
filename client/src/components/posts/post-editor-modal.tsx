import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Sparkles, Hash, TrendingUp, Camera, Upload, StickyNote, AlertTriangle, Plus, Paperclip, Send, Reply, FileText, Image as ImageIcon, Video, FileSpreadsheet, Bold, Italic, List, ListOrdered, MoreHorizontal, Edit, Trash2, Link, Smile, Menu } from "lucide-react";
import { FaInstagram, FaFacebook, FaTiktok, FaTwitter } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import RichTextEditor from "@/components/ui/rich-text-editor";

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
  status: string;
  notes?: string;
}

// Simple emoji picker component
const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void, onClose: () => void }) => {
  const emojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇',
    '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
    '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩',
    '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣',
    '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬',
    '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗',
    '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯',
    '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐',
    '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈',
    '👿', '👹', '👺', '🤡', '💩', '👻', '💀', '☠️', '👽', '👾'
  ];

  return (
    <div className="fixed inset-0 z-[100000] bg-black bg-opacity-50" onClick={onClose}>
      <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl max-h-60 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-3 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Choose Emoji</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-3 max-h-48 overflow-y-auto">
          <div className="grid grid-cols-8 gap-2">
            {emojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => {
                  onSelect(emoji);
                  onClose();
                }}
                className="p-2 text-xl hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [noteThreads, setNoteThreads] = useState<any[]>([]);
  const [newNoteText, setNewNoteText] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newNoteAttachments, setNewNoteAttachments] = useState<any[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState(0);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [hasSelectedText, setHasSelectedText] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || "");
      setSelectedPlatforms(initialData.platforms || ["instagram"]);
      setHashtags(initialData.hashtags || []);
      setMediaUrls(initialData.mediaUrls || []);
      setStatus(initialData.status || "draft");
      setNotes(initialData.notes || "");
      
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
      setStatus("draft");
      setNotes("");
      
      if (defaultDate) {
        setScheduledDate(defaultDate.toISOString().split('T')[0]);
      }
    }
  }, [initialData, defaultDate, open]);

  // Track unsaved changes
  useEffect(() => {
    if (initialData) {
      const hasChanges = 
        content !== (initialData.content || "") ||
        JSON.stringify(selectedPlatforms.sort()) !== JSON.stringify((initialData.platforms || ["instagram"]).sort()) ||
        JSON.stringify(hashtags) !== JSON.stringify(initialData.hashtags || []) ||
        status !== (initialData.status || "draft") ||
        notes !== (initialData.notes || "");
      setHasUnsavedChanges(hasChanges);
    } else {
      // For new posts, check if any content exists
      const hasContent = content.trim() || selectedPlatforms.length > 1 || hashtags.length > 0 || notes.trim();
      setHasUnsavedChanges(!!hasContent);
    }
  }, [content, selectedPlatforms, hashtags, status, notes, initialData]);

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: FaInstagram, color: 'text-pink-600' },
    { id: 'facebook', name: 'Facebook', icon: FaFacebook, color: 'text-blue-600' },
    { id: 'tiktok', name: 'TikTok', icon: FaTiktok, color: 'text-black' },
    { id: 'twitter', name: 'Twitter', icon: FaTwitter, color: 'text-blue-400' },
  ];

  const emojiCategories = [
    ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇"],
    ["👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉"],
    ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔"],
    ["🍕", "🍔", "🍟", "🌭", "🥪", "🌮", "🍝", "🍜", "🍲", "🍱"],
    ["⚽", "🏀", "🏈", "⚾", "🎾", "🏐", "🏉", "🎱", "🏓", "🏸"],
    ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐"],
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: PostData) => {
      const url = postId ? `/api/posts/${postId}` : '/api/posts';
      const method = postId ? 'PATCH' : 'POST';
      
      const scheduleDateTime = scheduledDate && scheduledTime 
        ? new Date(`${scheduledDate}T${scheduledTime}:00`)
        : undefined;
      
      const payload = {
        ...postData,
        scheduledAt: scheduleDateTime?.toISOString(),
      };
      
      return apiRequest(url, {
        method,
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: postId ? "Post updated" : "Post created",
        description: postId ? "Your post has been updated successfully." : "Your post has been created successfully.",
      });
      setHasUnsavedChanges(false);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save post",
        variant: "destructive",
      });
    },
  });

  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true);
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = () => {
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
      content: content.trim(),
      platforms: selectedPlatforms,
      hashtags,
      mediaUrls,
      notes: notes.trim(),
      status: status,
    };

    createPostMutation.mutate(postData);
  };

  const handleAddNote = () => {
    if (!newNoteText.trim()) return;
    
    const newNote = {
      id: Date.now(),
      author: "Current User",
      content: newNoteText,
      timestamp: new Date().toISOString(),
      attachments: newNoteAttachments,
      edited: false,
      replies: []
    };
    
    setNoteThreads([...noteThreads, newNote]);
    setNewNoteText("");
    setNewNoteAttachments([]);
    setEditorKey(prev => prev + 1);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      {/* Main Container */}
      <div className="h-full flex">
        
        {/* Left Content Area */}
        <div className={cn(
          "flex-1 bg-white transition-all duration-300 ease-in-out",
          showMainMenu ? "md:mr-80 mr-0" : "mr-0"
        )}>
          
          {/* Header */}
          <div className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6">
            <h1 className="text-lg md:text-xl font-semibold">
              {postId ? "Edit Post" : "Create Post"}
            </h1>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMainMenu(!showMainMenu)}
                className="flex items-center space-x-1 md:space-x-2"
              >
                <Menu className="h-4 w-4" />
                <span className="hidden sm:inline">Menu</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="h-[calc(100vh-4rem)] overflow-y-auto">
            {showNotes ? (
              /* Notes View */
              <div className="h-full flex flex-col">
                {/* Notes Header */}
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Notes & Comments</h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowNotes(false)}
                    >
                      Back to Post
                    </Button>
                  </div>
                </div>
                
                {/* Notes Content */}
                <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
                  <div className="space-y-4">
                    {noteThreads.map((thread) => (
                      <div key={thread.id} className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {thread.author.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="font-medium text-gray-900">{thread.author}</span>
                              <span className="text-xs text-gray-500">
                                {new Date(thread.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-gray-700">{thread.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Notes Input */}
                <div className="p-6 border-t bg-white"
                     style={{ 
                       paddingBottom: 'max(24px, env(keyboard-inset-height, 0px))'
                     }}>
                  <div className="space-y-3">
                    <RichTextEditor
                      key={editorKey}
                      placeholder="Add a note or comment..."
                      onChange={(text, isRich) => setNewNoteText(text)}
                      autoFocus
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*,video/*';
                            input.onchange = (e) => {
                              const file = (e.target as HTMLInputElement).files?.[0];
                              if (file) {
                                console.log('File selected for Notes:', file);
                              }
                            };
                            input.click();
                          }}
                          className="p-2 h-8 w-8"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowEmojiPicker(true)}
                          className="p-2 h-8 w-8"
                        >
                          <Smile className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={handleAddNote}
                        disabled={!newNoteText.trim()}
                        className="h-12 w-12 p-0"
                      >
                        <Send className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Post Edit View */
              <div className="p-4 space-y-4 max-w-md mx-auto">
                
                {/* Platform Selection */}
                <div>
                  <Label className="text-sm font-medium mb-3 block">Platforms</Label>
                  <div className="flex items-center gap-2">
                    {platforms.map((platform) => {
                      const Icon = platform.icon;
                      const isSelected = selectedPlatforms.includes(platform.id);
                      
                      return (
                        <button
                          key={platform.id}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                            } else {
                              setSelectedPlatforms([...selectedPlatforms, platform.id]);
                            }
                          }}
                          className={cn(
                            "flex items-center justify-center p-3 rounded-lg border-2 transition-all",
                            isSelected 
                              ? "border-blue-500 bg-blue-50" 
                              : "border-gray-200 hover:border-gray-300"
                          )}
                        >
                          <Icon className={cn("h-6 w-6", isSelected ? platform.color : "text-gray-400")} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content */}
                <div>
                  <Label htmlFor="content" className="text-sm font-medium">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="What's happening?"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mt-2 min-h-[120px] resize-none"
                    maxLength={2200}
                  />
                  
                  {/* Content Actions */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*,video/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              console.log('File selected for Post:', file);
                            }
                          };
                          input.click();
                        }}
                        className="p-2 h-8 w-8"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowEmojiPicker(true)}
                        className="p-2 h-8 w-8"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      {content.length}/2200 characters
                    </p>
                  </div>
                </div>

                {/* Hashtags */}
                <div>
                  <Label className="text-sm font-medium">Hashtags</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                      >
                        #{tag}
                        <button
                          onClick={() => setHashtags(hashtags.filter((_, i) => i !== index))}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <Input
                      placeholder="Add hashtag..."
                      className="w-32 h-8 text-sm"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim().replace('#', '');
                          if (value && !hashtags.includes(value)) {
                            setHashtags([...hashtags, value]);
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Scheduling */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="scheduled-date" className="text-sm font-medium">Schedule Date</Label>
                    <Input
                      id="scheduled-date"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduled-time" className="text-sm font-medium">Schedule Time</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="mt-2"
                    />
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
            )}
          </div>
        </div>

        {/* Right Side Menu */}
        <div className={cn(
          "fixed top-0 right-0 h-full w-full md:w-80 bg-white border-l shadow-lg transform transition-transform duration-300 ease-in-out z-10",
          showMainMenu ? "translate-x-0" : "translate-x-full"
        )}>
          {/* Menu Header */}
          <div className="h-16 border-b flex items-center justify-between px-6">
            <h3 className="font-semibold">Menu</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMainMenu(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Menu Content */}
          <div className="p-6 space-y-4">
            <Button
              variant={showNotes ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => {
                setShowNotes(!showNotes);
                setShowMainMenu(false);
              }}
            >
              <StickyNote className="h-4 w-4 mr-2" />
              Notes & Comments
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsGeneratingCaption(true);
                // AI caption generation logic here
                setTimeout(() => setIsGeneratingCaption(false), 2000);
              }}
              disabled={isGeneratingCaption}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingCaption ? "Generating..." : "AI Caption"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsGeneratingHashtags(true);
                // AI hashtag generation logic here
                setTimeout(() => setIsGeneratingHashtags(false), 2000);
              }}
              disabled={isGeneratingHashtags}
            >
              <Hash className="h-4 w-4 mr-2" />
              {isGeneratingHashtags ? "Generating..." : "AI Hashtags"}
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setIsOptimizing(true);
                // Content optimization logic here
                setTimeout(() => setIsOptimizing(false), 2000);
              }}
              disabled={isOptimizing}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              {isOptimizing ? "Optimizing..." : "Optimize Content"}
            </Button>
          </div>
        </div>
      </div>

      {/* Emoji Picker Overlay */}
      {showEmojiPicker && (
        <div className="fixed inset-0 z-[200] bg-black bg-opacity-50" onClick={() => setShowEmojiPicker(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl transform transition-transform duration-300 ease-out translate-y-0 h-[50vh] max-h-[600px]" 
               onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Emojis</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEmojiPicker(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Category Tabs */}
            <div className="flex border-b bg-gray-50">
              {emojiCategories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setEmojiCategory(index)}
                  className={cn(
                    "flex-1 p-3 text-center transition-colors",
                    emojiCategory === index 
                      ? "bg-white border-b-2 border-blue-500" 
                      : "hover:bg-gray-100"
                  )}
                >
                  {category[0]}
                </button>
              ))}
            </div>
            
            {/* Emoji Grid */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-8 gap-2">
                {emojiCategories[emojiCategory].map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setContent(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    className="p-3 text-2xl hover:bg-gray-100 rounded transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowUnsavedDialog(false);
                setHasUnsavedChanges(false);
                onOpenChange(false);
              }}
            >
              Close Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>,
    document.body
  );
}