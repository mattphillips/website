import { cva } from 'class-variance-authority';

import { cn } from 'src/styles/cn';

const containerVariants = cva(
  'flex items-start w-full rounded-md rounded-tl-none border px-4 py-3 text-sm font-medium',
  {
    variants: {
      variant: {
        error: 'bg-red-100 border-red-600 text-red-950 dark:bg-red-800/30 dark:border-red-200/30 dark:text-red-200',
        info: 'bg-blue-100 border-blue-600 text-blue-950 dark:bg-blue-800/30 dark:border-blue-200/30 dark:text-blue-200',
        warning:
          'bg-yellow-100 border-yellow-600 text-yellow-950 dark:bg-yellow-800/30 dark:border-yellow-200/30 dark:text-yellow-200',
        success:
          'bg-green-100 border-green-600 text-green-950 dark:bg-green-800/30 dark:border-green-200/30 dark:text-green-200'
      }
    },
    defaultVariants: {
      variant: 'info'
    }
  }
);

const titleVariants = cva('w-fit px-3 py-1 rounded-t-md border border-b-0 font-semibold text-sm', {
  variants: {
    variant: {
      error: 'bg-red-400/60 border-red-600 text-red-950 dark:bg-red-500/30 dark:border-red-200/30 dark:text-red-50',
      info: 'bg-blue-400/60 border-blue-600 text-blue-950 dark:bg-blue-500/30 dark:border-blue-200/30 dark:text-blue-50',
      warning:
        'bg-yellow-400/60 border-yellow-600 text-yellow-950 dark:bg-yellow-500/30 dark:border-yellow-200/30 dark:text-yellow-50',
      success:
        'bg-green-400/60 border-green-600 text-green-950 dark:bg-green-500/30 dark:border-green-200/30 dark:text-green-50'
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
  title?: string;
  children: React.ReactNode;
  spacing?: boolean;
};

const emojis: Record<Variants, string> = {
  error: '🚫',
  info: '💡',
  success: '✅',
  warning: '⚠️'
};

export const Callout = ({ tag = 'info', emoji, title, children, spacing = true }: Props) => {
  const icon = emoji !== undefined ? emoji : emojis[tag];
  return (
    <div className={cn('relative', { 'mb-8': spacing })}>
      <div className={cn(titleVariants({ variant: tag }))}>
        <span aria-label={tag} role="img" className="w-4 h-4">
          {icon}
        </span>
        {title && <span className="ml-2">{title}</span>}
      </div>
      <div className={cn(containerVariants({ variant: tag }))}>
        <div className="text-base [&>p:last-child]:!mb-0 [&>p]:!mb-4">{children}</div>
      </div>
    </div>
  );
};
