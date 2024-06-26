import React from 'react';

import { Article } from 'src/articles/Articles';
import { config } from 'src/config';

import { Action } from './Action';
import { PostMeta } from './PostMeta';
import { Thumbnail } from './Thumbnail';

type Posts = { posts: Array<Article.Preview> };

export const Posts: React.FC<Posts> = ({ posts }) => (
  <div className="grid grid-cols-1 xl:px-4 md:grid-cols-2 xl:grid-cols-3 gap-12">
    {posts.map(({ publishedAt, slug, title, description, image, duration }) => (
      <article
        className="transition-transform transform ease-in-out delay-75 md:hover:scale-110 rounded-lg flex justify-center"
        key={slug}
      >
        <div className="max-w-lg">
          <Action tag="Link" href={config.routes.blog(slug)} className="no-underline">
            <article className="">
              <Thumbnail src={image.src} alt={image.alt} />
              <div className="mt-4">
                <PostMeta className="text-sm" duration={duration} publishedAt={publishedAt} />
                <div className="p-4">
                  <h3 className="text-3xl font-display font-semibold mb-4">{title}</h3>
                  <p className="text-lg font-body">{description}</p>
                </div>
              </div>
            </article>
          </Action>
        </div>
      </article>
    ))}
  </div>
);
