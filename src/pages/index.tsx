import { format } from "date-fns";
import { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";

import { FsArticles } from "src/articles/FsArticles";
import { Article, Description, Src } from "src/articles/Articles";
import { Layout } from "src/components/Layout";
import { Props } from "src/next/Props";
import { Thumbnail } from "src/components/Thumbnail";
import { SEO } from "src/components/Seo";
import { Maybe } from "ts-prelude/Maybe";

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
            <img
              className="rounded-full object-cover object-center w-72 h-72"
              src="/profile.webp"
              alt="Matt Phillips"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 px-6 xl:px-0 md:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto py-16 bg-white">
          {posts.map(({ date, slug, title, description, image, duration }) => (
            <article
              className="transition-transform transform md:hover:scale-105 rounded-lg flex justify-center"
              key={slug}
            >
              <div className="max-w-lg">
                <Link passHref={true} href={`/blog/${slug}`}>
                  <a className="no-underline">
                    <article className="">
                      <Thumbnail src={image.src} alt={image.alt} />
                      <div className="mt-4">
                        <div className="font-body text-sm text-gray-500 font-semibold text-center">
                          <span>{format(date, "dd MMMM, yyyy")}</span>
                          <span className="mx-4">•</span>
                          <span>{duration}</span>
                        </div>
                        <div className="p-4">
                          <h2 className="text-3xl font-display font-semibold mb-4 text-gray-800">{title}</h2>
                          <p className="text-lg font-body text-gray-800">{description}</p>
                        </div>
                      </div>
                    </article>
                  </a>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Home> = Props.getStatic(() =>
  new FsArticles().list.map((posts) => ({ posts }))
);
