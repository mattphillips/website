import { GetStaticProps } from "next";
import React from "react";

import { FsArticles } from "src/articles/FsArticles";
import { Article, Description, Src } from "src/articles/Articles";
import { Layout } from "src/components/Layout";
import { Props } from "src/next/Props";
import { SEO } from "src/components/Seo";
import { Maybe } from "ts-prelude/Maybe";
import { Posts } from "src/components/Posts";
import { ProfileAvatar } from "src/components/ProfileAvatar";

type Home = { posts: Array<Article> };

export default function Home({ posts }: Home) {
  const description =
    "Personal site by Matt Phillips where he write on all things related to code and careers in tech with a focus on Typescript, Testing and Functional Programming.";
  return (
    <>
      <SEO
        title={Maybe.nothing}
        slug=""
        description={Description.unsafeFrom(description)}
        image={Src.unsafeFrom("/profile.jpg")}
      />
      <Layout>
        <div className="px-6 bg-white">
          <div className="max-w-5xl mx-auto py-12 flex flex-col-reverse md:flex-row items-center justify-center border-b border-gray-200">
            <div className="mt-4 md:mt-0 md:mr-8 md:w-1/2 text-gray-800">
              <span className="text-3xl md:text-5xl font-display font-bold">Hi 👋, I'm </span>
              <h1 className="text-5xl md:text-7xl mt-4 mb-4 md:mb-8 font-display font-bold">Matt Phillips</h1>
              <p className="font-body text-lg md:text-xl">
                Welcome to my site where I write on all things related to code and careers in tech with a focus on
                Typescript, Testing and Functional Programming.
              </p>
            </div>
            <ProfileAvatar className="rounded-full h-72 w-72" priority />
          </div>
        </div>

        <Posts posts={posts} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Home> = Props.getStatic(() =>
  new FsArticles().list.map((posts) => ({ posts }))
);
