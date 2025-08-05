interface InstructionsSectionProps {
  content: string;
}

export const InstructionsSection = ({ content }: InstructionsSectionProps) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="space-y-6">
        <p className="text-muted-foreground text-base leading-relaxed">
          This self-assessment is designed to help you explore your current leadership sentiment and intent, 
          adaptability and agility.
        </p>
        
        <p className="text-muted-foreground text-base leading-relaxed">
          It will give insight into how you currently lead and respond to dynamic conditions, change, make 
          decisions, empower others and lead in complexity.
        </p>

        <div className="space-y-4">
          <h3 className="text-unboxable-navy font-bold text-lg">
            Why Combine Sentiment, Intent and Leadership Agility?
          </h3>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            Most leadership assessments focus only on what leaders do - behaviours, styles, or competencies. 
            But leadership isn't just behavioural. It's also deeply emotional, situational, and purpose driven.
          </p>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            By combining how leaders feel (sentiment), how they lead (adaptive agility), and why they lead 
            (intent and purpose), we'll unlock a far more complete picture of your leadership.
          </p>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            We'll ask questions about your current capabilities, motivation, mindset, and direction - the internal 
            drivers that influence how you show up, adapt, and grow over time as a leader.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-unboxable-navy font-bold text-lg">
            This three-part survey combines:
          </h3>
          
          <div className="space-y-2">
            <p className="text-muted-foreground text-base">
              • How you feel and experience leadership (Sentiment)
            </p>
            <p className="text-muted-foreground text-base">
              • What drives you and where you're headed (Purpose)
            </p>
            <p className="text-muted-foreground text-base">
              • How you show up and adapt in complexity (Agility)
            </p>
          </div>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            Together, these insights provide a richer, more complete picture of your leadership - one that's both 
            practical and personal and can be used to help shape your leadership journey.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-unboxable-navy font-bold text-lg">
            How This Helps:
          </h3>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            • At the start of the programme, this provides you an understanding of your leadership that will help 
            both within <strong>LEADForward</strong> as well as within your coaching sessions.
          </p>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            • This self-assessment survey will be repeated at the end of the <strong>LEADForward</strong> program and will help 
            show shifts in your mindset, thinking, perspectives and capabilities.
          </p>
          
          <p className="text-muted-foreground text-base leading-relaxed">
            • This self-assessment is to give you a point in time perspective, there are no right wrong answers 
            and is purely to give you a sense of where you are currently at.
          </p>
        </div>
      </div>
      
      <div className="bg-unboxable-orange rounded-lg p-6 mt-8">
        <p className="text-white text-center text-base font-medium leading-relaxed">
          Before you complete the full self-assessment, take the opportunity to complete this in a quiet 
          and calm space so that you can fully reflect.
        </p>
      </div>
    </div>
  );
};