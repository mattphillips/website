import React from 'react';
import { IO } from 'ts-prelude/IO/fluent';

import { Alt, Src } from 'src/articles/Articles';
import { Action } from 'src/components/Action';
import { NotFoundPathTitle } from 'src/components/NotFoundPathTitle';
import { Posts } from 'src/components/Posts';
import { Thumbnail } from 'src/components/Thumbnail';
import { config } from 'src/config';

import { Next } from './next/Next';

const NotFound = Next.rsc(({ capabilities }) =>
  IO.do(function* ($) {
    const posts = yield* $(capabilities.articles.list.map((_) => _.slice(0, 3)));

    return (
      <>
        <div className="max-w-4xl mx-auto pt-16">
          <div className="px-6 lg:px-0 border-b border-gray-200 dark:border-gray-500 text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">Page not found</h1>

            <NotFoundPathTitle />

            <Action
              tag="Link"
              href={config.routes.home}
              className="inline-flex group transition-transform transform delay-75 ease-in-out text-base md:hover:scale-105 font-medium text-link dark:text-blue-300"
            >
              <span
                aria-hidden="true"
                className="inline-flex mr-2 transition-transform transform delay-75 ease-in-out md:group-hover:-translate-x-2"
              >
                &larr;
              </span>
              Back to home
            </Action>

            <div className="my-12">
              <Thumbnail src={Src.unsafeFrom('/images/404.jpg')} alt={Alt.unsafeFrom('Not found')} priority />
            </div>
          </div>
        </div>
        <div className="my-12 max-w-4xl mx-auto px-6">
          <h2 className="font-display text-4xl font-bold">Latest articles:</h2>
        </div>

        <div className="mx-auto max-w-7xl px-6">
          <Posts posts={posts} />
        </div>
      </>
    );
  })
);

export default NotFound;
