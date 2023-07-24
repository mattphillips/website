import { GetStaticProps } from 'next';
import React from 'react';

import { Article, Summary, Src, Tag } from 'src/articles/Articles';
import { Layout } from 'src/components/Layout';
import { Props } from 'src/next/Props';
import { SEO } from 'src/components/Seo';
import { Maybe } from 'ts-prelude/Maybe';
import { Posts } from 'src/components/Posts';
import { ProfileAvatar } from 'src/components/ProfileAvatar';
import { ContentLayerArticles } from 'src/articles/ContentLayerArticles';
import { TagButton as TagComp } from 'src/components/TagButton';
import { useQueryTags } from 'src/hooks/useQueryTags';

type Home = { posts: Array<Article> };

export default function Home({ posts }: Home) {
  const description = `Open-source software engineer and tech founder with a passion for teaching all things software related, career development and building products.`;

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
    <>
      <SEO
        title={Maybe.nothing}
        slug=""
        description={Summary.unsafeFrom(description)}
        image={Src.unsafeFrom('/profile.jpg')}
      />
      <Layout>
        <div className="px-6">
          <div className="max-w-5xl mx-auto pt-4 pb-12 md:py-12 flex flex-col-reverse md:flex-row items-center justify-center border-b border-gray-200 dark:border-gray-500">
            <div className="mt-4 md:mt-0 md:mr-8 md:w-1/2">
              <span className="text-3xl md:text-5xl font-display font-bold">
                Hi <span className="animate-wave inline-block origin-[70%_70%]">👋</span>, I'm
              </span>
              <h1 className="text-5xl md:text-7xl mt-4 mb-4 md:mb-8 font-display font-bold">Matt Phillips</h1>

              <p className="font-body text-lg mb-4">
                Experienced software engineer in open-source, managing teams and building products. I help to maintain
                Jest and Jest Community packages and have recently founded a learn-to-drive startup.
              </p>

              <p className="font-body text-lg">
                Here I write about all things code. You can expect to learn more about Typescript, Node, React, Testing
                and Functional Programming – with some content on career development and founding products thrown in
                too.
              </p>
            </div>
            <ProfileAvatar className="rounded-full h-56 w-56 md:h-72 md:w-72" priority />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 mt-10">
          {allTags.map((tag) => {
            const type = query.includes(tag)
              ? 'Selected'
              : availableTags[tag] === undefined
              ? 'Disabled'
              : 'Unselected';

            return <TagComp key={tag} count={availableTags[tag] || 0} tag={tag} type={type} />;
          })}
        </div>

        <Posts posts={availablePosts} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Home> = Props.getStatic(() =>
  new ContentLayerArticles().list.map((posts) => ({ posts }))
);
