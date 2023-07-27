import { ComponentProps, useRef } from 'react';

import { cn } from 'src/styles/cn';

import { CopyButton } from './CopyButton';

export const Pre = ({ children, ...props }: ComponentProps<'pre'>) => {
  const preRef = useRef<HTMLPreElement | null>(null);

  const theme: unknown = 'data-theme' in props ? props['data-theme'] : undefined;

  return (
    <div className="relative group">
      <pre ref={preRef} {...props}>
        {children}
      </pre>

      <div
        className={cn(
          'opacity-0 transition-opacity ease-in duration-200 group-hover:opacity-100 focus-within:opacity-100',
          'flex absolute right-0 top-0 m-3'
        )}
        data-theme={theme}
      >
        <CopyButton getText={() => preRef.current?.querySelector('code')?.textContent || ''} />
      </div>
    </div>
  );
};
