import { format } from "date-fns";
import Head from "next/head";
import Image from "next/future/image";
import { GetStaticProps } from "next";
import Link from "next/link";
import React from "react";

import { FsArticles } from "src/articles/FsArticles";
import { Article } from "src/articles/Articles";
import { Layout } from "src/components/Layout";
import { Props } from "src/next/Props";

type Home = {
  posts: Array<Article>;
};

export default function Home({ posts }: Home) {
  const description =
    "Personal site by Matt Phillips where he write on all things related to code and careers in tech with a focus on Typescript, Testing and Functional Programming.";
  return (
    <>
      <Head>
        <title>Matt Phillips</title>
        <meta name="description" content={description} />
        <meta name="og:url" content="https://mattphillips.io" />
        <meta name="og:title" content="Matt Phillips" />
        <meta name="og:description" content={description} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="mattphillipsio" />
        <meta name="twitter:description" content={description} />
        <meta property="og:image" content="https://mattphillips.io/profile.jpg" />
        <meta property="twitter:image" content="https://mattphillips.io/profile.jpg" />
      </Head>
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
                      {image.fold(null, ({ alt, src, credit }) => (
                        <figure className="mb-4">
                          <Image src={src} alt={alt} className="rounded-lg shadow-xl" width={1400} height={875} />
                          <figcaption className="hidden">Photo by: {credit.name}</figcaption>
                        </figure>
                      ))}
                      <div className="">
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

// export const getStaticProps: GetStaticProps<Home> = async () =>
// new FsArticles().list.map((posts) => ({ props: { posts: toSerialisable(posts) } })).toPromise();

export const getStaticProps: GetStaticProps<Home> = Props.getStatic(() =>
  new FsArticles().list.map((posts) => ({ posts }))
);
