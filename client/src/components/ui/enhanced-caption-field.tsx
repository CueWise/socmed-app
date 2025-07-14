import { useState, useRef, useCallback } from "react";
import { MessageSquare, Smile, Hash, MessageCircle, MapPin, Link, Bot, Folder, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedCaptionFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  className?: string;
  onEmojiClick?: () => void;
  onHashtagClick?: () => void;
  onAIClick?: () => void;
}

export default function EnhancedCaptionField({
  value,
  onChange,
  placeholder = "Write a caption...",
  maxLength = 2200,
  className = "",
  onEmojiClick,
  onHashtagClick,
  onAIClick,
}: EnhancedCaptionFieldProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Count hashtags and characters
  const hashtagCount = (value.match(/#\w+/g) || []).length;
  const charCount = value.length;
  
  // Handle toolbar button clicks
  const handleToolbarClick = (action: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    switch (action) {
      case 'hashtag':
        const newValue = value.substring(0, start) + '#' + value.substring(end);
        onChange(newValue);
        // Set cursor after the #
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 1, start + 1);
        }, 0);
        break;
      case 'emoji':
        onEmojiClick?.();
        break;
      case 'ai':
        onAIClick?.();
        break;
      default:
        // For other actions, just focus the textarea
        textarea.focus();
        break;
    }
  };

  // Render text with highlighted hashtags
  const renderTextWithHashtags = useCallback((text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => (
      <span
        key={index}
        className={part.startsWith('#') ? 'text-blue-600 font-medium' : 'text-gray-900'}
      >
        {part}
      </span>
    ));
  }, []);

  return (
    <div className={cn("space-y-3", className)}>
      {/* Caption textarea with hashtag highlighting overlay */}
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px] text-lg leading-relaxed resize-none pr-4 z-10 relative bg-transparent font-semibold text-gray-800"
          maxLength={maxLength}
        />
        
        {/* Hashtag highlighting overlay */}
        <div className="absolute inset-0 p-3 text-lg leading-relaxed pointer-events-none whitespace-pre-wrap break-words z-0 font-semibold">
          {renderTextWithHashtags(value)}
        </div>
      </div>
      
      {/* Counters */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Hash className="w-4 h-4" />
            {hashtagCount}
          </span>
          <span className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {charCount} / {maxLength}
          </span>
        </div>
        <div className={cn(
          "text-xs",
          charCount > maxLength * 0.9 ? "text-red-500" : "text-gray-400"
        )}>
          {maxLength - charCount} characters remaining
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center gap-1 pt-2 border-t border-gray-200">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('chat')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <MessageSquare className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('emoji')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Smile className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('hashtag')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Hash className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('comment')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <MessageCircle className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('location')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <MapPin className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('url')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Link className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('ai')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Bot className="w-4 h-4 text-gray-600" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => handleToolbarClick('folder')}
          className="h-8 w-8 p-0 hover:bg-gray-100"
        >
          <Folder className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}