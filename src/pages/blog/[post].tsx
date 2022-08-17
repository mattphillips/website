import { GetStaticPaths, GetStaticProps } from "next";
import React from "react";
import { IO } from "ts-prelude/IO/fluent";
import { Maybe } from "ts-prelude/Maybe";

import { Article, Slug } from "src/articles/Articles";
import { FsArticles } from "src/articles/FsArticles";
import { Layout } from "src/components/Layout";
import { Paths, Props } from "src/next/Props";
import { Thumbnail } from "src/components/Thumbnail";
import { SEO } from "src/components/Seo";
import { PostMeta } from "src/components/PostMeta";
import { ExternalLink } from "src/components/ExternalLink";
import { config } from "src/config";
import { usePrism } from "src/hooks/usePrism";
import { ProfileAvatar } from "src/components/ProfileAvatar";

export default function Post({ html, title, date, duration, image, slug, description }: Article) {
  const prismRef = usePrism();
  return (
    <>
      <SEO title={Maybe.just(title)} slug={`/blog/${slug}`} description={description} image={image.src} />
      <Layout>
        <div className="max-w-4xl mx-auto pt-16">
          <div className="px-6 lg:px-0">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight text-center">{title}</h1>
            <PostMeta className="mb-12" duration={duration} date={date} />

            <Thumbnail src={image.src} alt={image.alt} priority />

            <article className="post mt-12 max-w-4xl mx-auto md:px-6" ref={prismRef}>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </article>
          </div>

          <div className="px-6">
            <div className="border-y border-solid border-gray-200 dark:border-gray-500 py-6 md:px-6 my-12 grid md:grid-cols-2 gap-4 font-body font-semibold text-lg text-gray-600 dark:text-gray-300">
              <ExternalLink href={config.interact.share(slug, title)}>Tweet this article</ExternalLink>
              <div className="flex flex-row md:justify-end items-center flex-wrap">
                <ExternalLink href={config.interact.discuss(slug)}>Discuss on Twitter</ExternalLink>
                <span className="mx-2 md:mx-4">•</span>
                <ExternalLink href={config.interact.edit(slug)}>Edit on Github</ExternalLink>
              </div>
            </div>
          </div>

          <div className="px-6">
            <div className="pb-12 md:px-6 border-b border-gray-200 dark:border-gray-500 grid items-center gap-6 md:grid-flow-col">
              <ProfileAvatar className="rounded-full h-40 w-40" />
              <div>
                <p className="text-4xl mb-4 font-display font-bold">Matt Phillips</p>
                <p className="font-body text-lg mb-4">
                  Experienced software engineer, Jest maintainer, OSS publisher. Writing about founding products,
                  teaching with code and building in public.
                </p>
                <p className="font-body text-lg">
                  Don’t miss out on on future posts, projects and products I’m building. Follow me over on Twitter{" "}
                  <ExternalLink className="font-bold" href={config.social.twitter}>
                    @mattphillipsio
                  </ExternalLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Article, { post: Slug }> = Props.getStatic((ctx) =>
  new FsArticles()
    .findBySlug(`${ctx.params!.post}.md`)
    .flatMapW(IO.fromMaybe(new Error("Slug not found")))
    .orDie()
);

export const getStaticPaths: GetStaticPaths<{ post: Slug }> = Paths.getStatic(() =>
  new FsArticles().list.map((articles) => articles.map((a) => ({ post: a.slug })))
);
