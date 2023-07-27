import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';
import { ComponentProps, ReactElement, useCallback, useEffect, useState } from 'react';

import { Button } from '../Button';

export const CopyButton = ({
  getText,
  ...props
}: {
  getText: () => string;
} & Omit.Strict<ComponentProps<'button'>, 'ref'>): ReactElement => {
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
    try {
      await navigator.clipboard.writeText(getText());
    } catch {
      // silently fail
    }
  }, [getText]);

  return (
    <Button tag="Button" size="icon" variant="ghost" onClick={handleClick} title="Copy code" tabIndex={0} {...props}>
      {isCopied ? <CheckIcon className="h-3 w-3" /> : <CopyIcon className="h-3 w-3" />}
    </Button>
  );
};
