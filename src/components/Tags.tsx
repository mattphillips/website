import { Tag } from 'src/articles/Articles';
import { Route } from 'src/config';

import { Button } from './Button';

type Props = {
  tags: Array<{
    tag: Tag;
    count: number;
    type: 'Unselected' | 'Selected' | 'Disabled';
  }>;
  onSelected: (tag: Tag) => Route;
  onUnselected: (tag: Tag) => Route;
};

export const Tags = ({ tags, onSelected, onUnselected }: Props) => {
  return (
    <div className="flex flex-wrap justify-center gap-2.5">
      {tags.map(({ count, tag, type }) => {
        if (type === 'Disabled') {
          return (
            <Button key={tag} tag="Button" variant="secondary" className="uppercase" size="sm" disabled>
              {tag}
            </Button>
          );
        }

        if (type === 'Selected') {
          return (
            <Button
              key={tag}
              tag="Link"
              href={onSelected(tag)}
              variant="secondary"
              className="uppercase bg-brand/80 hover:bg-brand dark:bg-brand/40 dark:hover:bg-brand/20"
              size="sm"
            >
              {tag} <Count count={count} />
            </Button>
          );
        }

        return (
          <Button key={tag} href={onUnselected(tag)} tag="Link" variant="secondary" className="uppercase" size="sm">
            {tag} <Count count={count} />
          </Button>
        );
      })}
    </div>
  );
};

const Count = ({ count }: { count: number }) => (count > 0 ? <span className="ml-1">({count})</span> : null);
