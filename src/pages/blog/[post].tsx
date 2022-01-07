import { GetStaticProps } from "next";
import Head from "next/head";
import React, { createElement } from "react";
import matter from "gray-matter";

import { join } from "path";
import fs from "fs";
import { remark } from "remark";
import html from "remark-html";

type Post = {
  data: any;
  content: string;
};

const Post = ({ data, content }: Post) => {
  console.log(data);
  return (
    <div className="max-w-2xl mx-auto">
      <article className="prose lg:prose-xl">
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </article>
    </div>
  );
};

const postsDirectory = join(process.cwd(), "src/", "posts");

async function markdownToHtml(markdown) {
  const result = await remark().use(html).process(markdown);
  return result.toString();
}

export const getStaticProps: GetStaticProps<Post> = async (ctx) => {
  const slug = ctx.params.post.toString();

  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const html = await markdownToHtml(content);

  return { props: { data, content: html } };
};

export const getStaticPaths = async () => {
  const posts = fs.readdirSync(postsDirectory);

  return {
    paths: posts.map((post) => {
      return {
        params: {
          post: post.replace(".md", ""),
        },
      };
    }),
    fallback: false,
  };
};

export default Post;
