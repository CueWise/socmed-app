import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentCalendar from "@/components/calendar/content-calendar";
import StatsCard from "@/components/analytics/stats-card";
import ApprovalCard from "@/components/approvals/approval-card";
import AISuggestions from "@/components/ai/ai-suggestions";
import PostEditorModal from "@/components/posts/post-editor-modal";
import MobileWidgets from "@/components/mobile/mobile-widgets";
import { useApprovals } from "@/hooks/use-approvals";
import { useAnalytics } from "@/hooks/use-analytics";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const [showPostEditor, setShowPostEditor] = useState(false);
  const isMobile = useIsMobile();
  const { data: approvals } = useApprovals();
  const { data: analytics } = useAnalytics();

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
    <div className="space-y-4">
      {/* Mobile Widgets */}
      {isMobile && <MobileWidgets />}
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your social media presence
          </p>
        </div>
        
        <div className="hidden md:flex items-center space-x-3 mt-4 sm:mt-0">
          <Button
            onClick={() => setShowPostEditor(true)}
            className="bg-primary hover:bg-primary/90 material-shadow"
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Create Post</span>
          </Button>
          
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Content Calendar */}
        <div className="lg:col-span-2">
          <ContentCalendar />
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
      />
    </div>
  );
}
