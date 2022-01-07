import React from "react";

import { GetStaticProps } from "next";
import { getAllPosts } from "src/lib/api";

type Home = {
  posts: Array<{
    date: string;
    title: string;
  }>;
};

export default function Home({ posts }: Home) {
  return (
    <ul>
      {posts.map((p) => (
        <li>{JSON.stringify(p)})</li>
      ))}
    </ul>
  );
}

export const getStaticProps: GetStaticProps<Home> = async () => {
  const posts = getAllPosts();

  return {
    props: {
      posts: posts.map((p) => p.data as any),
    },
  };
};
