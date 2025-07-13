import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PostCard from "@/components/posts/post-card";
import PostEditorModal from "@/components/posts/post-editor-modal";
import { usePosts } from "@/hooks/use-posts";
import { useBrand } from "@/hooks/use-brand";

export default function Drafts() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  
  const { selectedBrand } = useBrand();
  const { data: allPosts } = usePosts(selectedBrand?.id);

  // Filter posts to show drafts and pending approval
  const draftPosts = allPosts?.filter(post => 
    post.status === 'draft' || 
    post.status === 'pending_approval' ||
    post.status === 'rejected'
  ) || [];

  // Apply filters
  const filteredPosts = draftPosts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || post.status === statusFilter;
    const matchesPlatform = platformFilter === "all" || 
      post.platforms?.some(platform => platform === platformFilter);
    
    return matchesSearch && matchesStatus && matchesPlatform;
  });

  const statusCounts = {
    draft: draftPosts.filter(p => p.status === 'draft').length,
    pending_approval: draftPosts.filter(p => p.status === 'pending_approval').length,
    rejected: draftPosts.filter(p => p.status === 'rejected').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Drafts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your draft posts and pending approvals
          </p>
        </div>
        
        <Button
          onClick={() => setShowPostEditor(true)}
          className="bg-primary hover:bg-primary/90 mt-4 sm:mt-0"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Draft
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl material-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Draft Posts</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.draft}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="material-icons text-gray-600 dark:text-gray-400">edit_note</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl material-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.pending_approval}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <span className="material-icons text-orange-600 dark:text-orange-400">schedule</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl material-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Needs Changes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {statusCounts.rejected}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <span className="material-icons text-red-600 dark:text-red-400">error</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drafts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="rejected">Needs Changes</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={platformFilter} onValueChange={setPlatformFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by platform" />
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

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <span className="material-icons text-gray-400 text-4xl">edit_note</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No drafts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || statusFilter !== "all" || platformFilter !== "all" 
              ? "Try adjusting your filters" 
              : "Start creating your first draft post"
            }
          </p>
          <Button onClick={() => setShowPostEditor(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Draft
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      <PostEditorModal 
        open={showPostEditor} 
        onOpenChange={setShowPostEditor} 
      />
    </div>
  );
}
