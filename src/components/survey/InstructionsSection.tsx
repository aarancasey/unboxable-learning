interface InstructionsSectionProps {
  content: string;
}

export const InstructionsSection = ({ content }: InstructionsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <div className="whitespace-pre-line text-muted-foreground text-base leading-relaxed font-light line-clamp-4">
          {content}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <div className="flex-shrink-0 w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-1 text-sm">Before You Begin</h4>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Please provide honest responses that reflect your current leadership approach.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};