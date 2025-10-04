import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Switch } from '../ui/switch';
import { CalendarIcon, Save, X, Info } from 'lucide-react';
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

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
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

export function EditTransactionDialog({ transaction, isOpen, onClose, onSave }: EditTransactionDialogProps) {
  const [editedTransaction, setEditedTransaction] = useState<Transaction | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Initialize form data when transaction changes
  useEffect(() => {
    if (transaction) {
      setEditedTransaction({ ...transaction });
    }
  }, [transaction]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSave = () => {
    if (!editedTransaction) return;

    // Validation
    if (!editedTransaction.amount || editedTransaction.amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!editedTransaction.category) {
      toast.error('Please select a category');
      return;
    }

    if (!editedTransaction.description.trim()) {
      toast.error('Please enter a description');
      return;
    }

    onSave(editedTransaction);
    toast.success('Transaction updated successfully!');
    onClose();
  };

  const handleClose = () => {
    setEditedTransaction(null);
    setCalendarOpen(false);
    onClose();
  };

  if (!editedTransaction) return null;

  const isCredit = editedTransaction.type === 'credit';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-accent-blue" />
            Edit Transaction
          </DialogTitle>
          <DialogDescription>
            Make changes to your transaction details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
                    {editedTransaction.date ? formatDate(editedTransaction.date) : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editedTransaction.date}
                    onSelect={(date) => {
                      setEditedTransaction(prev => prev ? { ...prev, date: date || new Date() } : null);
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
                value={editedTransaction.amount || ''}
                onChange={(e) => setEditedTransaction(prev => prev ? { 
                  ...prev, 
                  amount: parseFloat(e.target.value) || 0 
                } : null)}
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
                    onCheckedChange={(checked) => {
                      const newType = checked ? 'credit' : 'debit';
                      setEditedTransaction(prev => prev ? { 
                        ...prev, 
                        type: newType,
                        isImpulse: newType === 'credit' ? false : prev.isImpulse
                      } : null);
                    }}
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
                value={editedTransaction.category}
                onValueChange={(value) => setEditedTransaction(prev => prev ? { ...prev, category: value } : null)}
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
              placeholder="Enter transaction description"
              value={editedTransaction.description}
              onChange={(e) => setEditedTransaction(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="bg-input"
              maxLength={200}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Mood (Optional)</Label>
              <Select
                value={editedTransaction.mood || ''}
                onValueChange={(value) => setEditedTransaction(prev => prev ? { ...prev, mood: value || undefined } : null)}
              >
                <SelectTrigger className="bg-input">
                  <SelectValue placeholder="How were you feeling?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
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
                  checked={editedTransaction.isImpulse && !isCredit}
                  onCheckedChange={(checked) => 
                    setEditedTransaction(prev => prev ? { 
                      ...prev, 
                      isImpulse: isCredit ? false : checked 
                    } : null)
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
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            className="gradient-blue"
            disabled={!editedTransaction.amount || !editedTransaction.category || !editedTransaction.description.trim()}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}