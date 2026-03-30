'use client';

interface StepButtonProps {
  active: boolean;
  isCurrentStep: boolean;
  stepIndex: number;
  onToggle: () => void;
}

export default function StepButton({ active, isCurrentStep, stepIndex, onToggle }: StepButtonProps) {
  const isGroupStart = stepIndex % 4 === 0;

  return (
    <button
      onClick={onToggle}
      aria-label={`스텝 ${stepIndex + 1} ${active ? '비활성화' : '활성화'}`}
      className={`h-8 w-8 rounded-sm border transition-all ${
        isGroupStart ? 'ml-1.5' : 'ml-0.5'
      } ${
        active
          ? isCurrentStep
            ? 'border-yellow-400 bg-yellow-400 shadow-md shadow-yellow-400/50'
            : 'border-blue-500 bg-blue-500'
          : isCurrentStep
            ? 'border-zinc-400 bg-zinc-300 dark:border-zinc-500 dark:bg-zinc-600'
            : 'border-zinc-300 bg-zinc-100 hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800 dark:hover:bg-zinc-700'
      }`}
    />
  );
}
