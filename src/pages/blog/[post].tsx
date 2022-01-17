import { GetStaticPaths, GetStaticProps } from "next";
import React from "react";

import { Article } from "src/articles/Articles";
import { FsArticles } from "src/articles/FsArticles";
import { IO, UIO } from "ts-prelude/IO/fluent";
import { fromSerialisable, toSerialisable, ToSerialisable } from "ts-prelude/Serialisable";

const Post = (props: ToSerialisable<Article>) => {
  const { html, title, date } = fromSerialisable<Article>(props);
  return (
    <>
      <div className="max-w-2xl mx-auto">
        {/* <article className="post"> */}
        <article className="prose prose-img:rounded-xl prose-headings:underline prose-a:text-blue-600 prose-a:no-underline">
          <h1 className="title">{title}</h1>
          <span className="date">{date.toDateString()}</span>
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ToSerialisable<Article>> = (ctx) =>
  new FsArticles()
    .findBySlug(`${ctx.params.post.toString()}.md`)
    .flatMapW(IO.fromMaybe(new Error("Slug not found")))
    .orDie()
    .map((props) => ({ props: toSerialisable(props) }))
    .toPromise();

export const getStaticPaths: GetStaticPaths = new FsArticles().list
  .map((articles) => articles.map((a) => a.slug))
  .map((slugs) => slugs.map((slug) => ({ params: { post: slug } })))
  .map((slugs) => ({ paths: slugs, fallback: false })).toPromise;

export default Post;
