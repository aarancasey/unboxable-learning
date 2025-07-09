
interface UnboxableLogoProps {
  className?: string;
}

const UnboxableLogo = ({ className = "" }: UnboxableLogoProps) => {
  return (
    <div className={`mx-auto mb-4 ${className}`}>
      <img 
        src="/lovable-uploads/c8eb7e6b-35a2-4f41-a9d7-c1dd08c9b30b.png" 
        alt="Unboxable" 
        className="h-16 mx-auto mb-2"
      />
      <p className="text-sm text-unboxable-navy font-medium">RETHINKING BUSINESS</p>
    </div>
  );
};

export default UnboxableLogo;
