import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  BarChart3, 
  RadarIcon, 
  Gauge, 
  TrendingUp,
  Eye,
  Settings,
  Palette,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface VisualizationConfiguratorProps {
  visualizations: {
    charts?: string[];
    radarChart?: { enabled: boolean; type?: string };
    strengthsChart?: { enabled: boolean; type?: string };
    purposeGauge?: { enabled: boolean; maxRating?: number };
    confidenceBar?: { enabled: boolean };
  };
  onChange: (visualizations: any) => void;
}

export const VisualizationConfigurator = ({ visualizations, onChange }: VisualizationConfiguratorProps) => {
  const { toast } = useToast();
  const [localConfig, setLocalConfig] = useState(visualizations);
  const [hasChanges, setHasChanges] = useState(false);

  // Default visualization config
  const defaultConfig = {
    charts: ['radar', 'strengths', 'purpose', 'confidence'],
    radarChart: { enabled: true, type: 'competency' },
    strengthsChart: { enabled: true, type: 'bar' },
    purposeGauge: { enabled: true, maxRating: 6 },
    confidenceBar: { enabled: true }
  };

  useEffect(() => {
    setLocalConfig({ ...defaultConfig, ...visualizations });
    setHasChanges(false);
  }, [visualizations]);

  const handleConfigChange = (section: string, updates: any) => {
    const updatedConfig = {
      ...localConfig,
      [section]: { ...localConfig[section as keyof typeof localConfig], ...updates }
    };
    setLocalConfig(updatedConfig);
    setHasChanges(true);
    onChange(updatedConfig);
  };

  const handleReset = () => {
    setLocalConfig({ ...defaultConfig, ...visualizations });
    setHasChanges(false);
    onChange({ ...defaultConfig, ...visualizations });
    toast({
      title: "Configuration Reset",
      description: "Visualization settings have been reset to default values.",
    });
  };

  const chartOptions = [
    {
      id: 'radar',
      name: 'Competency Radar',
      icon: RadarIcon,
      description: 'Shows rubric scores in a radar/spider chart format',
      config: { ...defaultConfig.radarChart, ...localConfig.radarChart },
      configKey: 'radarChart'
    },
    {
      id: 'strengths',
      name: 'Strengths Comparison',
      icon: BarChart3,
      description: 'Compares strengths vs development areas',
      config: { ...defaultConfig.strengthsChart, ...localConfig.strengthsChart },
      configKey: 'strengthsChart'
    },
    {
      id: 'purpose',
      name: 'Purpose Gauge',
      icon: Gauge,
      description: 'Circular gauge showing purpose alignment rating',
      config: { ...defaultConfig.purposeGauge, ...localConfig.purposeGauge },
      configKey: 'purposeGauge'
    },
    {
      id: 'confidence',
      name: 'Confidence Bar',
      icon: TrendingUp,
      description: 'Bar chart showing confidence level progression',
      config: { ...defaultConfig.confidenceBar, ...localConfig.confidenceBar },
      configKey: 'confidenceBar'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Data Visualizations</h3>
        <p className="text-sm text-muted-foreground">
          Configure which charts and visualizations to display in the assessment summary.
        </p>
      </div>

      {/* Chart Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {chartOptions.map((chart) => {
          const IconComponent = chart.icon;
          const isEnabled = chart.config?.enabled ?? true;
          
          return (
            <Card key={chart.id} className={isEnabled ? 'border-primary/20' : 'border-muted'}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconComponent className="h-5 w-5" />
                    {chart.name}
                    {isEnabled && <Badge variant="default" className="text-xs">Enabled</Badge>}
                  </CardTitle>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(enabled) => 
                      handleConfigChange(chart.configKey, { enabled })
                    }
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {chart.description}
                </p>
              </CardHeader>
              
              {isEnabled && (
                <CardContent className="space-y-4 border-t bg-muted/20">
                  {/* Radar Chart Configuration */}
                  {chart.id === 'radar' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Chart Type</Label>
                        <Select
                          value={(chart.config as any)?.type || 'competency'}
                          onValueChange={(value) => 
                            handleConfigChange(chart.configKey, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="competency">Competency Analysis</SelectItem>
                            <SelectItem value="skills">Skills Assessment</SelectItem>
                            <SelectItem value="leadership">Leadership Dimensions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Strengths Chart Configuration */}
                  {chart.id === 'strengths' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Chart Style</Label>
                        <Select
                          value={(chart.config as any)?.type || 'bar'}
                          onValueChange={(value) => 
                            handleConfigChange(chart.configKey, { type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Horizontal Bar Chart</SelectItem>
                            <SelectItem value="column">Vertical Column Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  {/* Purpose Gauge Configuration */}
                  {chart.id === 'purpose' && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Maximum Rating Scale</Label>
                        <div className="flex items-center gap-4">
                          <Slider
                            value={[(chart.config as any)?.maxRating || 6]}
                            onValueChange={(value) => 
                              handleConfigChange(chart.configKey, { maxRating: value[0] })
                            }
                            min={3}
                            max={10}
                            step={1}
                            className="flex-1"
                          />
                          <Badge variant="outline">
                            {(chart.config as any)?.maxRating || 6}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Scale from 1 to {(chart.config as any)?.maxRating || 6}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Chart Layout Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Layout Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Chart Size</Label>
              <Select defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (300px height)</SelectItem>
                  <SelectItem value="medium">Medium (400px height)</SelectItem>
                  <SelectItem value="large">Large (500px height)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chart Position</Label>
              <Select defaultValue="integrated">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="integrated">Integrated with Content</SelectItem>
                  <SelectItem value="separate">Separate Section</SelectItem>
                  <SelectItem value="appendix">Appendix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Color Theme Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Theme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { name: 'Professional', colors: ['#1f2937', '#3b82f6', '#10b981'] },
              { name: 'Vibrant', colors: ['#7c3aed', '#f59e0b', '#ef4444'] },
              { name: 'Minimal', colors: ['#6b7280', '#9ca3af', '#d1d5db'] },
              { name: 'Warm', colors: ['#dc2626', '#ea580c', '#ca8a04'] }
            ].map((theme) => (
              <Button
                key={theme.name}
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto p-3"
              >
                <div className="flex gap-1">
                  {theme.colors.map((color, index) => (
                    <div
                      key={index}
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <span className="text-xs">{theme.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button 
          variant="outline" 
          onClick={handleReset}
          disabled={!hasChanges}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
        
        {hasChanges && (
          <Badge variant="default" className="px-3 py-1">
            Configuration updated
          </Badge>
        )}
      </div>

      {/* Preview Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-blue-900">
                Visualization Preview
              </h4>
              <p className="text-sm text-blue-700">
                Switch to the Preview tab to see how your selected visualizations will appear 
                in the final assessment report. Charts are automatically generated based on 
                the rubric scores and assessment data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};