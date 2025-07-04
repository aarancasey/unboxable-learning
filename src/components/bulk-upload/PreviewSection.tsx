import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { ParsedUser } from './types';

interface PreviewSectionProps {
  parsedUsers: ParsedUser[];
  onImport: () => void;
  onUploadDifferent: () => void;
  onCancel: () => void;
}

export const PreviewSection = ({ parsedUsers, onImport, onUploadDifferent, onCancel }: PreviewSectionProps) => {
  const validCount = parsedUsers.filter(user => user.isValid).length;
  const invalidCount = parsedUsers.length - validCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            {validCount} Valid
          </Badge>
          {invalidCount > 0 && (
            <Badge variant="destructive">
              <XCircle className="h-3 w-3 mr-1" />
              {invalidCount} Invalid
            </Badge>
          )}
        </div>
        <Button variant="outline" onClick={onUploadDifferent}>
          Upload Different File
        </Button>
      </div>

      {invalidCount > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {invalidCount} users have validation errors and will be skipped during import.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Row</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {parsedUsers.map((user, index) => (
                <TableRow key={index} className={!user.isValid ? 'bg-red-50' : ''}>
                  <TableCell>{user.rowNumber}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isValid ? (
                      <Badge variant="default">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Valid
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        <Badge variant="destructive">
                          <XCircle className="h-3 w-3 mr-1" />
                          Invalid
                        </Badge>
                        <div className="text-xs text-red-600">
                          {user.errors.join(', ')}
                        </div>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={onImport}
          disabled={validCount === 0}
        >
          Import {validCount} Users
        </Button>
      </div>
    </div>
  );
};