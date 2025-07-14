import { useState } from "react";
import { MoreVertical, Clock, Eye, Heart, MessageCircle, Share, Edit, Trash } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Post } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MediaThumbnail from "@/components/ui/media-thumbnail";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete post.",
        variant: "destructive",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Post> }) => {
      const response = await apiRequest("PATCH", `/api/posts/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post updated",
        description: "The post has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update post.",
        variant: "destructive",
      });
    },
  });

  const platformColors: Record<string, string> = {
    instagram: "bg-pink-500",
    facebook: "bg-blue-600",
    tiktok: "bg-gray-900 dark:bg-gray-300",
    twitter: "bg-blue-400",
  };

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    pending_approval: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    scheduled: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePostMutation.mutate(post.id);
    }
  };

  const handleStatusUpdate = (newStatus: string) => {
    updatePostMutation.mutate({
      id: post.id,
      updates: { status: newStatus as any }
    });
  };

  const formatDate = (date: string | null) => {
    if (!date) return "No date set";
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {post.platforms?.map((platform) => (
              <div key={platform} className="flex items-center space-x-1">
                <div className={cn("w-3 h-3 rounded-full", platformColors[platform])} />
                <span className="text-xs capitalize text-gray-600 dark:text-gray-400">
                  {platform}
                </span>
              </div>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              {post.status === 'draft' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('pending_approval')}>
                  Submit for Review
                </DropdownMenuItem>
              )}
              {post.status === 'pending_approval' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('approved')}>
                  Approve
                </DropdownMenuItem>
              )}
              {post.status === 'approved' && (
                <DropdownMenuItem onClick={() => handleStatusUpdate('scheduled')}>
                  Schedule
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content Preview */}
        <div className="mb-3">
          <p className="text-sm text-gray-900 dark:text-gray-100 line-clamp-3">
            {post.content}
          </p>
        </div>

        {/* Media Preview */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="mb-3">
            <div className="grid grid-cols-3 gap-2">
              {post.mediaUrls.slice(0, 3).map((url: string, idx: number) => (
                <MediaThumbnail
                  key={idx}
                  src={url}
                  alt=""
                  className="w-full h-16 rounded border border-gray-200"
                  fallbackText="MEDIA"
                />
              ))}
              {post.mediaUrls.length > 3 && (
                <div className="w-full h-16 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">+{post.mediaUrls.length - 3}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {post.hashtags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index}
                  className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
              {post.hashtags.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{post.hashtags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{formatDate(post.scheduledAt)}</span>
            </div>
            {post.aiGenerated && (
              <div className="flex items-center space-x-1">
                <span className="material-icons text-xs">auto_awesome</span>
                <span>AI</span>
              </div>
            )}
          </div>
          
          <Badge 
            variant="secondary"
            className={cn("text-xs", statusColors[post.status])}
          >
            {post.status.replace('_', ' ')}
          </Badge>
        </div>

        {/* Engagement Stats (if published) */}
        {post.status === 'published' && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>1.2K</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-3 w-3" />
                <span>89</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-3 w-3" />
                <span>12</span>
              </div>
              <div className="flex items-center space-x-1">
                <Share className="h-3 w-3" />
                <span>5</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
