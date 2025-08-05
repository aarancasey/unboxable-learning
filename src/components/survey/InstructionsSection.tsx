interface InstructionsSectionProps {
  content: string;
}

export const InstructionsSection = ({ content }: InstructionsSectionProps) => {
  return (
    <div className="space-y-6">
      <div className="prose prose-lg max-w-none">
        <div className="whitespace-pre-line text-muted-foreground text-lg leading-relaxed font-light">
          {content}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 rounded-xl p-6 mt-8">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-2">Before You Begin</h4>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please read through all instructions carefully. Take your time with each question and provide honest, 
              thoughtful responses that reflect your current leadership approach and experiences.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};