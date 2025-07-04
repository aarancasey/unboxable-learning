import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';

interface TopPagesCardProps {
  pages: Array<{ page: string; views: number }>;
}

export const TopPagesCard = ({ pages }: TopPagesCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-primary" />
          <span>Most Visited Pages</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-card-foreground">{page.page}</p>
                <p className="text-sm text-muted-foreground">{page.views} views</p>
              </div>
              <Badge variant="secondary">{index + 1}</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};