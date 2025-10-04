import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  Brain, 
  Upload, 
  BarChart3, 
  Shield, 
  Smartphone,
  ArrowRight,
  Heart,
  Target,
  FileText,
  Users,
  Calendar,
  Code
} from 'lucide-react';

interface WelcomePageProps {
  user: { name: string; email: string };
  onGetStarted: () => void;
}

export function WelcomePage({ user, onGetStarted }: WelcomePageProps) {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-accent-blue" />,
      title: "Smart File Upload",
      description: "Upload bank statements and let AI automatically extract and categorize transactions"
    },
    {
      icon: <Brain className="h-8 w-8 text-accent-gold" />,
      title: "Behavioral Insights",
      description: "Track mood-based spending patterns and get personalized recommendations"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-accent-green" />,
      title: "Advanced Analytics",
      description: "Beautiful charts and graphs to visualize your spending habits and trends"
    },
    {
      icon: <Target className="h-8 w-8 text-accent-blue" />,
      title: "Impulse Tracking",
      description: "Monitor and control impulsive purchases with our unique scoring system"
    },
    {
      icon: <Heart className="h-8 w-8 text-destructive" />,
      title: "Mood Analysis",
      description: "Understand how emotions influence your spending decisions"
    },
    {
      icon: <Shield className="h-8 w-8 text-accent-green" />,
      title: "Privacy First",
      description: "All data stays on your device - complete privacy and security"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/20 via-background to-accent-green/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-3xl">₹</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Welcome to <span className="bg-gradient-to-r from-accent-blue to-accent-green bg-clip-text text-transparent">SpendWise</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Hello <span className="font-semibold text-accent-green">{user.name}</span>! 
              Take control of your finances with AI-powered insights and behavioral analysis.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <Badge variant="outline" className="border-accent-blue/50 text-accent-blue">
                AI-Powered
              </Badge>
              <Badge variant="outline" className="border-accent-green/50 text-accent-green">
                Privacy Focused
              </Badge>
              <Badge variant="outline" className="border-accent-gold/50 text-accent-gold">
                Behavioral Insights
              </Badge>
            </div>

            <Button 
              onClick={onGetStarted}
              className="gradient-blue text-white px-8 py-3 text-lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Powerful Features</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to understand and control your spending habits
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="glass border-border/50 hover:border-accent-blue/50 transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-secondary/50 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Upload or Add Transactions</h3>
              <p className="text-muted-foreground">
                Upload bank statements or manually add your expenses with mood tracking
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-black">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get AI Insights</h3>
              <p className="text-muted-foreground">
                Our AI analyzes your spending patterns and provides personalized recommendations
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-green rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-black">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Take Control</h3>
              <p className="text-muted-foreground">
                Use behavioral insights to make better financial decisions and reach your goals
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-accent-blue mb-2">10+</div>
              <div className="text-muted-foreground">Spending Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-green mb-2">5+</div>
              <div className="text-muted-foreground">Mood Types Tracked</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent-gold mb-2">100%</div>
              <div className="text-muted-foreground">Privacy Protected</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">∞</div>
              <div className="text-muted-foreground">Transactions Supported</div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Information */}
      <div className="bg-secondary/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">About the Developers</h2>
            <p className="text-muted-foreground text-lg">
              Meet the team behind SpendWise
            </p>
          </div>

          <Card className="glass max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <Code className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Development Team</CardTitle>
              <CardDescription className="text-lg">
                Passionate developers creating innovative financial tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-accent-blue" />
                  </div>
                  <h4 className="font-semibold">Aarushi S.</h4>
                  <p className="text-sm text-muted-foreground">Lead Developer</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-accent-green/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-accent-green" />
                  </div>
                  <h4 className="font-semibold">Aditya Singh</h4>
                  <p className="text-sm text-muted-foreground">Full Stack Developer</p>
                </div>
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-accent-gold/20 rounded-full flex items-center justify-center mx-auto">
                    <Users className="h-6 w-6 text-accent-gold" />
                  </div>
                  <h4 className="font-semibold">Abhishekh Hardaha</h4>
                  <p className="text-sm text-muted-foreground">Backend Developer</p>
                </div>
              </div>
              
              <div className="border-t border-border pt-6 space-y-2 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Version: v1.2.0</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>First Release: August 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Final CTA */}
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Financial Life?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of users who have already taken control of their spending habits with SpendWise.
          </p>
          
          <Button 
            onClick={onGetStarted}
            className="gradient-green text-black px-8 py-3 text-lg"
          >
            Start Your Journey
            <TrendingUp className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}