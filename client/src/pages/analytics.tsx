import { useState } from "react";
import { Calendar, Download, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StatsCard from "@/components/analytics/stats-card";
import { useAnalytics } from "@/hooks/use-analytics";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("7d");
  const [platform, setPlatform] = useState("all");
  
  const { data: analytics } = useAnalytics();

  const exportData = (format: 'csv' | 'pdf') => {
    console.log(`Exporting analytics as ${format}`);
    // Implementation would export actual data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your social media performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <Button variant="outline" onClick={() => exportData('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => exportData('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
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

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Total Reach"
          value="2.4M"
          change="+12.5%"
          changeType="positive"
          icon="visibility"
          color="primary"
        />
        <StatsCard
          title="Engagement Rate"
          value="4.2%"
          change="+0.8%"
          changeType="positive"
          icon="favorite"
          color="secondary"
        />
        <StatsCard
          title="Total Posts"
          value="156"
          change="+23"
          changeType="positive"
          icon="article"
          color="success"
        />
        <StatsCard
          title="Avg. Engagement"
          value="1.8K"
          change="+15.2%"
          changeType="positive"
          icon="trending_up"
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Reach Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Reach Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart: Reach over time would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        {/* Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span className="material-icons">favorite</span>
              <span>Engagement Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart: Engagement breakdown would be displayed here</p>
            </div>
          </CardContent>
        </Card>

        {/* Platform Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { platform: "Instagram", reach: "1.2M", engagement: "5.2%", color: "bg-pink-500" },
                { platform: "Facebook", reach: "850K", engagement: "3.8%", color: "bg-blue-600" },
                { platform: "TikTok", reach: "320K", engagement: "8.1%", color: "bg-gray-900" },
                { platform: "Twitter", reach: "180K", engagement: "2.4%", color: "bg-blue-400" },
              ].map((item) => (
                <div key={item.platform} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium">{item.platform}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-gray-500">Reach: </span>
                      <span className="font-medium">{item.reach}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement: </span>
                      <span className="font-medium">{item.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  content: "New product launch announcement with exciting features...", 
                  platform: "Instagram", 
                  engagement: "2.4K",
                  reach: "15.2K"
                },
                { 
                  content: "Behind the scenes of our latest campaign photoshoot...", 
                  platform: "TikTok", 
                  engagement: "1.8K",
                  reach: "22.1K"
                },
                { 
                  content: "Customer success story featuring amazing results...", 
                  platform: "Facebook", 
                  engagement: "1.2K",
                  reach: "8.7K"
                },
              ].map((post, index) => (
                <div key={index} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-gray-900 dark:text-gray-100 mb-2">
                    {post.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{post.platform}</span>
                    <div className="flex space-x-4">
                      <span>Reach: {post.reach}</span>
                      <span>Engagement: {post.engagement}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-blue-600 mt-0.5">trending_up</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Best Posting Time</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Your audience is most active at 2:00 PM - 4:00 PM
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-green-600 mt-0.5">psychology</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Content Performance</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Video content gets 3x more engagement than images
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="flex items-start space-x-3">
                <span className="material-icons text-purple-600 mt-0.5">tag</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Hashtag Impact</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Posts with 5-10 hashtags perform 25% better
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
