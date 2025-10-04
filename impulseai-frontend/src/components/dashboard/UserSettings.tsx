import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Settings, Bell, Shield, Download, Trash2, Save, Moon, Sun } from 'lucide-react';
import { ConfirmationDialog } from '../popups/ConfirmationDialog';
import { toast } from 'sonner@2.0.3';

interface UserSettingsProps {
  user: { name: string; email: string };
  budgetLimits: {
    monthly: number;
    categories: {
      [key: string]: number;
    };
  };
  onBudgetUpdate: (budgets: any) => void;
  onAccountDelete: () => void; // Add this prop for proper deletion handling
}

export function UserSettings({ user, budgetLimits, onBudgetUpdate, onAccountDelete }: UserSettingsProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(budgetLimits.monthly.toString());
  const [categoryLimits, setCategoryLimits] = useState({
    'Food & Dining': budgetLimits.categories['Food & Dining']?.toString() || '12000',
    'Shopping': budgetLimits.categories['Shopping']?.toString() || '8000',
    'Travel & Transport': budgetLimits.categories['Travel & Transport']?.toString() || '6000',
    'Entertainment': budgetLimits.categories['Entertainment']?.toString() || '4000'
  });
  const [notifications, setNotifications] = useState({
    spending: true,
    budget: true,
    weekly: false,
    impulse: true
  });
  const [darkMode, setDarkMode] = useState(() => {
    // Check localStorage for theme preference, default to true (dark mode)
    const savedTheme = localStorage.getItem('spendwise_theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [currency, setCurrency] = useState('INR');
  
  // Dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBudgetConfirm, setShowBudgetConfirm] = useState(false);
  const [showNotificationConfirm, setShowNotificationConfirm] = useState(false);

  // Apply theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('spendwise_theme');
    const isDark = savedTheme ? savedTheme === 'dark' : true;
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleSaveBudget = () => {
    const newBudgets = {
      monthly: parseFloat(monthlyBudget) || 0,
      categories: {
        'Food & Dining': parseFloat(categoryLimits['Food & Dining']) || 0,
        'Shopping': parseFloat(categoryLimits['Shopping']) || 0,
        'Travel & Transport': parseFloat(categoryLimits['Travel & Transport']) || 0,
        'Entertainment': parseFloat(categoryLimits['Entertainment']) || 0
      }
    };
    
    onBudgetUpdate(newBudgets);
    setShowBudgetConfirm(false);
    toast.success('Budget settings saved successfully!');
  };

  const handleSaveNotifications = () => {
    // Save notification preferences to localStorage
    localStorage.setItem('spendwise_notifications', JSON.stringify(notifications));
    setShowNotificationConfirm(false);
    toast.success('Notification preferences saved!');
  };

  const handleExportData = () => {
    const userData = {
      user,
      transactions: JSON.parse(localStorage.getItem('spendwise_transactions') || '[]'),
      income: localStorage.getItem('spendwise_income'),
      budgets: localStorage.getItem('spendwise_budgets'),
      notifications,
      reflections: JSON.parse(localStorage.getItem('spendwise_reflections') || '[]'),
      goals: JSON.parse(localStorage.getItem('spendwise_goals') || '[]'),
      exportDate: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = () => {
    // Show success message
    toast.success('Account deleted successfully. Redirecting to signup...');
    
    // Call the parent handler after a short delay
    setTimeout(() => {
      onAccountDelete();
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Profile Settings */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                defaultValue={user.name}
                className="bg-input"
                disabled
              />
              <p className="text-xs text-muted-foreground">Name cannot be changed in demo mode</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email}
                className="bg-input"
                disabled
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed in demo mode</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budget & Limits */}
      <Card className="glass border-accent-green/20">
        <CardHeader>
          <CardTitle>Budget & Category Limits</CardTitle>
          <CardDescription>Set your monthly budget and category-wise spending limits</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="budget">Monthly Budget (₹)</Label>
            <Input
              id="budget"
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="bg-input"
              placeholder="Enter your monthly budget"
              min="0"
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">Category Limits</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Food & Dining (₹)</Label>
                <Input
                  type="number"
                  value={categoryLimits['Food & Dining']}
                  onChange={(e) => setCategoryLimits(prev => ({ ...prev, 'Food & Dining': e.target.value }))}
                  className="bg-input"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Shopping (₹)</Label>
                <Input
                  type="number"
                  value={categoryLimits['Shopping']}
                  onChange={(e) => setCategoryLimits(prev => ({ ...prev, 'Shopping': e.target.value }))}
                  className="bg-input"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Travel & Transport (₹)</Label>
                <Input
                  type="number"
                  value={categoryLimits['Travel & Transport']}
                  onChange={(e) => setCategoryLimits(prev => ({ ...prev, 'Travel & Transport': e.target.value }))}
                  className="bg-input"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Entertainment (₹)</Label>
                <Input
                  type="number"
                  value={categoryLimits['Entertainment']}
                  onChange={(e) => setCategoryLimits(prev => ({ ...prev, 'Entertainment': e.target.value }))}
                  className="bg-input"
                  min="0"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setShowBudgetConfirm(true)} 
            className="gradient-green text-black"
            disabled={monthlyBudget === budgetLimits.monthly.toString() && 
              Object.entries(categoryLimits).every(([key, value]) => 
                parseFloat(value) === (budgetLimits.categories[key] || 0)
              )}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Budget Settings
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass border-accent-blue/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Choose what notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Spending Alerts</h4>
                <p className="text-sm text-muted-foreground">Get notified when you make large purchases</p>
              </div>
              <Switch
                checked={notifications.spending}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, spending: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Budget Warnings</h4>
                <p className="text-sm text-muted-foreground">Alerts when approaching budget limits</p>
              </div>
              <Switch
                checked={notifications.budget}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, budget: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Weekly Reports</h4>
                <p className="text-sm text-muted-foreground">Weekly spending summary via email</p>
              </div>
              <Switch
                checked={notifications.weekly}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weekly: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Impulse Alerts</h4>
                <p className="text-sm text-muted-foreground">Warnings for potential impulse purchases</p>
              </div>
              <Switch
                checked={notifications.impulse}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, impulse: checked }))}
              />
            </div>
          </div>

          <Button onClick={() => setShowNotificationConfirm(true)} className="gradient-blue">
            <Save className="h-4 w-4 mr-2" />
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Appearance & Preferences */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Appearance & Preferences</CardTitle>
          <CardDescription>Customize your app experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <div>
                  <h4 className="font-medium">Dark Mode</h4>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={(checked) => {
                  setDarkMode(checked);
                  localStorage.setItem('spendwise_theme', checked ? 'dark' : 'light');
                  
                  // Apply theme to document
                  if (checked) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');  
                    document.documentElement.classList.remove('dark');
                  }
                  
                  toast.success(`Switched to ${checked ? 'dark' : 'light'} mode`);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-40 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INR">₹ Indian Rupee</SelectItem>
                  <SelectItem value="USD">$ US Dollar</SelectItem>
                  <SelectItem value="EUR">€ Euro</SelectItem>
                  <SelectItem value="GBP">£ British Pound</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Currency display will be updated in a future version</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data & Privacy */}
      <Card className="glass border-accent-gold/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data & Privacy
          </CardTitle>
          <CardDescription>Manage your data and account security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Export Data</h4>
                <p className="text-sm text-muted-foreground">Download all your spending data</p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <h4 className="font-medium text-destructive mb-2">Danger Zone</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>
                <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Information */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>App Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Version</span>
              <Badge variant="outline">v1.2.0</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Updated</span>
              <span className="text-muted-foreground">August 12, 2025</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Data Storage</span>
              <span className="text-muted-foreground">Local Browser Storage</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Transactions</span>
              <span className="text-muted-foreground">
                {JSON.parse(localStorage.getItem('spendwise_transactions') || '[]').length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed. You will be redirected to the signup page."
        confirmText="Delete Account"
        cancelText="Keep Account"
        variant="destructive"
      />

      <ConfirmationDialog
        isOpen={showBudgetConfirm}
        onClose={() => setShowBudgetConfirm(false)}
        onConfirm={handleSaveBudget}
        title="Save Budget Settings"
        description="Are you sure you want to update your budget limits? This will affect your spending alerts and analytics."
        confirmText="Save Settings"
        variant="success"
      />

      <ConfirmationDialog
        isOpen={showNotificationConfirm}
        onClose={() => setShowNotificationConfirm(false)}
        onConfirm={handleSaveNotifications}
        title="Save Notification Settings"
        description="Your notification preferences will be updated. You can change these settings anytime."
        confirmText="Save Settings"
        variant="success"
      />
    </div>
  );
}