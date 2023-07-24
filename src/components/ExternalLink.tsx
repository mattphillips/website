import React from 'react';
import { ExternalRoute } from 'src/config';
import { Action } from './Action';

type ExternalLink = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'target' | 'rel' | 'href'> & {
  href: ExternalRoute;
};

export const ExternalLink: React.FC<ExternalLink> = ({ ...props }) => <Action {...props} tag="ExternalLink" />;
