
interface UnboxableLogoProps {
  className?: string;
}

const UnboxableLogo = ({ className = "" }: UnboxableLogoProps) => {
  return (
    <div className={`mx-auto mb-4 ${className}`}>
      <img 
        src="/lovable-uploads/d0544c04-760a-4cf9-824c-612e5ef4aeaa.png" 
        alt="Unboxable" 
        className="h-16 mx-auto mb-2"
      />
      <p className="text-sm text-unboxable-navy font-medium">RETHINKING BUSINESS</p>
    </div>
  );
};

export default UnboxableLogo;
