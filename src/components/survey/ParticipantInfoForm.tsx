import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

interface ParticipantInfoProps {
  onComplete: (data: ParticipantInfo) => void;
  learnerData?: any;
}

export interface ParticipantInfo {
  fullName: string;
  date: string;
  company: string;
  businessArea: string;
  role: string;
}

export const ParticipantInfoForm = ({ onComplete, learnerData }: ParticipantInfoProps) => {
  const [formData, setFormData] = useState<ParticipantInfo>({
    fullName: learnerData?.name || '',
    date: new Date().toISOString().split('T')[0],
    company: '',
    businessArea: '',
    role: ''
  });

  const [errors, setErrors] = useState<Partial<ParticipantInfo>>({});

  const handleChange = (field: keyof ParticipantInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<ParticipantInfo> = {};
    
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.businessArea.trim()) newErrors.businessArea = 'Business area is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onComplete(formData);
    }
  };

  return (
    <Card className="survey-card-shadow border-0 survey-fade-in">
      <CardHeader className="pb-6">
        <CardTitle className="text-2xl font-semibold text-unboxable-navy">
          Participant Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 px-8 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-unboxable-navy">
              Full Name *
            </Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className={`h-12 ${errors.fullName ? 'border-red-500' : ''}`}
            />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm font-medium text-unboxable-navy">
              Date *
            </Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className={`h-12 ${errors.date ? 'border-red-500' : ''}`}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company" className="text-sm font-medium text-unboxable-navy">
              Company *
            </Label>
            <Input
              id="company"
              type="text"
              placeholder="Enter your company name"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              className={`h-12 ${errors.company ? 'border-red-500' : ''}`}
            />
            {errors.company && <p className="text-sm text-red-500">{errors.company}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessArea" className="text-sm font-medium text-unboxable-navy">
              Business Area *
            </Label>
            <Input
              id="businessArea"
              type="text"
              placeholder="Enter your business area"
              value={formData.businessArea}
              onChange={(e) => handleChange('businessArea', e.target.value)}
              className={`h-12 ${errors.businessArea ? 'border-red-500' : ''}`}
            />
            {errors.businessArea && <p className="text-sm text-red-500">{errors.businessArea}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-unboxable-navy">
              Role *
            </Label>
            <Input
              id="role"
              type="text"
              placeholder="Enter your role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className={`h-12 ${errors.role ? 'border-red-500' : ''}`}
            />
            {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
          </div>

          <div className="pt-6">
            <Button 
              type="submit" 
              className="w-full h-12 bg-unboxable-orange hover:bg-unboxable-orange/90 text-white font-medium"
            >
              Continue to Assessment
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};