import { CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { Approval } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ApprovalCardProps {
  approval: Approval;
}

export default function ApprovalCard({ approval }: ApprovalCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateApprovalMutation = useMutation({
    mutationFn: async ({ id, status, comment }: { 
      id: number; 
      status: string; 
      comment?: string 
    }) => {
      const response = await apiRequest("PATCH", `/api/approvals/${id}`, { 
        status, 
        comment 
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/approvals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      
      const statusText = variables.status === "approved" ? "approved" : "rejected";
      toast({
        title: `Post ${statusText}`,
        description: `The post has been ${statusText} successfully.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update approval status.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = () => {
    updateApprovalMutation.mutate({
      id: approval.id,
      status: "approved",
    });
  };

  const handleReject = () => {
    const comment = prompt("Reason for rejection (optional):");
    updateApprovalMutation.mutate({
      id: approval.id,
      status: "rejected",
      comment: comment || undefined,
    });
  };

  const handleRequestChanges = () => {
    const comment = prompt("What changes are needed?");
    if (comment) {
      updateApprovalMutation.mutate({
        id: approval.id,
        status: "changes_requested",
        comment,
      });
    }
  };

  // Mock post data based on approval - in real app this would come from a join query
  const mockPost = {
    title: "New product launch announcement",
    platform: "Instagram",
    createdBy: "Sarah Miller",
    content: "Exciting news! We're launching our new product line with innovative features that will revolutionize your workflow...",
    type: "image" as const,
  };

  const platformColors: Record<string, string> = {
    Instagram: "from-purple-500 to-pink-500",
    Facebook: "bg-blue-600",
    TikTok: "bg-gray-900 dark:bg-gray-300",
    Twitter: "bg-blue-400",
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return "videocam";
      case "image":
        return "image";
      default:
        return "article";
    }
  };

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMins > 0) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else {
      return "Just now";
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Content Type Icon */}
      <div className={cn(
        "w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center",
        mockPost.platform === "Instagram" ? "bg-gradient-to-r from-purple-500 to-pink-500" :
        platformColors[mockPost.platform] || "bg-gray-500"
      )}>
        <span className="material-icons text-white text-sm">
          {getTypeIcon(mockPost.type)}
        </span>
      </div>
      
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {mockPost.title}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-500">
                {mockPost.platform} • Created by {mockPost.createdBy}
              </span>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(approval.createdAt)}
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={cn(
            "flex items-center space-x-1 px-2 py-1 rounded-full text-xs",
            approval.status === "pending" && "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200",
            approval.status === "approved" && "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
            approval.status === "rejected" && "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
          )}>
            {approval.status === "pending" && <Clock className="h-3 w-3" />}
            {approval.status === "approved" && <CheckCircle className="h-3 w-3" />}
            {approval.status === "rejected" && <XCircle className="h-3 w-3" />}
            <span className="capitalize">{approval.status}</span>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {mockPost.content}
        </p>

        {/* Comment */}
        {approval.comment && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
            <div className="flex items-center space-x-1 mb-1">
              <MessageSquare className="h-3 w-3 text-gray-500" />
              <span className="text-gray-500 font-medium">Comment:</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{approval.comment}</p>
          </div>
        )}

        {/* Actions */}
        {approval.status === "pending" && (
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={handleApprove}
              disabled={updateApprovalMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 h-auto"
            >
              <CheckCircle className="mr-1 h-3 w-3" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRequestChanges}
              disabled={updateApprovalMutation.isPending}
              className="text-xs px-3 py-1 h-auto"
            >
              Request Changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReject}
              disabled={updateApprovalMutation.isPending}
              className="text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20 text-xs px-3 py-1 h-auto"
            >
              <XCircle className="mr-1 h-3 w-3" />
              Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
