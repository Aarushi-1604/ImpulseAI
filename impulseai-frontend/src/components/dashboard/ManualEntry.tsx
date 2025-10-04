import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import { CalendarIcon, Plus, Trash2, Edit3, Save, Info } from 'lucide-react';
import { ConfirmationDialog } from '../popups/ConfirmationDialog';
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

interface ManualEntryProps {
  onNewTransaction: (transaction: Transaction) => void;
  monthlyIncome: number;
  onIncomeUpdate: (income: number) => void;
}

const categories = [
  'Food & Dining',
  'Shopping',
  'Travel & Transport',
  'Bills & Utilities',
  'Entertainment',
  'Healthcare',
  'Education',
  'Emergency',
  'Investment',
  'Other'
];

const moods = [
  'Happy', 'Excited', 'Bored', 'Stressed', 'Sad', 'Anxious', 'Confident', 'Neutral'
];

export function ManualEntry({ onNewTransaction, monthlyIncome, onIncomeUpdate }: ManualEntryProps) {
  const [incomeInput, setIncomeInput] = useState<string>(monthlyIncome.toString());
  const [newTransaction, setNewTransaction] = useState<Partial<Transaction>>({
    date: new Date(),
    type: 'debit',
    amount: 0,
    category: '',
    description: '',
    mood: '',
    isImpulse: false
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showIncomeConfirm, setShowIncomeConfirm] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleAddTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category || !newTransaction.description) {
      toast.error('Please fill in all required fields (Amount, Category, Description)');
      return;
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      date: newTransaction.date || new Date(),
      amount: newTransaction.amount,
      type: newTransaction.type || 'debit',
      category: newTransaction.category,
      description: newTransaction.description,
      mood: newTransaction.mood,
      // If it's credit (income), impulse is always false
      isImpulse: newTransaction.type === 'credit' ? false : newTransaction.isImpulse
    };

    onNewTransaction(transaction);
    
    // Reset form
    setNewTransaction({
      date: new Date(),
      type: 'debit',
      amount: 0,
      category: '',
      description: '',
      mood: '',
      isImpulse: false
    });

    toast.success('Transaction added successfully!');
  };

  const handleTypeChange = (checked: boolean) => {
    const newType = checked ? 'credit' : 'debit';
    setNewTransaction(prev => ({ 
      ...prev, 
      type: newType,
      // Reset impulse to false when switching to credit
      isImpulse: newType === 'credit' ? false : prev.isImpulse
    }));
  };

  const handleSaveIncome = () => {
    const income = parseFloat(incomeInput) || 0;
    onIncomeUpdate(income);
    setShowIncomeConfirm(false);
    toast.success(`Monthly income updated to ₹${income.toLocaleString()}!`);
  };

  const isCredit = newTransaction.type === 'credit';

  // Quick entry templates
  const quickEntries = [
    { description: 'Coffee', amount: 150, category: 'Food & Dining', type: 'debit' },
    { description: 'Lunch', amount: 300, category: 'Food & Dining', type: 'debit' },
    { description: 'Uber Ride', amount: 200, category: 'Travel & Transport', type: 'debit' },
    { description: 'Grocery Shopping', amount: 800, category: 'Food & Dining', type: 'debit' },
  ];

  const handleQuickEntry = (entry: any) => {
    setNewTransaction(prev => ({
      ...prev,
      description: entry.description,
      amount: entry.amount,
      category: entry.category,
      type: entry.type
    }));
    toast.success(`Quick entry filled: ${entry.description}`);
  };

  return (
    <div className="space-y-6">
      {/* Monthly Income Setting */}
      <Card className="glass border-accent-green/20">
        <CardHeader>
          <CardTitle>Monthly Income</CardTitle>
          <CardDescription>Set your monthly income to track spending ratios and budget status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <Label htmlFor="income">Monthly Income (₹)</Label>
              <Input
                id="income"
                type="number"
                placeholder="Enter your monthly income"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                className="bg-input"
                min="0"
              />
            </div>
            <Button 
              className="gradient-green text-black"
              onClick={() => setShowIncomeConfirm(true)}
              disabled={!incomeInput || parseFloat(incomeInput) === monthlyIncome}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
          {monthlyIncome > 0 && (
            <div className="mt-4 p-4 bg-accent-green/10 border border-accent-green/20 rounded-lg">
              <p className="text-sm">
                Current Monthly Income: <span className="font-bold text-accent-green">₹{monthlyIncome.toLocaleString()}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                This is used to calculate budget percentages and spending insights
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Entry Templates */}
      <Card className="glass border-accent-blue/20">
        <CardHeader>
          <CardTitle>Quick Entry</CardTitle>
          <CardDescription>Common transactions for faster entry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickEntries.map((entry, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleQuickEntry(entry)}
                className="h-auto p-3 flex flex-col items-start border-border/50 hover:border-accent-blue/50"
              >
                <span className="font-medium text-sm">{entry.description}</span>
                <span className="text-xs text-muted-foreground">₹{entry.amount}</span>
                <Badge variant="outline" className="text-xs mt-1">
                  {entry.category}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Form */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Add New Transaction
          </CardTitle>
          <CardDescription>
            Manually add your income and expenses with mood tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-input hover:bg-input/80"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newTransaction.date ? formatDate(newTransaction.date) : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newTransaction.date}
                    onSelect={(date) => {
                      setNewTransaction(prev => ({ ...prev, date: date || new Date() }));
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Amount (₹) *</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={newTransaction.amount || ''}
                onChange={(e) => setNewTransaction(prev => ({ 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                }))}
                className="bg-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isCredit}
                    onCheckedChange={handleTypeChange}
                  />
                  <Label className={isCredit ? 'text-accent-green' : 'text-foreground'}>
                    {isCredit ? 'Credit (Income)' : 'Debit (Expense)'}
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={newTransaction.category}
                onValueChange={(value) => setNewTransaction(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description *</Label>
            <Textarea
              placeholder="Enter transaction description (e.g., 'Coffee at Starbucks', 'Monthly salary')"
              value={newTransaction.description}
              onChange={(e) => setNewTransaction(prev => ({ ...prev, description: e.target.value }))}
              className="bg-input"
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground">
              {newTransaction.description?.length || 0}/200 characters
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mood (Optional)</Label>
              <Select
                value={newTransaction.mood}
                onValueChange={(value) => setNewTransaction(prev => ({ ...prev, mood: value }))}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="How were you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  {moods.map((mood) => (
                    <SelectItem key={mood} value={mood.toLowerCase()}>
                      {mood}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Impulse Purchase?</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  checked={newTransaction.isImpulse && !isCredit}
                  onCheckedChange={(checked) => 
                    setNewTransaction(prev => ({ 
                      ...prev, 
                      isImpulse: isCredit ? false : checked 
                    }))
                  }
                  disabled={isCredit}
                />
                <Label className={`text-sm ${isCredit ? 'text-muted-foreground' : 'text-foreground'}`}>
                  This was an unplanned purchase
                </Label>
                {isCredit && (
                  <div className="flex items-center ml-2">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground ml-1">
                      Not applicable for income
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleAddTransaction}
            className="w-full gradient-blue"
            disabled={!newTransaction.amount || !newTransaction.category || !newTransaction.description?.trim()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="glass border-muted/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-accent-blue mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-medium">Transaction Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use Quick Entry buttons for common transactions</li>
                <li>• Be specific in descriptions for better categorization</li>
                <li>• Track your mood to identify emotional spending patterns</li>
                <li>• Mark impulse purchases to improve spending awareness</li>
                <li>• Update your monthly income for accurate budget tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Income */}
      <ConfirmationDialog
        isOpen={showIncomeConfirm}
        onClose={() => setShowIncomeConfirm(false)}
        onConfirm={handleSaveIncome}
        title="Update Monthly Income"
        description={`Are you sure you want to set your monthly income to ₹${parseFloat(incomeInput || '0').toLocaleString()}? This will affect your budget calculations and spending insights.`}
        confirmText="Save Income"
        variant="success"
      />
    </div>
  );
}