import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { TrendingUp, TrendingDown, Download, Calendar, PieChart, BarChart3, Plus, Edit3 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';

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

interface AnalyticsProps {
  transactions: Transaction[];
  onNavigateToManual?: () => void;
}

const CHART_COLORS = ['#1a73e8', '#00ff88', '#ffd700', '#ff6b6b', '#4ecdc4', '#a3a3a3'];

export function Analytics({ transactions, onNavigateToManual }: AnalyticsProps) {
  const [timeRange, setTimeRange] = useState('6months');
  const [viewType, setViewType] = useState('overview');

  // Calculate analytics data from real transactions
  const analyticsData = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Filter transactions based on time range
    const getFilteredTransactions = () => {
      const now = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '1month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case '6months':
          startDate.setMonth(now.getMonth() - 6);
          break;
        case '1year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setMonth(now.getMonth() - 6);
      }
      
      return transactions.filter(t => t.date >= startDate);
    };

    const filteredTransactions = getFilteredTransactions();

    // Current month transactions - ensure date is a Date object
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    // Previous month transactions
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const prevMonthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === prevMonth && transactionDate.getFullYear() === prevYear;
    });

    // Calculate spending amounts
    const currentMonthSpending = currentMonthTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const prevMonthSpending = prevMonthTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingChange = prevMonthSpending > 0 
      ? ((currentMonthSpending - prevMonthSpending) / prevMonthSpending) * 100 
      : 0;

    // Category breakdown
    const categoryData = currentMonthTransactions
      .filter(t => t.type === 'debit')
      .reduce((acc, t) => {
        const existing = acc.find(item => item.name === t.category);
        if (existing) {
          existing.value += t.amount;
        } else {
          acc.push({
            name: t.category,
            value: t.amount,
            color: CHART_COLORS[acc.length % CHART_COLORS.length]
          });
        }
        return acc;
      }, [] as Array<{name: string; value: number; color: string}>)
      .sort((a, b) => b.value - a.value);

    // Monthly spending trend
    const monthlyData: Array<{month: string; spending: number; income: number}> = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toLocaleDateString('en-US', { month: 'short' });
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const spending = monthTransactions
        .filter(t => t.type === 'debit')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const income = monthTransactions
        .filter(t => t.type === 'credit')
        .reduce((sum, t) => sum + t.amount, 0);
      
      monthlyData.push({ month, spending, income });
    }

    // Daily spending pattern
    const dailyData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
      const dayIndex = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
      const dayTransactions = currentMonthTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'debit' && transactionDate.getDay() === dayIndex;
      });
      const amount = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      return { day, amount };
    });

    // Impulse vs normal spending by category
    const impulseData = categoryData.map(cat => {
      const catTransactions = currentMonthTransactions.filter(t => 
        t.type === 'debit' && t.category === cat.name
      );
      const impulse = catTransactions
        .filter(t => t.isImpulse)
        .reduce((sum, t) => sum + t.amount, 0);
      const normal = catTransactions
        .filter(t => !t.isImpulse)
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        category: cat.name,
        impulse,
        normal
      };
    }).filter(item => item.impulse > 0 || item.normal > 0);

    // Calculate impulse ratio
    const impulseTransactions = currentMonthTransactions.filter(t => t.type === 'debit' && t.isImpulse);
    const totalDebitTransactions = currentMonthTransactions.filter(t => t.type === 'debit');
    const impulseRatio = totalDebitTransactions.length > 0 
      ? Math.round((impulseTransactions.length / totalDebitTransactions.length) * 100)
      : 0;

    // Top category
    const topCategory = categoryData.length > 0 ? categoryData[0].name : 'None';

    return {
      currentMonthSpending,
      spendingChange,
      impulseRatio,
      topCategory,
      categoryData,
      monthlyData,
      dailyData,
      impulseData
    };
  }, [transactions, timeRange]);

  const handleExportReport = () => {
    const reportData = {
      reportDate: new Date().toISOString(),
      timeRange,
      summary: {
        totalTransactions: transactions.length,
        currentMonthSpending: analyticsData.currentMonthSpending,
        spendingChange: analyticsData.spendingChange,
        impulseRatio: analyticsData.impulseRatio,
        topCategory: analyticsData.topCategory
      },
      transactions: transactions.map(t => ({
        ...t,
        date: t.date.toISOString()
      }))
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Start adding transactions to see detailed analytics and spending insights. 
              Your financial patterns will appear here once you have transaction data.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                className="gradient-blue"
                onClick={onNavigateToManual}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Transaction
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

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={viewType} onValueChange={setViewType}>
            <SelectTrigger className="w-40 bg-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="categories">Categories</SelectItem>
              <SelectItem value="trends">Trends</SelectItem>
              <SelectItem value="impulse">Impulse Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleExportReport} className="gradient-blue">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-accent-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-xl font-bold">₹{analyticsData.currentMonthSpending.toLocaleString()}</p>
              </div>
              <div className={`flex items-center text-sm ${analyticsData.spendingChange > 0 ? 'text-destructive' : 'text-accent-green'}`}>
                {analyticsData.spendingChange > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(analyticsData.spendingChange).toFixed(1)}%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent-green/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Daily</p>
                <p className="text-xl font-bold">₹{Math.round(analyticsData.currentMonthSpending / 30).toLocaleString()}</p>
              </div>
              <Calendar className="h-5 w-5 text-accent-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impulse Ratio</p>
                <p className="text-xl font-bold">{analyticsData.impulseRatio}%</p>
              </div>
              <div className="text-accent-gold">
                <Badge variant="outline" className={`border-accent-gold/50 ${
                  analyticsData.impulseRatio > 50 ? 'text-destructive border-destructive/50' :
                  analyticsData.impulseRatio > 30 ? 'text-accent-gold' : 'text-accent-green border-accent-green/50'
                }`}>
                  {analyticsData.impulseRatio > 50 ? 'High' : analyticsData.impulseRatio > 30 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Category</p>
                <p className="text-lg font-bold">{analyticsData.topCategory}</p>
              </div>
              <PieChart className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      {viewType === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Spending vs Income Trend</CardTitle>
              <CardDescription>Monthly comparison over the last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#a3a3a3" />
                  <YAxis stroke="#a3a3a3" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111111', 
                      border: '1px solid #333333',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1" 
                    stroke="#00ff88" 
                    fill="#00ff88" 
                    fillOpacity={0.1}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="spending" 
                    stackId="2" 
                    stroke="#1a73e8" 
                    fill="#1a73e8" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Where your money goes this month</CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.categoryData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={analyticsData.categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analyticsData.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#111111', 
                          border: '1px solid #333333',
                          borderRadius: '8px'
                        }}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {analyticsData.categoryData.map((category) => (
                      <div key={category.name} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-xs">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  <div className="text-center">
                    <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>No spending categories to display</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {viewType === 'trends' && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Daily Spending Pattern</CardTitle>
            <CardDescription>Your spending habits throughout the week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={analyticsData.dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="day" stroke="#a3a3a3" />
                <YAxis stroke="#a3a3a3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111111', 
                    border: '1px solid #333333',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']}
                />
                <Bar dataKey="amount" fill="#1a73e8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {viewType === 'impulse' && (
        <Card className="glass">
          <CardHeader>
            <CardTitle>Impulse vs Planned Spending</CardTitle>
            <CardDescription>Compare your impulsive and planned purchases by category</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.impulseData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analyticsData.impulseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="category" stroke="#a3a3a3" />
                    <YAxis stroke="#a3a3a3" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#111111', 
                        border: '1px solid #333333',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                    />
                    <Bar dataKey="normal" fill="#00ff88" name="Planned" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="impulse" fill="#ff6b6b" name="Impulse" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent-green" />
                    <span className="text-sm">Planned Spending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-destructive" />
                    <span className="text-sm">Impulse Spending</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>No impulse spending data to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Real-time Insights */}
      {transactions.length > 0 && (
        <Card className="glass border-accent-gold/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                  <h4 className="font-medium text-accent-blue">Transaction Activity</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    You have recorded {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} so far.
                  </p>
                </div>
                {analyticsData.spendingChange !== 0 && (
                  <div className={`p-3 border rounded-lg ${
                    analyticsData.spendingChange > 0 
                      ? 'bg-destructive/10 border-destructive/20' 
                      : 'bg-accent-green/10 border-accent-green/20'
                  }`}>
                    <h4 className={`font-medium ${
                      analyticsData.spendingChange > 0 ? 'text-destructive' : 'text-accent-green'
                    }`}>
                      Monthly Trend
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your spending {analyticsData.spendingChange > 0 ? 'increased' : 'decreased'} by {Math.abs(analyticsData.spendingChange).toFixed(1)}% compared to last month.
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {analyticsData.impulseRatio > 30 && (
                  <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
                    <h4 className="font-medium text-accent-gold">Impulse Alert</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {analyticsData.impulseRatio}% of your purchases are impulse buys. Consider the 24-hour rule for major purchases.
                    </p>
                  </div>
                )}
                {analyticsData.topCategory !== 'None' && (
                  <div className="p-3 bg-accent-blue/10 border border-accent-blue/20 rounded-lg">
                    <h4 className="font-medium text-accent-blue">Top Category</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Most of your spending goes to {analyticsData.topCategory}. Track this category closely.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}