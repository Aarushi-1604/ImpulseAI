import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { UploadArea } from './components/UploadArea';
import { FileList, UploadedFile } from './components/FileList';
import { 
  Transaction, 
  processFileContent, 
  isFileTypeSupported 
} from './utils/fileProcessing';

interface FileUploadProps {
  onTransactionsProcessed?: (transactions: Transaction[]) => void;
}

export function FileUpload({ onTransactionsProcessed }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  };

  const processFiles = async (files: File[]) => {
    const validFiles = files.filter(isFileTypeSupported);

    if (validFiles.length !== files.length) {
      toast.error('Some files are not supported. Please upload CSV, Excel, PDF, or text files.');
    }

    for (const file of validFiles) {
      const fileId = `${Date.now()}-${Math.random()}`;
      
      const newFile: UploadedFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        status: 'processing',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, newFile]);

      try {
        // Simulate processing with progress updates
        const progressInterval = setInterval(() => {
          setUploadedFiles(prev => prev.map(f => 
            f.id === fileId 
              ? { ...f, progress: Math.min(f.progress + Math.random() * 20, 90) }
              : f
          ));
        }, 200);

        const transactions = await processFileContent(file);
        clearInterval(progressInterval);

        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'completed', 
                progress: 100, 
                transactionCount: transactions.length 
              }
            : f
        ));

        if (onTransactionsProcessed) {
          onTransactionsProcessed(transactions);
        }

        toast.success(`Successfully processed ${transactions.length} transactions from ${file.name}`);

      } catch (error) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === fileId 
            ? { 
                ...f, 
                status: 'error', 
                progress: 0, 
                error: error instanceof Error ? error.message : 'Processing failed' 
              }
            : f
        ));

        toast.error(`Failed to process ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <div className="space-y-6">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Bank Statements
          </CardTitle>
          <CardDescription>
            Upload CSV, Excel, PDF, or text files containing your transaction data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadArea
            dragActive={dragActive}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onFileSelect={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onFileInput={handleFileInput}
          />
        </CardContent>
      </Card>

      <FileList files={uploadedFiles} onRemoveFile={removeFile} />
    </div>
  );
}