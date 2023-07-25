'use client';

import { useMDXComponent } from 'next-contentlayer/hooks';
import { Pre } from './Pre';
import { Callout } from './Callout';

type Props = { code: string };

const components = {
  pre: Pre,
  Callout: Callout
};

export const MDX = ({ code }: Props) => {
  const Component = useMDXComponent(code);

  return <Component components={components} />;
};
