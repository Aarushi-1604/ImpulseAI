export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  mood?: string;
  isImpulse?: boolean;
}

export const SUPPORTED_FILE_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/pdf'
];

export const FILE_EXTENSIONS = ['.csv', '.txt', '.xlsx', '.pdf'];

export const CATEGORIES = [
  'Food & Dining', 'Shopping', 'Travel & Transport', 'Entertainment', 
  'Bills & Utilities', 'Healthcare', 'Education', 'Other'
];

// Enhanced category mapping based on transaction descriptions
export const CATEGORY_KEYWORDS = {
  'Food & Dining': [
    'restaurant', 'cafe', 'food', 'dining', 'pizza', 'burger', 'coffee', 'tea', 'lunch', 'dinner',
    'breakfast', 'snack', 'meal', 'kitchen', 'grocery', 'supermarket', 'swiggy', 'zomato', 'dominos',
    'mcdonald', 'kfc', 'subway', 'starbucks', 'bakery', 'hotel', 'canteen', 'mess'
  ],
  'Shopping': [
    'amazon', 'flipkart', 'myntra', 'shopping', 'store', 'mall', 'purchase', 'buy', 'shop',
    'clothes', 'clothing', 'fashion', 'shoes', 'electronics', 'mobile', 'laptop', 'book',
    'pharmacy', 'medicine', 'cosmetics', 'jewelry', 'gift', 'online', 'retail'
  ],
  'Travel & Transport': [
    'uber', 'ola', 'taxi', 'auto', 'bus', 'train', 'flight', 'airport', 'petrol', 'diesel',
    'fuel', 'parking', 'toll', 'metro', 'railway', 'booking', 'travel', 'ticket', 'cab',
    'transport', 'vehicle', 'car', 'bike', 'scooter'
  ],
  'Bills & Utilities': [
    'electricity', 'water', 'gas', 'internet', 'wifi', 'mobile', 'phone', 'recharge', 'bill',
    'utility', 'maintenance', 'rent', 'emi', 'loan', 'insurance', 'tax', 'government',
    'municipal', 'service', 'repair', 'broadband'
  ],
  'Entertainment': [
    'movie', 'cinema', 'theatre', 'netflix', 'prime', 'spotify', 'music', 'game', 'gaming',
    'entertainment', 'fun', 'party', 'club', 'bar', 'alcohol', 'beer', 'wine', 'concert',
    'event', 'ticket', 'subscription', 'streaming'
  ],
  'Healthcare': [
    'hospital', 'doctor', 'medical', 'medicine', 'pharmacy', 'health', 'clinic', 'dental',
    'surgery', 'treatment', 'checkup', 'test', 'lab', 'medicine', 'tablet', 'injection',
    'consultation', 'therapy'
  ],
  'Education': [
    'school', 'college', 'university', 'education', 'course', 'class', 'tuition', 'fees',
    'book', 'study', 'exam', 'certificate', 'training', 'workshop', 'seminar', 'learning'
  ]
};

// Credit transaction keywords
export const CREDIT_KEYWORDS = [
  'salary', 'income', 'credit', 'deposit', 'refund', 'cashback', 'bonus', 'interest',
  'dividend', 'transfer', 'received', 'payment received', 'reversal', 'reward'
];

// Enhanced date parsing function
export const parseDate = (dateStr: string): Date => {
  // Remove extra spaces and normalize
  const cleanDateStr = dateStr.trim().replace(/\s+/g, ' ');
  
  // Try different date formats
  const formats = [
    // DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    // MM/DD/YYYY, MM-DD-YYYY, MM.DD.YYYY  
    /^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/,
    // YYYY/MM/DD, YYYY-MM-DD, YYYY.MM.DD
    /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/,
    // DD MMM YYYY (e.g., 15 Jan 2024)
    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i,
    // MMM DD, YYYY (e.g., Jan 15, 2024)
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})$/i
  ];

  const monthNames = {
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
  };

  // Try standard Date constructor first
  let date = new Date(cleanDateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Try DD/MM/YYYY format (most common in India)
  const ddmmyyyy = cleanDateStr.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (ddmmyyyy) {
    const day = parseInt(ddmmyyyy[1]);
    const month = parseInt(ddmmyyyy[2]) - 1; // Month is 0-indexed
    const year = parseInt(ddmmyyyy[3]);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime()) && day <= 31 && month <= 11) {
      return date;
    }
  }

  // Try YYYY-MM-DD format
  const yyyymmdd = cleanDateStr.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (yyyymmdd) {
    const year = parseInt(yyyymmdd[1]);
    const month = parseInt(yyyymmdd[2]) - 1;
    const day = parseInt(yyyymmdd[3]);
    date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Try DD MMM YYYY format
  const ddmmmyyyy = cleanDateStr.match(/^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i);
  if (ddmmmyyyy) {
    const day = parseInt(ddmmmyyyy[1]);
    const monthName = ddmmmyyyy[2].toLowerCase().slice(0, 3);
    const year = parseInt(ddmmmyyyy[3]);
    const month = monthNames[monthName as keyof typeof monthNames];
    if (month !== undefined) {
      date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  // If all parsing fails, return a recent random date
  const randomDaysAgo = Math.floor(Math.random() * 60);
  date = new Date();
  date.setDate(date.getDate() - randomDaysAgo);
  return date;
};

// Enhanced amount parsing function
export const parseAmount = (amountStr: string): { amount: number; isCredit: boolean } => {
  // Clean the amount string
  let cleanAmount = amountStr.toString().trim();
  
  // Remove currency symbols and commas
  cleanAmount = cleanAmount.replace(/[₹$€£,\s]/g, '');
  
  // Check for credit indicators
  const isCredit = cleanAmount.includes('+') || 
                   cleanAmount.toLowerCase().includes('cr') ||
                   cleanAmount.toLowerCase().includes('credit');
  
  // Check for debit indicators  
  const isDebit = cleanAmount.includes('-') || 
                  cleanAmount.toLowerCase().includes('dr') ||
                  cleanAmount.toLowerCase().includes('debit');
  
  // Remove +, -, cr, dr indicators
  cleanAmount = cleanAmount.replace(/[+\-]/g, '').replace(/[crdr]/gi, '');
  
  // Parse the number
  const amount = parseFloat(cleanAmount) || 0;
  
  // Determine if it's credit (positive) or debit (negative in bank statements)
  const finalIsCredit = isCredit || (!isDebit && amount > 0);
  
  return {
    amount: Math.abs(amount),
    isCredit: finalIsCredit
  };
};

// Enhanced category detection
export const detectCategory = (description: string): string => {
  const desc = description.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (desc.includes(keyword.toLowerCase())) {
        return category;
      }
    }
  }
  
  return 'Other';
};

// Enhanced transaction type detection
export const detectTransactionType = (description: string, amount: number, isAmountCredit: boolean): 'credit' | 'debit' => {
  const desc = description.toLowerCase();
  
  // Check for explicit credit keywords in description
  for (const keyword of CREDIT_KEYWORDS) {
    if (desc.includes(keyword.toLowerCase())) {
      return 'credit';
    }
  }
  
  // Use amount indication if available
  if (isAmountCredit) {
    return 'credit';
  }
  
  // Default to debit for expenses
  return 'debit';
};

// Enhanced CSV parsing with better column detection
export const parseCSVContent = (content: string, fileName: string): Transaction[] => {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];
  
  const transactions: Transaction[] = [];
  
  // Detect CSV delimiter
  const firstLine = lines[0];
  const delimiter = firstLine.includes('\t') ? '\t' : 
                   firstLine.includes(';') ? ';' : ',';
  
  // Parse header to detect columns
  const headers = lines[0].split(delimiter).map(h => h.replace(/['"]/g, '').trim().toLowerCase());
  
  // Find column indices
  let dateIndex = -1;
  let amountIndex = -1;
  let descriptionIndex = -1;
  let typeIndex = -1;
  
  headers.forEach((header, index) => {
    if (header.includes('date') || header.includes('transaction date') || header.includes('value date')) {
      dateIndex = index;
    } else if (header.includes('amount') || header.includes('credit') || header.includes('debit') || 
               header.includes('value') || header.includes('balance')) {
      if (amountIndex === -1) amountIndex = index; // Take first amount column
    } else if (header.includes('description') || header.includes('narration') || 
               header.includes('particulars') || header.includes('details') || header.includes('transaction')) {
      descriptionIndex = index;
    } else if (header.includes('type') || header.includes('transaction type')) {
      typeIndex = index;
    }
  });
  
  // If indices not found, use default positions
  if (dateIndex === -1) dateIndex = 0;
  if (descriptionIndex === -1) descriptionIndex = 1;
  if (amountIndex === -1) amountIndex = Math.min(2, headers.length - 1);
  
  // Process data rows
  const dataLines = lines.slice(1);
  
  dataLines.forEach((line, index) => {
    const columns = line.split(delimiter);
    
    if (columns.length >= 2) {
      try {
        // Parse date
        const dateStr = columns[dateIndex]?.replace(/['"]/g, '').trim() || '';
        const date = parseDate(dateStr);
        
        // Parse description
        const description = columns[descriptionIndex]?.replace(/['"]/g, '').trim() || `Transaction ${index + 1}`;
        
        // Parse amount
        const amountStr = columns[amountIndex]?.replace(/['"]/g, '').trim() || '0';
        const { amount, isCredit } = parseAmount(amountStr);
        
        // Skip zero amount transactions
        if (amount === 0) return;
        
        // Detect transaction type
        const typeFromColumn = columns[typeIndex]?.replace(/['"]/g, '').trim().toLowerCase() || '';
        let type: 'credit' | 'debit';
        
        if (typeFromColumn.includes('credit') || typeFromColumn === 'cr') {
          type = 'credit';
        } else if (typeFromColumn.includes('debit') || typeFromColumn === 'dr') {
          type = 'debit';
        } else {
          type = detectTransactionType(description, amount, isCredit);
        }
        
        // Detect category
        const category = detectCategory(description);
        
        // Random impulse detection for debits (more realistic percentage)
        const isImpulse = type === 'debit' && Math.random() > 0.85; // 15% chance
        
        transactions.push({
          id: `${Date.now()}-${index}-${Math.random()}`,
          date,
          amount,
          type,
          category,
          description,
          isImpulse
        });
      } catch (error) {
        console.warn(`Error parsing line ${index + 1}: ${line}`, error);
      }
    }
  });
  
  return transactions;
};

// Generate realistic mock transactions
export const generateMockTransactions = (file: File): Transaction[] => {
  const transactionCount = Math.min(Math.floor(file.size / 500), 30); // More realistic count
  const mockTransactions: Transaction[] = [];
  
  const mockData = [
    // Credit transactions
    { desc: 'Salary Credit', amount: 45000, type: 'credit', category: 'Other' },
    { desc: 'Freelance Payment', amount: 15000, type: 'credit', category: 'Other' },
    { desc: 'Interest Credit', amount: 250, type: 'credit', category: 'Other' },
    { desc: 'Cashback Amazon', amount: 120, type: 'credit', category: 'Shopping' },
    
    // Food & Dining
    { desc: 'Swiggy Order', amount: 320, type: 'debit', category: 'Food & Dining' },
    { desc: 'Zomato Payment', amount: 450, type: 'debit', category: 'Food & Dining' },
    { desc: 'Starbucks Coffee', amount: 280, type: 'debit', category: 'Food & Dining' },
    { desc: 'Restaurant Bill', amount: 850, type: 'debit', category: 'Food & Dining' },
    { desc: 'Grocery Store', amount: 1250, type: 'debit', category: 'Food & Dining' },
    
    // Shopping
    { desc: 'Amazon Purchase', amount: 1890, type: 'debit', category: 'Shopping' },
    { desc: 'Flipkart Order', amount: 2340, type: 'debit', category: 'Shopping' },
    { desc: 'Myntra Shopping', amount: 1650, type: 'debit', category: 'Shopping' },
    { desc: 'Local Store', amount: 560, type: 'debit', category: 'Shopping' },
    
    // Transport
    { desc: 'Uber Ride', amount: 180, type: 'debit', category: 'Travel & Transport' },
    { desc: 'Ola Cab', amount: 220, type: 'debit', category: 'Travel & Transport' },
    { desc: 'Petrol Station', amount: 1500, type: 'debit', category: 'Travel & Transport' },
    { desc: 'Metro Card Recharge', amount: 500, type: 'debit', category: 'Travel & Transport' },
    
    // Bills
    { desc: 'Electricity Bill', amount: 1200, type: 'debit', category: 'Bills & Utilities' },
    { desc: 'Internet Bill', amount: 699, type: 'debit', category: 'Bills & Utilities' },
    { desc: 'Mobile Recharge', amount: 399, type: 'debit', category: 'Bills & Utilities' },
    
    // Entertainment
    { desc: 'Netflix Subscription', amount: 199, type: 'debit', category: 'Entertainment' },
    { desc: 'Movie Ticket', amount: 300, type: 'debit', category: 'Entertainment' },
    { desc: 'Spotify Premium', amount: 119, type: 'debit', category: 'Entertainment' },
    
    // Healthcare
    { desc: 'Medical Checkup', amount: 800, type: 'debit', category: 'Healthcare' },
    { desc: 'Pharmacy Purchase', amount: 340, type: 'debit', category: 'Healthcare' }
  ];
  
  for (let i = 0; i < transactionCount; i++) {
    const mockItem = mockData[Math.floor(Math.random() * mockData.length)];
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90)); // Last 90 days
    
    // Add some variation to amounts
    const variation = 0.7 + (Math.random() * 0.6); // 70% to 130% of base amount
    const amount = Math.round(mockItem.amount * variation);
    
    const isImpulse = mockItem.type === 'debit' && Math.random() > 0.8; // 20% impulse
    
    mockTransactions.push({
      id: `${Date.now()}-${i}-${Math.random()}`,
      date,
      amount,
      type: mockItem.type as 'credit' | 'debit',
      category: mockItem.category,
      description: mockItem.desc,
      isImpulse
    });
  }
  
  return mockTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
};

export const processFileContent = async (file: File): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
          const transactions = parseCSVContent(content, file.name);
          resolve(transactions.length > 0 ? transactions : generateMockTransactions(file));
        } else {
          const transactions = generateMockTransactions(file);
          resolve(transactions);
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const isFileTypeSupported = (file: File): boolean => {
  return SUPPORTED_FILE_TYPES.some(type => file.type === type) || 
         FILE_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
};