import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { AlertTriangle, TrendingUp, Target, X } from 'lucide-react';

interface BudgetAlertProps {
  isOpen: boolean;
  onClose: () => void;
  alertType?: 'warning' | 'exceeded';
  category?: string;
  currentAmount?: number;
  budgetLimit?: number;
  percentage?: number;
}

export function BudgetAlert({
  isOpen,
  onClose,
  alertType = 'warning',
  category = 'Monthly Budget',
  currentAmount = 0,
  budgetLimit = 0,
  percentage = 0
}: BudgetAlertProps) {
  // Early return if no valid data
  if (!isOpen || currentAmount === 0 || budgetLimit === 0) {
    return null;
  }

  const isExceeded = alertType === 'exceeded';
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-md glass ${
        isExceeded ? 'border-destructive/20' : 'border-accent-gold/20'
      }`}>
        <DialogHeader className="text-center space-y-4">
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isExceeded ? 'bg-destructive/10' : 'bg-accent-gold/10'
          }`}>
            {isExceeded ? (
              <X className="h-8 w-8 text-destructive" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-accent-gold" />
            )}
          </div>
          <DialogTitle className={isExceeded ? 'text-destructive' : 'text-accent-gold'}>
            {isExceeded ? 'Budget Exceeded!' : 'Budget Warning!'}
          </DialogTitle>
          <DialogDescription>
            {isExceeded 
              ? `You have exceeded your ${category.toLowerCase()} limit`
              : `You're approaching your ${category.toLowerCase()} limit`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Budget Progress */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                ₹{currentAmount.toLocaleString()} / ₹{budgetLimit.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                {category}
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span className={percentage > 100 ? 'text-destructive' : 'text-foreground'}>
                  {percentage.toFixed(1)}%
                </span>
              </div>
              <Progress 
                value={Math.min(percentage, 100)} 
                className={`h-3 ${percentage > 100 ? '[&>div]:bg-destructive' : percentage > 80 ? '[&>div]:bg-accent-gold' : '[&>div]:bg-accent-green'}`}
              />
              {percentage > 100 && (
                <div className="text-xs text-destructive text-center">
                  Exceeded by ₹{(currentAmount - budgetLimit).toLocaleString()}
                </div>
              )}
            </div>
          </div>
          
          {/* Recommendations */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Recommendations
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {isExceeded ? (
                <>
                  <li>• Review your recent expenses in this category</li>
                  <li>• Consider reducing spending for the rest of the period</li>
                  <li>• Set up spending alerts for better control</li>
                </>
              ) : (
                <>
                  <li>• Monitor your remaining budget carefully</li>
                  <li>• Consider postponing non-essential purchases</li>
                  <li>• Review if any recent purchases were impulse buys</li>
                </>
              )}
            </ul>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
            <Button 
              onClick={onClose} 
              className={`flex-1 ${isExceeded ? 'bg-destructive hover:bg-destructive/90' : 'gradient-gold text-black'}`}
            >
              Got It
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}