import React from 'react';

import { config } from 'src/config';
import { cn } from 'src/styles/cn';

import { Button } from './Button';
import { Github, LinkedIn, Twitter } from './icons';

const links = [
  { href: config.urls.external.social.twitter, title: 'Twitter', icon: <Twitter /> },
  { href: config.urls.external.social.github, title: 'Github', icon: <Github /> },
  { href: config.urls.external.social.linkedIn, title: 'LinkedIn', icon: <LinkedIn /> }
];

export const SocialLinks: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex flex-row items-center space-x-2', className)}>
    {links.map(({ href, icon, title }) => (
      <Button size="grow" variant="ghost" tag="ExternalLink" href={href} key={title}>
        {icon}
        <span className="sr-only">{title}</span>
      </Button>
    ))}
  </div>
);
