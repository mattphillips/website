import Link from 'next/link';
import React from 'react';
import { match } from 'ts-prelude/match';

import { ExternalRoute, Route } from 'src/config';

type Button = React.ButtonHTMLAttributes<HTMLButtonElement>;

type Link = React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: Route; prefetch?: boolean };

type ExternalLink = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel'> & { href: ExternalRoute };

export type Action = (Button & { tag: 'Button' }) | (Link & { tag: 'Link' }) | (ExternalLink & { tag: 'ExternalLink' });

const Action = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, Action>((props, ref) => {
  const buttonRef: React.ForwardedRef<HTMLButtonElement> = ref as React.ForwardedRef<HTMLButtonElement>;
  const linkRef: React.ForwardedRef<HTMLAnchorElement> = ref as React.ForwardedRef<HTMLAnchorElement>;

  return match(props, {
    Button: ({ ...props }) => <button {...props} ref={buttonRef} />,
    Link: ({ href, prefetch, ...props }) => (
      <Link href={href} passHref={true} legacyBehavior ref={linkRef} prefetch={prefetch}>
        <a {...props} />
      </Link>
    ),
    ExternalLink: ({ ...props }) => <a {...props} target="_blank" rel="noopener" ref={linkRef} />
  });
});
Action.displayName = 'Action';

export { Action };
