'use client';

import { useMDXComponent } from 'next-contentlayer/hooks';

import { Anchor } from './Anchor';
import { Callout } from './Callout';
import { Pre } from './Pre';

type Props = { code: string };

const components = {
  pre: Pre,
  Callout: Callout,
  a: Anchor
};

export const MDX = ({ code }: Props) => {
  const Component = useMDXComponent(code);

  return <Component components={components} />;
};
