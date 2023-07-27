import React from 'react';

import { config } from 'src/config';
import { cn } from 'src/styles/cn';

import { ExternalLink } from './ExternalLink';
import { Github, LinkedIn, Twitter } from './icons';

const links = [
  { href: config.urls.external.social.twitter, title: 'Twitter', icon: <Twitter /> },
  { href: config.urls.external.social.github, title: 'Github', icon: <Github /> },
  { href: config.urls.external.social.linkedIn, title: 'LinkedIn', icon: <LinkedIn /> }
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
