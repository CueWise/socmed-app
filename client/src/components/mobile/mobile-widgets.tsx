import { useState } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users, 
  Heart, 
  MessageCircle,
  Share,
  Eye,
  ChevronRight,
  Sparkles,
  Target,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAnalyticsSummary } from "@/hooks/use-analytics";
import { useBrand } from "@/hooks/use-brand";
import { usePosts } from "@/hooks/use-posts";
import { format } from "date-fns";

export default function MobileWidgets() {
  const { selectedBrand } = useBrand();
  const { data: analyticsSummary } = useAnalyticsSummary(selectedBrand?.id);
  const { data: posts } = usePosts(selectedBrand?.id, "scheduled");

  const upcomingPosts = posts?.slice(0, 3) || [];

  // Quick stats widget
  const QuickStats = () => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
          Today's Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analyticsSummary?.totalReach?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Reach</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {analyticsSummary?.totalEngagement?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Engagement</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analyticsSummary?.totalViews?.toLocaleString() || '0'}
            </div>
            <div className="text-sm text-gray-500">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analyticsSummary?.totalPosts || '0'}
            </div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Upcoming posts widget
  const UpcomingPosts = () => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Posts
          </div>
          <Badge variant="secondary">{upcomingPosts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingPosts.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No scheduled posts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingPosts.map((post) => (
              <div key={post.id} className="flex items-center space-x-3 p-2 border border-gray-100 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {post.content?.substring(0, 40)}...
                  </p>
                  <p className="text-xs text-gray-500">
                    {post.scheduledAt ? format(new Date(post.scheduledAt), 'MMM d, h:mm a') : 'Not scheduled'}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // AI suggestions widget
  const AISuggestions = () => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <Target className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Best Time to Post</p>
              <p className="text-xs text-blue-700">Post between 6-8 PM for 23% higher engagement</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-100">
            <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">Trending Hashtags</p>
              <p className="text-xs text-green-700">#TechTrends #Innovation are performing well</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
            <Users className="h-5 w-5 text-purple-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-purple-900">Audience Activity</p>
              <p className="text-xs text-purple-700">Your audience is most active on weekdays</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Platform performance widget
  const PlatformPerformance = () => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
          Platform Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">IG</span>
              </div>
              <div>
                <p className="text-sm font-medium">Instagram</p>
                <p className="text-xs text-gray-500">2.3K engagement</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">+12%</p>
              <p className="text-xs text-gray-500">vs last week</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">FB</span>
              </div>
              <div>
                <p className="text-sm font-medium">Facebook</p>
                <p className="text-xs text-gray-500">1.8K engagement</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">+8%</p>
              <p className="text-xs text-gray-500">vs last week</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">TT</span>
              </div>
              <div>
                <p className="text-sm font-medium">TikTok</p>
                <p className="text-xs text-gray-500">5.1K engagement</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">+25%</p>
              <p className="text-xs text-gray-500">vs last week</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="md:hidden space-y-4 pb-20">
      <QuickStats />
      <UpcomingPosts />
      <AISuggestions />
      <PlatformPerformance />
    </div>
  );
}