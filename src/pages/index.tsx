import React from "react";
import Head from "next/head";
import Image from "next/future/image";
import { GetStaticProps } from "next";
import Link from "next/link";
import { fromSerialisable, ToSerialisable, toSerialisable } from "ts-prelude/Serialisable";

import { FsArticles } from "src/articles/FsArticles";
import { Article } from "src/articles/Articles";
import { Layout } from "src/components/Layout";
import { format } from "date-fns";

type Home = {
  posts: ToSerialisable<Array<Article>>;
};

export default function Home(props: Home) {
  const posts = fromSerialisable<Array<Article>>(props.posts);

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
        <div className="bg-gray-50">
          <div className="p-6 md:py-10 xl:px-0 md:relative max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center min-h-[500px]">
            <div className="mt-4 md:mt-0 md:mr-10 md:w-1/2">
              <span className="text-3xl md:text-5xl font-display">Hi 👋, I'm </span>
              <h1 className="text-5xl md:text-7xl mt-4 mb-4 md:mb-8 font-display text-gray-800">Matt Phillips</h1>
              <p className="font-body text-lg md:text-2xl text-gray-800">
                Welcome to my site where I write on all things related to code and careers in tech with a focus on
                Typescript, Testing and Functional Programming.
              </p>
            </div>
            {/* Aspect ratio of image is 1.25 */}
            <img
              className="rounded-full md:rounded-none object-cover w-[300px] h-[300px] md:w-[400px] md:h-[320px] lg:w-[550px] lg:h-[440px] md:absolute md:bottom-0 md:right-[24px]"
              src="/profile.webp"
              alt="Matt Phillips"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 px-6 xl:px-0 md:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto py-16 bg-white">
          {posts.map(({ date, slug, title, description, image, duration }) => (
            <article
              className="transition-transform transform hover:scale-105 rounded-lg flex justify-center"
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

export const getStaticProps: GetStaticProps<Home> = async () =>
  new FsArticles().list.map((posts) => ({ props: { posts: toSerialisable(posts) } })).toPromise();
