import { Tag } from 'src/articles/Articles';
import { config } from 'src/config';
import { Button } from './Button';

type Props = {
  tag: Tag;
  count: number;
  type: 'Unselected' | 'Selected' | 'Disabled';
};

export const TagButton = ({ count, tag, type: state }: Props) => {
  if (state === 'Disabled') {
    return (
      <Button tag="Button" variant="secondary" className="uppercase" size="sm" disabled>
        {tag}
      </Button>
    );
  }

  if (state === 'Selected') {
    return (
      <Button
        tag="Link"
        href={config.routes.untag(tag)}
        variant="secondary"
        className="uppercase bg-brand/80 hover:bg-brand dark:bg-brand/40 dark:hover:bg-brand/20"
        size="sm"
      >
        {tag} <Count count={count} />
      </Button>
    );
  }

  return (
    <Button href={config.routes.tag(tag)} tag="Link" variant="secondary" className="uppercase" size="sm">
      {tag} <Count count={count} />
    </Button>
  );
};

const Count = ({ count }: { count: number }) => (count > 0 ? <span className="ml-1">({count})</span> : null);
