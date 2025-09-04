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
  email: string;
  role: string;
  department: string;
  employmentLength: string;
}

export const ParticipantInfoForm = ({ onComplete, learnerData }: ParticipantInfoProps) => {
  const [formData, setFormData] = useState<ParticipantInfo>({
    fullName: learnerData?.name || '',
    email: learnerData?.email || '',
    role: '',
    department: '',
    employmentLength: ''
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
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.role.trim()) newErrors.role = 'Role is required';
    if (!formData.department.trim()) newErrors.department = 'Department is required';
    if (!formData.employmentLength.trim()) newErrors.employmentLength = 'Employment length is required';

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
              Please enter your full name? *
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
            <Label htmlFor="email" className="text-sm font-medium text-unboxable-navy">
              What is your email address? *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`h-12 ${errors.email ? 'border-red-500' : ''}`}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role" className="text-sm font-medium text-unboxable-navy">
              What is your role at Douglas? *
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

          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium text-unboxable-navy">
              What department do you work in? *
            </Label>
            <Input
              id="department"
              type="text"
              placeholder="Enter your department"
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className={`h-12 ${errors.department ? 'border-red-500' : ''}`}
            />
            {errors.department && <p className="text-sm text-red-500">{errors.department}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employmentLength" className="text-sm font-medium text-unboxable-navy">
              How long have you worked at Douglas? *
            </Label>
            <Input
              id="employmentLength"
              type="text"
              placeholder="e.g., 2 years, 6 months"
              value={formData.employmentLength}
              onChange={(e) => handleChange('employmentLength', e.target.value)}
              className={`h-12 ${errors.employmentLength ? 'border-red-500' : ''}`}
            />
            {errors.employmentLength && <p className="text-sm text-red-500">{errors.employmentLength}</p>}
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