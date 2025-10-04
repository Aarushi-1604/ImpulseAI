import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Heart, Brain, TrendingUp, AlertTriangle, Target, Lightbulb, Calendar, Save, Plus, Edit3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  mood?: string;
  isImpulse?: boolean;
}

interface BehavioralInsightsProps {
  transactions: Transaction[];
  onNavigateToManual?: () => void;
}

export function BehavioralInsights({ transactions, onNavigateToManual }: BehavioralInsightsProps) {
  const [weeklyReflection, setWeeklyReflection] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState('');

  // Calculate behavioral data from real transactions
  const behavioralData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Current month transactions - ensure date is a Date object
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.type === 'debit';
    });

    // Calculate impulse score
    const impulseTransactions = currentMonthTransactions.filter(t => t.isImpulse);
    const impulseScore = currentMonthTransactions.length > 0 
      ? Math.round((impulseTransactions.length / currentMonthTransactions.length) * 100)
      : 0;

    // Mood-based spending analysis
    const moodData = currentMonthTransactions
      .filter(t => t.mood)
      .reduce((acc, t) => {
        const mood = t.mood!;
        const existing = acc.find(item => item.mood === mood);
        if (existing) {
          existing.amount += t.amount;
          existing.count += 1;
        } else {
          acc.push({
            mood: mood.charAt(0).toUpperCase() + mood.slice(1),
            amount: t.amount,
            count: 1
          });
        }
        return acc;
      }, [] as Array<{mood: string; amount: number; count: number}>)
      .sort((a, b) => b.amount - a.amount);

    // Calculate emotional spending percentage
    const emotionalTransactions = currentMonthTransactions.filter(t => t.mood);
    const emotionalPercentage = currentMonthTransactions.length > 0 
      ? Math.round((emotionalTransactions.length / currentMonthTransactions.length) * 100)
      : 0;

    // Weekly impulse score trend (last 4 weeks)
    const weeklyImpulseData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + 7));
      const weekEnd = new Date();
      weekEnd.setDate(weekEnd.getDate() - (i * 7));

      const weekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'debit' && transactionDate >= weekStart && transactionDate <= weekEnd;
      });
      
      const weekImpulseTransactions = weekTransactions.filter(t => t.isImpulse);
      const weekScore = weekTransactions.length > 0 
        ? Math.round((weekImpulseTransactions.length / weekTransactions.length) * 100)
        : 0;

      weeklyImpulseData.push({
        week: `Week ${4 - i}`,
        score: weekScore
      });
    }

    // Spending triggers analysis
    const triggerData = [
      { trigger: 'Social Media Ads', category: 'Shopping' },
      { trigger: 'Stress/Work', mood: ['stressed', 'anxious'] },
      { trigger: 'Social Events', category: 'Entertainment' },
      { trigger: 'Boredom', mood: ['bored'] },
      { trigger: 'Sales/Discounts', category: 'Shopping' }
    ].map(triggerInfo => {
      let relatedTransactions: Transaction[] = [];
      
      if ('category' in triggerInfo) {
        relatedTransactions = currentMonthTransactions.filter(t => 
          t.category === triggerInfo.category && t.isImpulse
        );
      } else if ('mood' in triggerInfo) {
        relatedTransactions = currentMonthTransactions.filter(t => 
          t.mood && triggerInfo.mood.includes(t.mood.toLowerCase())
        );
      }

      return {
        trigger: triggerInfo.trigger,
        frequency: relatedTransactions.length,
        amount: relatedTransactions.reduce((sum, t) => sum + t.amount, 0)
      };
    }).filter(item => item.frequency > 0 || item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

    // Weekly spending goal tracking
    const weeklyImpulseSpending = impulseTransactions
      .filter(t => {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const transactionDate = new Date(t.date);
        return transactionDate >= weekAgo;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const weeklyGoalLimit = 5000; // Default goal
    const weeklyProgress = weeklyGoalLimit > 0 ? (weeklyImpulseSpending / weeklyGoalLimit) * 100 : 0;

    return {
      impulseScore,
      emotionalPercentage,
      moodData,
      weeklyImpulseData,
      triggerData,
      weeklyImpulseSpending,
      weeklyGoalLimit,
      weeklyProgress
    };
  }, [transactions]);

  const handleSaveReflection = () => {
    if (!weeklyReflection.trim()) return;
    
    // Save to localStorage
    const reflections = JSON.parse(localStorage.getItem('spendwise_reflections') || '[]');
    reflections.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: weeklyReflection.trim()
    });
    localStorage.setItem('spendwise_reflections', JSON.stringify(reflections));
    
    setWeeklyReflection('');
    toast.success('Weekly reflection saved successfully!');
  };

  const handleSaveGoal = () => {
    if (!weeklyGoal.trim()) return;
    
    // Save to localStorage
    const goals = JSON.parse(localStorage.getItem('spendwise_goals') || '[]');
    goals.push({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: weeklyGoal.trim(),
      status: 'active'
    });
    localStorage.setItem('spendwise_goals', JSON.stringify(goals));
    
    setWeeklyGoal('');
    toast.success('Weekly goal set successfully!');
  };

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-accent-green';
    if (score <= 60) return 'text-accent-gold';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 30) return 'Excellent Control';
    if (score <= 60) return 'Moderate Control';
    return 'Needs Attention';
  };

  const getEmotionalRiskLevel = (percentage: number) => {
    if (percentage <= 30) return { label: 'Low Risk', color: 'border-accent-green/50 text-accent-green' };
    if (percentage <= 60) return { label: 'Medium Risk', color: 'border-accent-gold/50 text-accent-gold' };
    return { label: 'High Risk', color: 'border-destructive/50 text-destructive' };
  };

  if (transactions.filter(t => t.type === 'debit').length === 0) {
    return (
      <div className="space-y-6">
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <Brain className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Behavioral Data</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start tracking your mood and impulse purchases to get personalized behavioral insights. 
              Add transactions with mood tracking to see patterns emerge.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="gradient-blue"
                onClick={onNavigateToManual}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction with Mood Tracking
              </Button>
              <Button 
                variant="outline"
                onClick={onNavigateToManual}
                className="border-accent-green/50"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Manual Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const emotionalRisk = getEmotionalRiskLevel(behavioralData.emotionalPercentage);

  return (
    <div className="space-y-6">
      {/* Impulse Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-accent-gold/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent-gold" />
              Current Impulse Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(behavioralData.impulseScore)}`}>
                {behavioralData.impulseScore}/100
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {getScoreLabel(behavioralData.impulseScore)}
              </p>
              <div className="w-full bg-secondary rounded-full h-3 mt-4">
                <div 
                  className={`h-3 rounded-full transition-all ${
                    behavioralData.impulseScore <= 30 
                      ? 'bg-gradient-to-r from-accent-green to-accent-green' 
                      : behavioralData.impulseScore <= 60 
                      ? 'bg-gradient-to-r from-accent-green to-accent-gold'
                      : 'bg-gradient-to-r from-accent-gold to-destructive'
                  }`}
                  style={{ width: `${behavioralData.impulseScore}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent-blue/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-accent-blue" />
              Emotional Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">{behavioralData.emotionalPercentage}%</div>
              <p className="text-sm text-muted-foreground mt-1">
                of purchases track mood
              </p>
              <div className="mt-4">
                <Badge variant="outline" className={emotionalRisk.color}>
                  {emotionalRisk.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent-green/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-accent-green" />
              Weekly Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold">₹{behavioralData.weeklyGoalLimit.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground mt-1">
                impulse spending limit
              </p>
              <Progress value={Math.min(behavioralData.weeklyProgress, 100)} className="mt-4 h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                ₹{behavioralData.weeklyImpulseSpending.toLocaleString()} spent ({behavioralData.weeklyProgress.toFixed(1)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood-Based Spending Analysis */}
      {behavioralData.moodData.length > 0 ? (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mood-Based Spending Patterns
            </CardTitle>
            <CardDescription>
              How your emotions influence your spending behavior
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={behavioralData.moodData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="mood" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111111', 
                    border: '1px solid #333333',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? `₹${value.toLocaleString()}` : `${value} purchases`,
                    name === 'amount' ? 'Amount Spent' : 'Purchase Count'
                  ]}
                />
                <Bar dataKey="amount" fill="#1a73e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {behavioralData.moodData.map((data) => (
                <div key={data.mood} className="p-3 bg-secondary/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{data.mood}</span>
                    <Badge variant="outline" className="text-xs">
                      {data.count} purchase{data.count !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold mt-1">₹{data.amount.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Mood-Based Spending Patterns
            </CardTitle>
            <CardDescription>
              Start tracking your mood with transactions to see emotional spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No mood data available yet</p>
              <Button 
                variant="outline"
                onClick={onNavigateToManual}
                className="border-accent-blue/50"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Start Mood Tracking
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Impulse Score Trend */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Impulse Score Trend
          </CardTitle>
          <CardDescription>
            Track your impulse control improvement over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          {behavioralData.weeklyImpulseData.some(w => w.score > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={behavioralData.weeklyImpulseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="week" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111111', 
                    border: '1px solid #333333',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}/100`, 'Impulse Score']}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#ffd700" 
                  strokeWidth={3}
                  dot={{ fill: '#ffd700', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="mb-4">Start tracking impulse purchases to see trends</p>
                <Button 
                  variant="outline"
                  onClick={onNavigateToManual}
                  className="border-accent-green/50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Add Impulse Purchase
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Spending Triggers */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Spending Triggers
          </CardTitle>
          <CardDescription>
            Identify what prompts your impulse purchases
          </CardDescription>
        </CardHeader>
        <CardContent>
          {behavioralData.triggerData.length > 0 ? (
            <div className="space-y-4">
              {behavioralData.triggerData.map((trigger, index) => (
                <div key={trigger.trigger} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-accent-blue/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{trigger.trigger}</h4>
                      <p className="text-sm text-muted-foreground">
                        {trigger.frequency} incident{trigger.frequency !== 1 ? 's' : ''} this month
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₹{trigger.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">total spent</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">No spending triggers identified yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Track mood and impulse purchases to identify patterns
                </p>
                <Button 
                  variant="outline"
                  onClick={onNavigateToManual}
                  className="border-accent-blue/50"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Track Triggers
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Weekly Reflection and Smart Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass border-accent-blue/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Reflection
            </CardTitle>
            <CardDescription>
              Reflect on your spending habits and identify improvement areas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">What could you avoid spending on next week?</h4>
              <Textarea
                placeholder="Reflect on your spending patterns and identify areas for improvement..."
                value={weeklyReflection}
                onChange={(e) => setWeeklyReflection(e.target.value)}
                className="bg-input min-h-24"
              />
            </div>
            <Button 
              onClick={handleSaveReflection}
              className="w-full gradient-blue"
              disabled={!weeklyReflection.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Reflection
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-accent-green/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
            <CardDescription>
              AI-powered recommendations based on your spending patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {behavioralData.impulseScore > 50 && (
                <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg">
                  <h4 className="font-medium text-accent-green mb-2">Impulse Control</h4>
                  <p className="text-sm text-muted-foreground">
                    Your impulse score is high ({behavioralData.impulseScore}%). Try the 24-hour rule: wait a day before making purchases over ₹1,000.
                  </p>
                </div>
              )}
              
              {behavioralData.moodData.length > 0 && (
                <div className="p-4 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                  <h4 className="font-medium text-accent-blue mb-2">Mood-Based Strategy</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your mood before purchases. Your highest spending mood is "{behavioralData.moodData[0]?.mood}" - be extra cautious during these times.
                  </p>
                </div>
              )}
              
              {behavioralData.weeklyProgress > 80 && (
                <div className="p-4 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
                  <h4 className="font-medium text-accent-gold mb-2">Budget Alert</h4>
                  <p className="text-sm text-muted-foreground">
                    You've used {behavioralData.weeklyProgress.toFixed(1)}% of your weekly impulse budget. Consider postponing non-essential purchases.
                  </p>
                </div>
              )}

              {behavioralData.impulseScore <= 30 && (
                <div className="p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg">
                  <h4 className="font-medium text-accent-green mb-2">Great Control!</h4>
                  <p className="text-sm text-muted-foreground">
                    Your impulse control is excellent. Keep up the good habits and consider sharing your strategies!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Setting */}
      <Card className="glass border-accent-green/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Set Weekly Goal
          </CardTitle>
          <CardDescription>
            Set a realistic impulse spending limit for next week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Textarea
                placeholder="Describe your goal for next week (e.g., 'Limit food delivery to ₹1,500')"
                value={weeklyGoal}
                onChange={(e) => setWeeklyGoal(e.target.value)}
                className="bg-input"
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Current weekly impulse spending:</span>
                <span className="font-medium">₹{behavioralData.weeklyImpulseSpending.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Suggested weekly limit:</span>
                <span className="font-medium">₹{Math.round(behavioralData.weeklyImpulseSpending * 0.8).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Potential weekly savings:</span>
                <span className="font-medium text-accent-green">₹{Math.round(behavioralData.weeklyImpulseSpending * 0.2).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleSaveGoal}
            className="gradient-green text-black"
            disabled={!weeklyGoal.trim()}
          >
            <Target className="h-4 w-4 mr-2" />
            Set Weekly Goal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}