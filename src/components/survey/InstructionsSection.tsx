interface InstructionsSectionProps {
  content: string;
}

export const InstructionsSection = ({ content }: InstructionsSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
          {content}
        </div>
      </div>
    </div>
  );
};