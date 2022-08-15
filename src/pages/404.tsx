import { GetStaticProps } from "next";
import React from "react";

import { FsArticles } from "src/articles/FsArticles";
import { Alt, Article, Description, Src, Title } from "src/articles/Articles";
import { Layout } from "src/components/Layout";
import { Props } from "src/next/Props";
import { SEO } from "src/components/Seo";
import { Maybe } from "ts-prelude/Maybe";
import { Posts } from "src/components/Posts";
import { useRouter } from "next/router";
import { Thumbnail } from "src/components/Thumbnail";
import Link from "next/link";

type NotFound = { posts: Array<Article> };

export default function NotFound({ posts }: NotFound) {
  const description =
    "Personal site by Matt Phillips where he write on all things related to code and careers in tech with a focus on Typescript, Testing and Functional Programming.";

  const { asPath } = useRouter();

  return (
    <>
      <SEO
        title={Maybe.just(Title.unsafeFrom("Not Found"))}
        slug={asPath}
        description={Description.unsafeFrom(description)}
        image={Src.unsafeFrom("/profile.jpg")}
      />
      <Layout>
        <div className="max-w-4xl mx-auto pt-16">
          <div className="px-6 lg:px-0 border-b border-gray-200 text-center">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 text-gray-800">Page not found</h1>

            <p className="font-body text-lg md:text-xl mb-4">
              <code>{asPath}</code> does not exist
            </p>

            <Link href="/" passHref>
              <a className="inline-flex group transition transform delay-75 ease-in-out text-base md:hover:scale-105 font-medium text-[#0074de]">
                <span
                  aria-hidden="true"
                  className="inline-flex mr-2 transition transform delay-75 ease-in-out md:group-hover:-translate-x-2 "
                >
                  &larr;
                </span>
                Back to home
              </a>
            </Link>

            <div className="my-12">
              <Thumbnail src={Src.unsafeFrom("/images/404.jpg")} alt={Alt.unsafeFrom("Not found")} priority />
            </div>
          </div>
        </div>
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-gray-800">Latest articles:</h2>
        </div>
        <Posts posts={posts} />
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<NotFound> = Props.getStatic(() =>
  new FsArticles().list.map((as) => as.slice(0, 3)).map((posts) => ({ posts }))
);
