
import { GraduationCap, Users } from 'lucide-react';

interface RoleIconProps {
  role: 'learner' | 'admin';
}

const RoleIcon = ({ role }: RoleIconProps) => {
  return role === 'learner' ? (
    <GraduationCap className="mx-auto h-12 w-12 text-unboxable-navy" />
  ) : (
    <Users className="mx-auto h-12 w-12 text-unboxable-orange" />
  );
};

export default RoleIcon;
