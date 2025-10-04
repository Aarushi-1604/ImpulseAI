import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Upload, Edit3, TrendingUp, AlertTriangle, Settings, LogOut, Plus, IndianRupee, History } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { ManualEntry } from './ManualEntry';
import { Analytics } from './Analytics';
import { BehavioralInsights } from './BehavioralInsights';
import { TransactionHistory } from './TransactionHistory';
import { UserSettings } from './UserSettings';
import { TransactionReceipt } from '../popups/TransactionReceipt';
import { BudgetAlert } from '../popups/BudgetAlert';
import { toast } from 'sonner@2.0.3';

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

interface BudgetAlertData {
  alertType: 'warning' | 'exceeded';
  category: string;
  currentAmount: number;
  budgetLimit: number;
  percentage: number;
}

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onAccountDelete?: () => void;
}

// Default values
const DEFAULT_MONTHLY_INCOME = 50000; // ₹50,000 default salary
const DEFAULT_BUDGET_LIMITS = {
  monthly: 45000, // 90% of income for budget
  categories: {
    'Food & Dining': 15000,
    'Shopping': 10000,
    'Travel & Transport': 8000,
    'Entertainment': 5000,
    'Bills & Utilities': 7000
  }
};

export function Dashboard({ user, onLogout, onAccountDelete }: DashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<number>(DEFAULT_MONTHLY_INCOME);
  const [budgetLimits, setBudgetLimits] = useState(DEFAULT_BUDGET_LIMITS);
  const [isFirstTime, setIsFirstTime] = useState(true);
  
  // Popup states
  const [showReceipt, setShowReceipt] = useState(false);
  const [newTransaction, setNewTransaction] = useState<Transaction | null>(null);
  const [showBudgetAlert, setShowBudgetAlert] = useState(false);
  const [budgetAlertData, setBudgetAlertData] = useState<BudgetAlertData | null>(null);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('spendwise_transactions');
    const savedIncome = localStorage.getItem('spendwise_income');
    const savedBudgets = localStorage.getItem('spendwise_budgets');
    const hasExistingData = localStorage.getItem('spendwise_user');
    
    if (savedTransactions) {
      try {
        const parsed = JSON.parse(savedTransactions);
        const transactionsWithDates = parsed.map((t: any) => ({
          ...t,
          date: new Date(t.date)
        }));
        setTransactions(transactionsWithDates);
        setIsFirstTime(false);
      } catch (error) {
        console.error('Error loading transactions:', error);
      }
    }
    
    if (savedIncome) {
      const income = parseFloat(savedIncome);
      if (income > 0) {
        setMonthlyIncome(income);
        setIsFirstTime(false);
      }
    } else if (hasExistingData && isFirstTime) {
      // Set default income for first-time users
      setMonthlyIncome(DEFAULT_MONTHLY_INCOME);
      localStorage.setItem('spendwise_income', DEFAULT_MONTHLY_INCOME.toString());
    }
    
    if (savedBudgets) {
      try {
        setBudgetLimits(JSON.parse(savedBudgets));
        setIsFirstTime(false);
      } catch (error) {
        console.error('Error loading budgets:', error);
      }
    } else if (hasExistingData && isFirstTime) {
      // Set default budgets for first-time users
      setBudgetLimits(DEFAULT_BUDGET_LIMITS);
      localStorage.setItem('spendwise_budgets', JSON.stringify(DEFAULT_BUDGET_LIMITS));
    }
  }, []);

  // Show welcome message for first-time setup
  useEffect(() => {
    if (isFirstTime && monthlyIncome === DEFAULT_MONTHLY_INCOME) {
      const timer = setTimeout(() => {
        toast.success(`Welcome! We've preset your monthly income to ₹${DEFAULT_MONTHLY_INCOME.toLocaleString()}. You can adjust this in Settings.`, {
          duration: 5000
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isFirstTime, monthlyIncome]);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('spendwise_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('spendwise_income', monthlyIncome.toString());
  }, [monthlyIncome]);

  useEffect(() => {
    localStorage.setItem('spendwise_budgets', JSON.stringify(budgetLimits));
  }, [budgetLimits]);

  // Calculate statistics with memoization
  const { currentMonthTransactions, monthlySpending, monthlyIncomeActual, impulseScore, budgetUsedPercentage } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthTxs = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const txMonth = transactionDate.getMonth();
      const txYear = transactionDate.getFullYear();
      return txMonth === currentMonth && txYear === currentYear;
    });
    
    const spending = currentMonthTxs
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const incomeActual = currentMonthTxs
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);

    const impulseTransactions = currentMonthTxs.filter(t => t.isImpulse && t.type === 'debit');
    const debitTransactions = currentMonthTxs.filter(t => t.type === 'debit');
    const impulse = debitTransactions.length > 0 
      ? Math.round((impulseTransactions.length / debitTransactions.length) * 100)
      : 0;
    
    const budgetUsed = budgetLimits.monthly > 0 ? Math.round((spending / budgetLimits.monthly) * 100) : 0;

    return {
      currentMonthTransactions: currentMonthTxs,
      monthlySpending: spending,
      monthlyIncomeActual: incomeActual,
      impulseScore: impulse,
      budgetUsedPercentage: budgetUsed
    };
  }, [transactions, budgetLimits.monthly]);

  // Handle new transaction from ManualEntry or FileUpload
  const handleNewTransaction = (transaction: Transaction) => {
    // Ensure the transaction date is properly formatted
    const processedTransaction = {
      ...transaction,
      date: new Date(transaction.date)
    };
    
    setTransactions(prev => [processedTransaction, ...prev]);
    setNewTransaction(processedTransaction);
    setShowReceipt(true);
    
    // Check budget limits
    checkBudgetLimits(processedTransaction);
  };

  // Handle multiple transactions from FileUpload
  const handleNewTransactions = (newTransactions: Transaction[]) => {
    if (newTransactions.length > 0) {
      setTransactions(prev => [...newTransactions, ...prev]);
      
      // Show summary notification
      const credits = newTransactions.filter(t => t.type === 'credit').length;
      const debits = newTransactions.filter(t => t.type === 'debit').length;
      
      toast.success(
        `Successfully imported ${newTransactions.length} transactions (${credits} credits, ${debits} debits)`,
        { duration: 4000 }
      );
      
      // Check budget limits for the latest transaction
      checkBudgetLimits(newTransactions[0]);
    }
  };

  // Handle transaction update
  const handleUpdateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  // Handle single transaction delete
  const handleDeleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  // Handle bulk transaction delete
  const handleBulkDelete = (transactionIds: string[]) => {
    setTransactions(prev => prev.filter(t => !transactionIds.includes(t.id)));
  };

  const checkBudgetLimits = (newTransaction: Transaction) => {
    if (newTransaction.type === 'credit') return;
    
    const newMonthlySpending = monthlySpending + newTransaction.amount;
    const monthlyPercentage = budgetLimits.monthly > 0 ? (newMonthlySpending / budgetLimits.monthly) * 100 : 0;
    
    // Only show alert if budget limit is set
    if (budgetLimits.monthly > 0) {
      if (monthlyPercentage >= 100) {
        setBudgetAlertData({
          alertType: 'exceeded',
          category: 'Monthly Budget',
          currentAmount: newMonthlySpending,
          budgetLimit: budgetLimits.monthly,
          percentage: monthlyPercentage
        });
        setShowBudgetAlert(true);
      } else if (monthlyPercentage >= 80) {
        setBudgetAlertData({
          alertType: 'warning',
          category: 'Monthly Budget',
          currentAmount: newMonthlySpending,
          budgetLimit: budgetLimits.monthly,
          percentage: monthlyPercentage
        });
        setShowBudgetAlert(true);
      }
    }
  };

  // Handle account deletion
  const handleAccountDelete = () => {
    // Clear all local storage
    localStorage.clear();
    // Call the parent handler to reset app state
    if (onAccountDelete) {
      onAccountDelete();
    }
  };

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-blue rounded-full flex items-center justify-center">
                <span className="font-bold text-white">₹</span>
              </div>
              <h1 className="text-xl font-semibold">SpendWise</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                className="border-border/50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass border-accent-blue/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{monthlySpending.toLocaleString()}</div>
              <div className="flex items-center text-sm mt-1">
                <TrendingUp className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {currentMonthTransactions.filter(t => t.type === 'debit').length} transaction{currentMonthTransactions.filter(t => t.type === 'debit').length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-accent-green/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Income</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent-green">
                ₹{monthlyIncome.toLocaleString()}
              </div>
              <div className="flex items-center text-sm mt-1">
                <IndianRupee className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {monthlyIncomeActual > 0 ? `+₹${monthlyIncomeActual.toLocaleString()} received` : 'Set in profile'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-accent-gold/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Impulse Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{impulseScore}/100</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-accent-green to-accent-gold h-2 rounded-full transition-all"
                  style={{ width: `${impulseScore}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-accent-blue/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Budget Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div>
                  <div className={`text-sm font-medium ${
                    budgetUsedPercentage >= 100 ? 'text-destructive' :
                    budgetUsedPercentage >= 80 ? 'text-accent-gold' : 'text-accent-green'
                  }`}>
                    {budgetUsedPercentage}% used
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ₹{Math.max(0, budgetLimits.monthly - monthlySpending).toLocaleString()} remaining
                  </div>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    budgetUsedPercentage >= 100 ? 'bg-destructive' :
                    budgetUsedPercentage >= 80 ? 'bg-accent-gold' : 'bg-accent-green'
                  }`}
                  style={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-secondary/50">
            <TabsTrigger value="overview" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              <Edit3 className="h-4 w-4 mr-2" />
              Manual
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              Insights
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-accent-blue data-[state=active]:text-white">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Get started with tracking your expenses</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    className="w-full justify-start gradient-blue"
                    onClick={() => setActiveTab('upload')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Bank Statements
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-accent-green/50"
                    onClick={() => setActiveTab('manual')}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Add Manual Entry
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-accent-gold/50"
                    onClick={() => setActiveTab('history')}
                  >
                    <History className="mr-2 h-4 w-4" />
                    View Transaction History
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                      {recentTransactions.map((transaction) => (
                        <div key={transaction.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {transaction.category}
                              </Badge>
                              {transaction.mood && (
                                <Badge variant="outline" className="text-xs capitalize">
                                  {transaction.mood}
                                </Badge>
                              )}
                              {transaction.isImpulse && transaction.type === 'debit' && (
                                <Badge variant="destructive" className="text-xs">
                                  Impulse
                                </Badge>
                              )}
                            </div>
                          </div>
                          <span className={`font-bold ${transaction.type === 'credit' ? 'text-accent-green' : 'text-foreground'}`}>
                            {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-4">No transactions yet</p>
                      <Button 
                        variant="outline" 
                        onClick={() => setActiveTab('manual')}
                        className="border-accent-blue/50"
                      >
                        Add Your First Transaction
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <FileUpload onTransactionsProcessed={handleNewTransactions} />
          </TabsContent>

          <TabsContent value="manual">
            <ManualEntry 
              onNewTransaction={handleNewTransaction}
              monthlyIncome={monthlyIncome}
              onIncomeUpdate={setMonthlyIncome}
            />
          </TabsContent>

          <TabsContent value="history">
            <TransactionHistory 
              transactions={transactions}
              monthlyIncome={monthlyIncome}
              budgetLimit={budgetLimits.monthly}
              onNavigateToManual={() => setActiveTab('manual')}
              onUpdateTransaction={handleUpdateTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onBulkDelete={handleBulkDelete}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics 
              key={transactions.length} 
              transactions={transactions} 
              onNavigateToManual={() => setActiveTab('manual')} 
            />
          </TabsContent>

          <TabsContent value="insights">
            <BehavioralInsights 
              key={transactions.length} 
              transactions={transactions} 
              onNavigateToManual={() => setActiveTab('manual')} 
            />
          </TabsContent>

          <TabsContent value="settings">
            <UserSettings 
              user={user} 
              budgetLimits={budgetLimits}
              onBudgetUpdate={setBudgetLimits}
              onAccountDelete={handleAccountDelete}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Popups */}
      <TransactionReceipt
        transaction={newTransaction}
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          setNewTransaction(null);
        }}
      />

      {/* Only render BudgetAlert if we have valid data */}
      {budgetAlertData && (
        <BudgetAlert
          isOpen={showBudgetAlert}
          onClose={() => {
            setShowBudgetAlert(false);
            setBudgetAlertData(null);
          }}
          alertType={budgetAlertData.alertType}
          category={budgetAlertData.category}
          currentAmount={budgetAlertData.currentAmount}
          budgetLimit={budgetAlertData.budgetLimit}
          percentage={budgetAlertData.percentage}
        />
      )}
    </div>
  );
}