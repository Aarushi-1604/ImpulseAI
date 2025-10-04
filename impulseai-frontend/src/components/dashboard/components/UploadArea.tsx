import React from 'react';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Upload, FileText } from 'lucide-react';

interface UploadAreaProps {
  dragActive: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function UploadArea({
  dragActive,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFileSelect,
  fileInputRef,
  onFileInput
}: UploadAreaProps) {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive
          ? 'border-accent-blue bg-accent-blue/10'
          : 'border-border hover:border-accent-blue/50'
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-medium">
            {dragActive ? 'Drop files here' : 'Drag & drop files here'}
          </h3>
          <p className="text-muted-foreground text-sm">
            or click to browse files
          </p>
        </div>

        <Button 
          onClick={onFileSelect}
          variant="outline"
          className="border-accent-blue/50"
        >
          <FileText className="mr-2 h-4 w-4" />
          Choose Files
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls,.pdf,.txt"
          onChange={onFileInput}
          className="hidden"
        />

        <div className="flex flex-wrap gap-2 justify-center">
          <Badge variant="outline" className="text-xs">CSV</Badge>
          <Badge variant="outline" className="text-xs">Excel</Badge>
          <Badge variant="outline" className="text-xs">PDF</Badge>
          <Badge variant="outline" className="text-xs">TXT</Badge>
        </div>
      </div>
    </div>
  );
}