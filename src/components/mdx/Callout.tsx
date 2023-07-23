import { cva } from 'class-variance-authority';
import { cn } from 'src/styles/cn';

const alertVariants = cva('flex items-start w-full rounded-md border px-4 py-3 text-sm my-4', {
  variants: {
    variant: {
      error: 'bg-red-50 border-red-200 text-red-900 dark:bg-red-700/30 dark:border-red-200/30 dark:text-red-200',
      info: 'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-700/30 dark:border-blue-200/30 dark:text-blue-200',
      warning:
        'bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-700/30 dark:border-yellow-200/30 dark:text-yellow-200',
      success:
        'bg-green-50 border-green-200 text-green-900 dark:bg-green-700/30 dark:border-green-200/30 dark:text-green-200'
    }
  },
  defaultVariants: {
    variant: 'info'
  }
});

type Variants = 'error' | 'info' | 'warning' | 'success';
type Props = {
  tag?: Variants;
  emoji?: string;
  children: React.ReactNode;
};

const emojis: Record<Variants, string> = {
  error: '🚫',
  info: '💡',
  success: '✅',
  warning: '⚠️'
};

export const Callout = ({ tag = 'info', emoji, children }: Props) => {
  const icon = emoji !== undefined ? emoji : emojis[tag];
  return (
    <div className={cn(alertVariants({ variant: tag }))}>
      <span aria-label={tag} role="img" className="w-4 h-4 mr-2">
        {icon}
      </span>
      <div className="text-base [&>p]:!mb-0">{children}</div>
    </div>
  );
};
