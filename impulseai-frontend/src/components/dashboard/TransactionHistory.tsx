import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  ArrowUpDown, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Edit3,
  MoreHorizontal,
  Edit,
  Trash2,
  Calendar,
  CalendarX
} from 'lucide-react';
import { toast } from 'sonner';
import { EditTransactionDialog } from '../popups/EditTransactionDialog';
import { BulkDeleteDialog } from '../popups/BulkDeleteDialog';
import { ConfirmationDialog } from '../popups/ConfirmationDialog';

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

interface TransactionHistoryProps {
  transactions: Transaction[];
  monthlyIncome: number;
  budgetLimit: number;
  onNavigateToManual?: () => void;
  onUpdateTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (transactionId: string) => void;
  onBulkDelete?: (transactionIds: string[]) => void;
}

type SortField = 'date' | 'amount' | 'description' | 'category';
type SortOrder = 'asc' | 'desc';

export function TransactionHistory({ 
  transactions, 
  monthlyIncome, 
  budgetLimit,
  onNavigateToManual,
  onUpdateTransaction,
  onDeleteTransaction,
  onBulkDelete
}: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Dialog states
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [bulkDeleteType, setBulkDeleteType] = useState<'week' | 'month'>('week');

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = Array.from(
  new Set((transactions ?? []).map((t: any) => t.category))
).filter(Boolean).sort();
    return cats;
  }, [transactions]);

  // Calculate running totals and percentages
  const transactionsWithCalculations = useMemo(() => {
    const sortedTransactions = [...transactions].sort((a, b) => a.date.getTime() - b.date.getTime());
    
    let runningDebitTotal = 0;
    
    return sortedTransactions.map((transaction, index) => {
      if (transaction.type === 'debit') {
        runningDebitTotal += transaction.amount;
      }
      
      const baseAmount = monthlyIncome > 0 ? monthlyIncome : (budgetLimit > 0 ? budgetLimit : 50000);
      const currentAmountLeft = Math.max(0, baseAmount - runningDebitTotal);
      const percentageSpent = baseAmount > 0 ? (runningDebitTotal / baseAmount) * 100 : 0;
      
      return {
        ...transaction,
        serialNumber: index + 1,
        runningDebitTotal,
        currentAmountLeft,
        percentageSpent: Math.min(percentageSpent, 100)
      };
    });
  }, [transactions, monthlyIncome, budgetLimit]);

  // Filter and search transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactionsWithCalculations;

    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.mood && t.mood.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.type === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(t => t.category === filterCategory);
    }

    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = a.date.getTime();
        bValue = b.date.getTime();
      } else if (sortField === 'amount') {
        aValue = a.amount;
        bValue = b.amount;
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [transactionsWithCalculations, searchTerm, filterType, filterCategory, sortField, sortOrder]);

  // Calculate bulk delete candidates
  const getBulkDeleteCandidates = (type: 'week' | 'month') => {
    const now = new Date();
    let startDate = new Date();
    
    if (type === 'week') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
      startDate.setHours(0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const endDate = type === 'week' 
      ? new Date(startDate.getTime() + (6 * 24 * 60 * 60 * 1000))
      : new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const candidates = transactions.filter(t => 
      t.date >= startDate && t.date <= endDate
    );
    
    const dateRange = type === 'week'
      ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
      : `${startDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    
    return { candidates, dateRange, startDate, endDate };
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
    setShowEditDialog(true);
  };

  const handleEditSave = (updatedTransaction: Transaction) => {
    if (onUpdateTransaction) {
      onUpdateTransaction(updatedTransaction);
    }
    setShowEditDialog(false);
    setEditTransaction(null);
  };

  const handleDelete = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete && onDeleteTransaction) {
      onDeleteTransaction(transactionToDelete);
      toast.success('Transaction deleted successfully!');
    }
    setShowDeleteConfirm(false);
    setTransactionToDelete(null);
  };

  const handleBulkDelete = (type: 'week' | 'month') => {
    setBulkDeleteType(type);
    setShowBulkDeleteDialog(true);
  };

  const confirmBulkDelete = () => {
    const { candidates } = getBulkDeleteCandidates(bulkDeleteType);
    if (onBulkDelete && candidates.length > 0) {
      onBulkDelete(candidates.map(t => t.id));
      toast.success(`Successfully deleted ${candidates.length} transaction${candidates.length !== 1 ? 's' : ''}!`);
    }
  };

  const handleExport = () => {
    const csvData = [
      ['S.No', 'Transaction', 'Date', 'Amount Debit', 'Current Amount Left', '% Spent', 'Type', 'Impulse Spent', 'Mood'],
      ...filteredTransactions.map(t => [
        t.serialNumber,
        t.description,
        t.date.toLocaleDateString(),
        t.type === 'debit' ? t.amount : '',
        t.type === 'debit' ? `₹${t.currentAmountLeft.toLocaleString()}` : '',
        t.type === 'debit' ? `${t.percentageSpent.toFixed(1)}%` : '',
        t.type.charAt(0).toUpperCase() + t.type.slice(1),
        t.isImpulse ? 'Yes' : 'No',
        t.mood || 'Not tracked'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spendwise-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Transaction history exported successfully!');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getBadgeVariant = (type: string) => {
    return type === 'credit' ? 'default' : 'secondary';
  };

  const getMoodEmoji = (mood?: string) => {
    if (!mood) return '';
    const moodEmojis: Record<string, string> = {
      'happy': '😊',
      'excited': '🤩',
      'bored': '😐',
      'stressed': '😰',
      'sad': '😢',
      'anxious': '😟',
      'confident': '😎',
      'neutral': '😐'
    };
    return moodEmojis[mood.toLowerCase()] || '';
  };

  if (transactions.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Transaction History</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              You haven't recorded any transactions yet. Start tracking your expenses to see your complete transaction history here.
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

  const { candidates: weekCandidates, dateRange: weekRange } = getBulkDeleteCandidates('week');
  const { candidates: monthCandidates, dateRange: monthRange } = getBulkDeleteCandidates('month');

  return (
    <div className="space-y-6">
      {/* Header with summary stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-accent-blue/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-xl font-bold">{transactions.length}</p>
              </div>
              <History className="h-5 w-5 text-accent-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent-green/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Credits</p>
                <p className="text-xl font-bold text-accent-green">
                  {transactions.filter(t => t.type === 'credit').length}
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-accent-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-destructive/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Debits</p>
                <p className="text-xl font-bold text-destructive">
                  {transactions.filter(t => t.type === 'debit').length}
                </p>
              </div>
              <TrendingDown className="h-5 w-5 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-accent-gold/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Impulse Purchases</p>
                <p className="text-xl font-bold text-accent-gold">
                  {transactions.filter(t => t.type === 'debit' && t.isImpulse).length}
                </p>
              </div>
              <div className="text-accent-gold">⚡</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Transaction Table */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            Complete record of all your transactions with detailed analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Controls and Bulk Actions */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions, categories, or moods..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-40 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credits Only</SelectItem>
                  <SelectItem value="debit">Debits Only</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48 bg-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleExport} className="gradient-blue">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              {/* Bulk Delete Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive/10">
                    <CalendarX className="h-4 w-4 mr-2" />
                    Bulk Delete
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleBulkDelete('week')}
                    disabled={weekCandidates.length === 0}
                    className="text-destructive focus:text-destructive"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Delete This Week ({weekCandidates.length})
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleBulkDelete('month')}
                    disabled={monthCandidates.length === 0}
                    className="text-destructive focus:text-destructive"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Delete This Month ({monthCandidates.length})
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="border border-border rounded-lg overflow-hidden">
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="w-16">S.No</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50 min-w-48"
                      onClick={() => handleSort('description')}
                    >
                      <div className="flex items-center gap-1">
                        Transaction
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-1">
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-secondary/50"
                      onClick={() => handleSort('amount')}
                    >
                      <div className="flex items-center gap-1">
                        Amount Debit
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>Current Amount Left</TableHead>
                    <TableHead>% Spent</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Impulse</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead className="w-16">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">
                        {transaction.serialNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium truncate max-w-48" title={transaction.description}>
                            {transaction.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.category}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(transaction.date)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'debit' ? (
                          <span className="font-medium text-destructive">
                            ₹{transaction.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'debit' ? (
                          <span className={`font-medium ${
                            transaction.currentAmountLeft <= 0 
                              ? 'text-destructive' 
                              : transaction.currentAmountLeft < 5000 
                              ? 'text-accent-gold' 
                              : 'text-accent-green'
                          }`}>
                            ₹{transaction.currentAmountLeft.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'debit' ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-medium ${
                              transaction.percentageSpent >= 100 
                                ? 'text-destructive' 
                                : transaction.percentageSpent >= 80 
                                ? 'text-accent-gold' 
                                : 'text-accent-green'
                            }`}>
                              {transaction.percentageSpent.toFixed(1)}%
                            </span>
                            <div className="w-12 h-1.5 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all ${
                                  transaction.percentageSpent >= 100 
                                    ? 'bg-destructive' 
                                    : transaction.percentageSpent >= 80 
                                    ? 'bg-accent-gold' 
                                    : 'bg-accent-green'
                                }`}
                                style={{ 
                                  width: `${Math.min(transaction.percentageSpent, 100)}%` 
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(transaction.type)}>
                          {transaction.type === 'credit' ? 'Credit' : 'Debit'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.type === 'debit' ? (
                          <Badge 
                            variant={transaction.isImpulse ? "destructive" : "outline"}
                            className="text-xs"
                          >
                            {transaction.isImpulse ? 'Yes ⚡' : 'No'}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.mood ? (
                          <div className="flex items-center gap-1">
                            <span className="text-sm">{getMoodEmoji(transaction.mood)}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {transaction.mood}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">Not tracked</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(transaction)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(transaction.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>No transactions match your current filters.</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterCategory('all');
                }}
                className="mt-2"
              >
                Clear all filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <EditTransactionDialog
        transaction={editTransaction}
        isOpen={showEditDialog}
        onClose={() => {
          setShowEditDialog(false);
          setEditTransaction(null);
        }}
        onSave={handleEditSave}
      />

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        description="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete Transaction"
        variant="destructive"
      />

      <BulkDeleteDialog
        isOpen={showBulkDeleteDialog}
        onClose={() => setShowBulkDeleteDialog(false)}
        onConfirm={confirmBulkDelete}
        deleteType={bulkDeleteType}
        transactionCount={bulkDeleteType === 'week' ? weekCandidates.length : monthCandidates.length}
        dateRange={bulkDeleteType === 'week' ? weekRange : monthRange}
      />
    </div>
  );
}