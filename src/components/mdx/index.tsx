import { useMDXComponent } from 'next-contentlayer/hooks';
import { Pre } from './Pre';

type Props = { code: string };

const components = {
  pre: Pre
};

export const MDX = ({ code }: Props) => {
  const Component = useMDXComponent(code);

  return <Component components={components} />;
};
