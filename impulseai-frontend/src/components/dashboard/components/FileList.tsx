import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { CheckCircle, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import { formatFileSize } from '../utils/fileProcessing';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'processing' | 'completed' | 'error';
  progress: number;
  transactionCount?: number;
  error?: string;
}

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (fileId: string) => void;
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Uploaded Files</CardTitle>
        <CardDescription>
          Track the processing status of your uploaded files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {files.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-10 h-10 bg-accent-blue/20 rounded-full flex items-center justify-center">
                  {file.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-accent-green" />
                  ) : file.status === 'error' ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <FileText className="h-5 w-5 text-accent-blue" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{file.name}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    
                    {file.status === 'completed' && file.transactionCount && (
                      <Badge variant="outline" className="text-xs border-accent-green/50 text-accent-green">
                        {file.transactionCount} transactions
                      </Badge>
                    )}
                    
                    {file.status === 'error' && (
                      <Badge variant="destructive" className="text-xs">
                        Failed
                      </Badge>
                    )}
                    
                    {file.status === 'processing' && (
                      <Badge variant="outline" className="text-xs border-accent-blue/50 text-accent-blue">
                        Processing...
                      </Badge>
                    )}
                  </div>

                  {file.status === 'processing' && (
                    <div className="mt-2">
                      <Progress value={file.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(file.progress)}% complete
                      </p>
                    </div>
                  )}

                  {file.status === 'error' && file.error && (
                    <p className="text-xs text-destructive mt-1">{file.error}</p>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveFile(file.id)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}