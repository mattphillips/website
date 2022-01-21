import { GetStaticPaths, GetStaticProps } from "next";
import React from "react";
import { IO } from "ts-prelude/IO/fluent";
import { fromSerialisable, toSerialisable, ToSerialisable } from "ts-prelude/Serialisable";

import { Article } from "src/articles/Articles";
import { FsArticles } from "src/articles/FsArticles";
import { Layout } from "src/components/Layout";
import Head from "next/head";

const Post = (props: ToSerialisable<Article>) => {
  // TODO: Move `fromSerialisable` to _app
  const { html, title, date, duration, image, slug, description } = fromSerialisable<Article>(props);
  return (
    <>
      <Head>
        {/* TODO: Extract this into a component and app config */}
        <title>{title} | Matt Phillips</title>
        <meta name="description" content={description} />
        <meta name="og:url" content={`https://mattphillips.io/blog/${slug}`} />
        <meta name="og:title" content={`${title} | Matt Phillips`} />
        <meta name="og:description" content={description} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="mattphillipsio" />
        <meta name="twitter:description" content={description} />

        {image.fold(null, ({ src }) => (
          <>
            <meta property="og:image" content={src} />
            <meta property="twitter:image" content={src} />
          </>
        ))}
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto pt-10">
          {/* Extract into a component */}
          {image.fold(null, ({ alt, src, credit }) => (
            <figure className="mb-4 flex flex-col items-center">
              {/* TODO: Look into Next image here */}
              <img src={src} alt={alt} className="md:rounded-lg object-cover object-center max-h-[336px] w-full" />
              <figcaption className="text-xs text-gray-600 mt-2">Photo by: {credit.name}</figcaption>
            </figure>
          ))}
          <div className="px-6 md:px-0">
            {/* TODO: Extract this (same as homepage) */}
            <h1 className="font-display text-4xl font-semibold mb-4 tracking-wider">{title}</h1>
            <div className="font-body text-sm text-600 mb-4">
              {date.toDateString()} • {duration}
            </div>
            <article className="post">
              <div dangerouslySetInnerHTML={{ __html: html }} />
              <p>
                Don’t miss out on on future posts, projects and products I’m building. Follow me over on Twitter{" "}
                <a
                  href="https://twitter.com/mattphillipsio"
                  target="_blank"
                  title="Twitter"
                  rel="noopener"
                  className="font-bold"
                >
                  @mattphillipsio
                </a>
              </p>
            </article>
          </div>

          <div className="border-y border-solid border-gray-200 p-6 md:px-0 flex flex-row flex-wrap items-center justify-between">
            {/* Create external link component */}
            <a
              href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                url: `https://mattphillips.io/blog/${slug}`,
                text: `I just read ${title} by @mattphillipsio\n\n`,
              })}`}
              target="_blank"
              rel="noopener"
            >
              <div className="font-body font-semibold text-lg text-gray-600 mb-4 md:mb-0">Tweet this article</div>
            </a>

            <div className="flex flex-row items-center flex-wrap">
              <a
                href={`https://twitter.com/search?${new URLSearchParams({
                  q: `https://mattphillips.io/blog/${slug}`,
                })}`}
                target="_blank"
                rel="noopener"
              >
                <div className="font-body font-semibold text-lg text-gray-600">Discuss on Twitter</div>
              </a>
              <span className="mx-4">•</span>
              <a
                href={`https://github.com/mattphillips/website/edit/main/src/posts/${slug}.md`}
                target="_blank"
                rel="noopener"
              >
                <div className="font-body font-semibold text-lg text-gray-600">Edit on Github</div>
              </a>
            </div>
          </div>

          <div className="flex flex-row flex-wrap items-center p-6 md:px-0 ">
            {/* Extract this */}
            <img
              className="w-[200px] h-[200px] mb-4 md:mb-0 md:mr-4 md:rounded-full"
              src="/profile.png"
              alt="Matt Phillips"
            />
            <div className="md:w-2/3">
              <div className="font-display text-2xl text-gray-600 mb-4">Written by Matt Phillips</div>
              <p className="font-body text-lg">
                Experienced software engineer, Jest maintainer, OSS publisher. Writing about founding products, teaching
                with code and building in public.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps<ToSerialisable<Article>> = (ctx) =>
  new FsArticles()
    .findBySlug(`${ctx.params.post.toString()}.md`)
    .flatMapW(IO.fromMaybe(new Error("Slug not found")))
    .orDie()
    // TODO: Create `Props` constructor that does `toSerialisable`
    .map((props) => ({ props: toSerialisable(props) }))
    .toPromise();

export const getStaticPaths: GetStaticPaths = new FsArticles().list
  .map((articles) => articles.map((a) => a.slug))
  .map((slugs) => slugs.map((slug) => ({ params: { post: slug } })))
  .map((slugs) => ({ paths: slugs, fallback: false })).toPromise;

export default Post;
