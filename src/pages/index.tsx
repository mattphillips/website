import React from "react";

import { GetStaticProps } from "next";
import { FsArticles } from "src/articles/FsArticles";
import { Article } from "src/articles/Articles";
import { fromSerialisable, ToSerialisable, toSerialisable } from "ts-prelude/Serialisable";

type Home = {
  posts: ToSerialisable<Array<Article>>;
};

export default function Home(props: Home) {
  const posts = fromSerialisable<Array<Article>>(props.posts);
  return (
    <ul>
      {posts.map((p) => (
        <li key={p.slug}>{JSON.stringify(p)})</li>
      ))}
    </ul>
  );
}

export const getStaticProps: GetStaticProps<Home> = async () =>
  new FsArticles().list.map((posts) => ({ props: { posts: toSerialisable(posts) } })).toPromise();
