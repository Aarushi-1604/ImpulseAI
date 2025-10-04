import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AlertTriangle, Trash2, X, Calendar } from 'lucide-react';

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleteType: 'week' | 'month';
  transactionCount: number;
  dateRange: string;
}

export function BulkDeleteDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  deleteType, 
  transactionCount,
  dateRange 
}: BulkDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete {deleteType === 'week' ? 'Week' : 'Month'} Records
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. All selected transactions will be permanently removed.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-destructive" />
              <div>
                <h4 className="font-medium text-destructive">
                  Delete {deleteType === 'week' ? 'Weekly' : 'Monthly'} Transactions
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Date Range: {dateRange}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <span className="font-medium">Transactions to be deleted:</span>
            <Badge variant="destructive" className="text-sm">
              {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="p-3 bg-accent-gold/10 border border-accent-gold/20 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Warning:</strong> This will permanently remove all transactions from the selected {deleteType}. 
              Your analytics and insights will be updated accordingly. Consider exporting your data before proceeding.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={transactionCount === 0}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {transactionCount} Transaction{transactionCount !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}