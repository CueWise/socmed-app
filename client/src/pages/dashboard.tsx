import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EnhancedCalendar from "@/components/calendar/enhanced-calendar";
import StatsCard from "@/components/analytics/stats-card";
import ApprovalCard from "@/components/approvals/approval-card";
import AISuggestions from "@/components/ai/ai-suggestions";
import PostEditorModal from "@/components/posts/post-editor-modal";
import MobileWidgets from "@/components/mobile/mobile-widgets";
import { useApprovals } from "@/hooks/use-approvals";
import { useAnalytics } from "@/hooks/use-analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBrand } from "@/hooks/use-brand";

export default function Dashboard() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<any>(null);
  const isMobile = useIsMobile();
  const { selectedBrand } = useBrand();
  const { data: approvals } = useApprovals();
  const { data: analytics } = useAnalytics();

  const handleCreatePost = (date?: Date) => {
    setEditingPost(null);
    setSelectedDate(date || null);
    setShowPostEditor(true);
  };

  const handleEditPost = (post: any, date?: Date) => {
    setEditingPost(post);
    setSelectedDate(date || null);
    setShowPostEditor(true);
  };

  const handleDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  const pendingApprovals = approvals?.filter(approval => approval.status === 'pending') || [];
  const quickActions = [
    {
      title: "Bulk Schedule",
      icon: "schedule",
      action: () => console.log("Bulk schedule"),
    },
    {
      title: "AI Generate",
      icon: "auto_awesome",
      action: () => console.log("AI generate"),
    },
    {
      title: "Analytics",
      icon: "analytics",
      action: () => console.log("Analytics"),
    },
    {
      title: "Upload Media",
      icon: "cloud_upload",
      action: () => console.log("Upload media"),
    },
  ];

  return (
    <div className="space-y-1">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your social media presence
          </p>
        </div>
        
        <div className="hidden md:flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" size="icon" className="touch-target">
            <Sparkles className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reach"
          value="2.4M"
          change="+12%"
          changeType="positive"
          icon="visibility"
          color="primary"
        />
        <StatsCard
          title="Engagement"
          value="89K"
          change="+8%"
          changeType="positive"
          icon="favorite"
          color="secondary"
        />
        <StatsCard
          title="Published"
          value="156"
          change="+15"
          changeType="positive"
          icon="publish"
          color="success"
        />
        <StatsCard
          title="Pending"
          value="12"
          subtitle="Review needed"
          icon="schedule"
          color="warning"
        />
      </div>

      {/* Platform Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <span className="material-icons mr-2 text-primary">trending_up</span>
            Platform Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  IG
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Instagram</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">2.3K engagement</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-semibold">+12%</div>
                <div className="text-xs text-gray-500">vs last week</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  FB
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Facebook</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">1.8K engagement</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-semibold">+8%</div>
                <div className="text-xs text-gray-500">vs last week</div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-900 dark:bg-gray-300 rounded-lg flex items-center justify-center text-white dark:text-gray-900 font-bold text-sm">
                  TT
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">TikTok</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">5.1K engagement</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-green-600 font-semibold">+25%</div>
                <div className="text-xs text-gray-500">vs last week</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Content Calendar */}
        <div className="lg:col-span-2">
          <EnhancedCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onCreatePost={handleCreatePost}
            onEditPost={handleEditPost}
            showCreateButton={true}
          />
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Pending Approvals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Pending Approvals
                <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs px-2 py-1 rounded-full">
                  {pendingApprovals.length}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingApprovals.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  No pending approvals
                </p>
              ) : (
                pendingApprovals.slice(0, 3).map((approval) => (
                  <ApprovalCard key={approval.id} approval={approval} />
                ))
              )}
              {pendingApprovals.length > 3 && (
                <Button variant="ghost" className="w-full text-primary">
                  View All Approvals
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions */}
          <AISuggestions />

          {/* Quick Actions - Temporarily removed for debugging */}
          {/* Quick Actions card removed to identify floating button source */}
        </div>
      </div>

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
