import React from 'react';

import { config } from 'src/config';
import { Github, LinkedIn, Twitter } from './icons';
import { cn } from 'src/styles/cn';
import { ExternalLink } from './ExternalLink';

const links = [
  { href: config.social.twitter, title: 'Twitter', icon: <Twitter /> },
  { href: config.social.github, title: 'Github', icon: <Github /> },
  { href: config.social.linkedIn, title: 'LinkedIn', icon: <LinkedIn /> }
];

export const SocialLinks: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex flex-row justify-center', className)}>
    {links.map(({ href, icon, title }) => (
      <ExternalLink href={href} key={title}>
        <div className="p-3 transition-transform transform hover:scale-125">{icon}</div>
      </ExternalLink>
    ))}
  </div>
);
