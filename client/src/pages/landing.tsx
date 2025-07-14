import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Users, Calendar, BarChart3, Zap } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">CueWise</h1>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Sign In
            </Button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6">
              Streamline Your Social Media Management
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Create, schedule, and manage social media content across multiple platforms with AI-powered tools and collaborative workflows.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/api/login'}
              className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4"
            >
              Get Started Free
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to manage social media
            </h3>
            <p className="text-lg text-gray-600">
              Powerful features designed for teams and creators
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                </div>
                <CardTitle>AI-Powered Content</CardTitle>
                <CardDescription>
                  Generate captions, hashtags, and optimize content with advanced AI tools
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Smart Scheduling</CardTitle>
                <CardDescription>
                  Schedule posts across multiple platforms with optimal timing suggestions
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Approval workflows, comments, and role-based access for your team
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track performance and engagement across all your social platforms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Multi-Brand Support</CardTitle>
                <CardDescription>
                  Manage multiple brands and clients from a single dashboard
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>Media Management</CardTitle>
                <CardDescription>
                  Upload, organize, and optimize images, videos, and other media assets
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 text-center">
          <Card className="max-w-2xl mx-auto bg-indigo-600 text-white">
            <CardContent className="py-12">
              <h3 className="text-3xl font-bold mb-4">Ready to get started?</h3>
              <p className="text-indigo-100 mb-8">
                Join thousands of creators and teams who trust CueWise for their social media management.
              </p>
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => window.location.href = '/api/login'}
                className="text-lg px-8 py-4"
              >
                Sign In to Continue
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}