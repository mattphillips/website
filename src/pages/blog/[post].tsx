import { GetStaticPaths, GetStaticProps } from "next";
import React from "react";
import { IO } from "ts-prelude/IO/fluent";
import { fromSerialisable, toSerialisable, ToSerialisable } from "ts-prelude/Serialisable";

import { Article } from "src/articles/Articles";
import { FsArticles } from "src/articles/FsArticles";
import { Layout } from "src/components/Layout";

const Post = (props: ToSerialisable<Article>) => {
  // TODO: Move `fromSerialisable` to _app
  const { html, title, date, duration, image, slug } = fromSerialisable<Article>(props);
  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10">
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
          </article>
        </div>

        <div className="border-y border-solid border-gray-200 py-4 flex flex-row items-center justify-between">
          {/* Create external link component */}
          <a
            href={`https://twitter.com/intent/tweet?${new URLSearchParams({
              url: `https://mattphillips.io/blog/${slug}`,
              text: `I just read ${title} by @mattphillipsio\n\n`,
            })}`}
            target="_blank"
            rel="noopener"
          >
            <span className="font-display font-semibold text-lg text-gray-600">Tweet this article</span>
          </a>
          <div className="flex flex-row items-center">
            <a
              href={`https://twitter.com/search?${new URLSearchParams({
                q: `https://mattphillips.io/blog/${slug}`,
              })}`}
              target="_blank"
              rel="noopener"
            >
              <span className="font-display font-semibold text-lg text-gray-600">Discuss on Twitter</span>
            </a>
            <span className="mx-6">•</span>
            <a
              href={`https://github.com/mattphillips/website/edit/main/src/posts/${slug}.md`}
              target="_blank"
              rel="noopener"
            >
              <span className="font-display font-semibold text-lg text-gray-600">Edit on Github</span>
            </a>
          </div>
        </div>
      </div>
    </Layout>
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
