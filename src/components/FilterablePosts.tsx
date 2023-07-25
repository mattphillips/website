'use client';

import { Article, Tag } from 'src/articles/Articles';
import { Posts } from 'src/components/Posts';
import { Tags } from 'src/components/Tags';
import { config } from 'src/config';
import { useQueryTags } from 'src/hooks/useQueryTags';

type Props = {
  posts: Array<Article>;
};

export const FilterablePosts = ({ posts }: Props) => {
  const query = useQueryTags();
  const allTags = Tag.unique(posts.flatMap((p) => p.tags));
  const availablePosts = posts.filter((post) => query.every((t) => post.tags.includes(t)));
  const availableTags = availablePosts
    .flatMap((a) => a.tags)
    .reduce<Record<Tag, number>>((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

  return (
    <div className="space-y-12">
      <Tags
        tags={allTags.map((tag) => {
          return {
            tag,
            count: availableTags[tag] || 0,
            type: query.includes(tag) ? 'Selected' : availableTags[tag] === undefined ? 'Disabled' : 'Unselected'
          };
        })}
        onUnselected={(_) => config.routes.tag(Tag.toQuery(query.concat(_)))}
        onSelected={(_) => config.routes.tag(Tag.toQuery(query.filter((t) => t !== _)))}
      />

      <Posts posts={availablePosts} />
    </div>
  );
};
