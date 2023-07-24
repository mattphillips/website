import { GetStaticProps } from 'next';
import React from 'react';
import { useRouter } from 'next/router';
import { Maybe } from 'ts-prelude/Maybe';

import { Alt, Article, Summary, Src, Title } from 'src/articles/Articles';
import { Layout } from 'src/components/Layout';
import { Props } from 'src/next/Props';
import { SEO } from 'src/components/Seo';
import { Posts } from 'src/components/Posts';
import { Thumbnail } from 'src/components/Thumbnail';
import { ContentLayerArticles } from 'src/articles/ContentLayerArticles';
import { Action } from 'src/components/Action';
import { config } from 'src/config';

type NotFound = { posts: Array<Article> };

export default function NotFound({ posts }: NotFound) {
  const description =
    'Personal site by Matt Phillips where he write on all things related to code and careers in tech with a focus on Typescript, Testing and Functional Programming.';

  const { asPath } = useRouter();

  return (
    <>
      <SEO
        title={Maybe.just(Title.unsafeFrom('Not Found'))}
        slug={asPath}
        description={Summary.unsafeFrom(description)}
        image={Src.unsafeFrom('/profile.jpg')}
      />
      <Layout>
        <div className="max-w-4xl mx-auto pt-16">
          <div className="px-6 lg:px-0 border-b border-gray-200 dark:border-gray-500 text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8">Page not found</h1>

            <p className="font-body text-lg md:text-xl mb-4">
              <code>{asPath}</code> does not exist
            </p>

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
        <div className="mt-12 max-w-4xl mx-auto px-6">
          <h2 className="font-display text-4xl font-bold">Latest articles:</h2>
        </div>
        <Posts posts={posts} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<NotFound> = Props.getStatic(() =>
  new ContentLayerArticles().list.map((as) => as.slice(0, 3)).map((posts) => ({ posts }))
);
