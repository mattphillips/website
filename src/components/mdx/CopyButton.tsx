import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';

import { useCallback, useEffect, useState, ComponentProps, ReactElement } from 'react';
import { Button } from '../Button';

export const CopyButton = ({
  getText,
  ref,
  ...props
}: {
  getText: () => string;
} & ComponentProps<'button'>): ReactElement => {
  const [isCopied, setCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const timerId = setTimeout(() => {
      setCopied(false);
    }, 2000);

    return () => {
      clearTimeout(timerId);
    };
  }, [isCopied]);

  const handleClick = useCallback<NonNullable<ComponentProps<'button'>['onClick']>>(async () => {
    setCopied(true);
    if (!navigator?.clipboard) {
      console.error('Access to clipboard rejected!');
    }
    try {
      await navigator.clipboard.writeText(getText());
    } catch {
      console.error('Failed to copy!');
    }
  }, [getText]);

  return (
    <Button tag="Button" size="icon" variant="ghost" onClick={handleClick} title="Copy code" tabIndex={0} {...props}>
      {isCopied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
    </Button>
  );
};
