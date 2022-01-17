import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import React, { createElement } from "react";
import matter from "gray-matter";

import { join } from "path";
import fs from "fs";
import { remark } from "remark";
import html from "remark-html";
import prism from "remark-prism";
import { Article } from "src/articles/Articles";
import { FsArticles } from "src/articles/FsArticles";
import { IO, UIO } from "ts-prelude/IO/fluent";
import { fromSerialisable, toSerialisable, ToSerialisable } from "ts-prelude/Serialisable";

const Post = (props: ToSerialisable<Article>) => {
  const { content } = fromSerialisable<Article>(props);
  return (
    <>
      <div className="max-w-2xl mx-auto">
        <article className="prose lg:prose-xl">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </div>
    </>
  );
};

const markdownToHtml = (markdown: string): UIO<string> =>
  IO.fromPromiseOrDie(() =>
    remark()
      .use(html, { sanitize: false })
      // @ts-ignore
      .use(prism)
      .process(markdown)
  ).map((file) => file.toString());

export const getStaticProps: GetStaticProps<ToSerialisable<Article>> = (ctx) =>
  new FsArticles()
    .findBySlug(`${ctx.params.post.toString()}.md`)
    .flatMapW(IO.fromMaybe(new Error("Slug not found")))
    .orDie()
    .flatMap((article) => markdownToHtml(article.content).map((html) => ({ ...article, content: html })))
    .map((props) => ({ props: toSerialisable(props) }))
    .toPromise();

export const getStaticPaths: GetStaticPaths = new FsArticles().list
  .map((articles) => articles.map((a) => a.slug))
  .map((slugs) => slugs.map((slug) => ({ params: { post: slug } })))
  .map((slugs) => ({ paths: slugs, fallback: false })).toPromise;

export default Post;
