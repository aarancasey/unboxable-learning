
import { CheckCircle, AlertCircle } from 'lucide-react';

interface StrengthsComparisonChartProps {
  strengths: string[];
  developmentAreas: string[];
}

export const StrengthsComparisonChart = ({ strengths, developmentAreas }: StrengthsComparisonChartProps) => {
  // If no data, return empty state
  if (!strengths.length && !developmentAreas.length) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">No strengths or development areas data available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Strengths Section */}
      {strengths.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <h4 className="font-semibold text-green-700">Strengths ({strengths.length})</h4>
          </div>
          <div className="grid gap-2">
            {strengths.map((strength, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-green-800 leading-relaxed">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Development Areas Section */}
      {developmentAreas.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <h4 className="font-semibold text-orange-700">Development Areas ({developmentAreas.length})</h4>
          </div>
          <div className="grid gap-2">
            {developmentAreas.map((area, index) => (
              <div 
                key={index}
                className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-sm text-orange-800 leading-relaxed">{area}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex justify-between items-center pt-4 border-t border-border">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{strengths.length}</div>
          <div className="text-xs text-muted-foreground">Strengths</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{developmentAreas.length}</div>
          <div className="text-xs text-muted-foreground">Development Areas</div>
        </div>
      </div>
    </div>
  );
};
