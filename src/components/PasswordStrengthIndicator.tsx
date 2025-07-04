import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: "At least 8 characters long",
    test: (password) => password.length >= 8
  },
  {
    label: "At least 1 uppercase letter",
    test: (password) => /[A-Z]/.test(password)
  },
  {
    label: "At least 1 number",
    test: (password) => /[0-9]/.test(password)
  }
];

const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const metRequirements = passwordRequirements.filter(req => req.test(password));
  const strengthPercentage = (metRequirements.length / passwordRequirements.length) * 100;
  
  const getStrengthLabel = () => {
    if (strengthPercentage === 0) return "Very Weak";
    if (strengthPercentage < 50) return "Weak";
    if (strengthPercentage < 100) return "Good";
    return "Strong";
  };

  const getStrengthColor = () => {
    if (strengthPercentage === 0) return "bg-red-500";
    if (strengthPercentage < 50) return "bg-orange-500";
    if (strengthPercentage < 100) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Password Strength</span>
          <span className={`font-medium ${
            strengthPercentage === 0 ? "text-red-600" :
            strengthPercentage < 50 ? "text-orange-600" :
            strengthPercentage < 100 ? "text-yellow-600" :
            "text-green-600"
          }`}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${strengthPercentage}%` }}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
        <ul className="space-y-1">
          {passwordRequirements.map((requirement, index) => {
            const isMet = requirement.test(password);
            return (
              <li key={index} className="flex items-center space-x-2 text-sm">
                {isMet ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-gray-400" />
                )}
                <span className={isMet ? "text-green-700" : "text-gray-600"}>
                  {requirement.label}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;