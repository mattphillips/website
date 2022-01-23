import React from "react";
import Head from "next/head";
import { GetStaticProps } from "next";
import Link from "next/link";
import { fromSerialisable, ToSerialisable, toSerialisable } from "ts-prelude/Serialisable";

import { FsArticles } from "src/articles/FsArticles";
import { Article } from "src/articles/Articles";
import { Layout } from "src/components/Layout";

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
              <h1 className="text-5xl md:text-7xl mt-4 mb-4 md:mb-8">Matt Phillips</h1>
              <p className="font-body text-xl md:text-2xl">
                Welcome to my site where I write on all things related to code and careers in tech with a focus on
                Typescript, Testing and Functional Programming.
              </p>
            </div>
            {/* Aspect ratio of image is 1.25 */}
            <img
              className="rounded-full md:rounded-none object-cover w-[300px] h-[300px] md:w-[400px] md:h-[320px] lg:w-[550px] lg:h-[440px] md:absolute md:bottom-0 md:right-[24px]"
              src="/profile.png"
              alt="Matt Phillips"
            />
          </div>
        </div>
        <ul className="list-none p-0 m-0">
          {posts.map(({ date, slug, title, description, image, duration }) => (
            <li
              className="py-10 transition-all hover:shadow-[0_5px_40px_rgb(0,0,0,0.04)] border-b border-solid border-200 last:border-0"
              key={slug}
            >
              <Link passHref={true} href={`/blog/${slug}`}>
                <a className="no-underline">
                  <article className="max-w-2xl mx-auto flex flex-col w-full ">
                    {image.fold(null, ({ alt, src, credit }) => (
                      <figure className="mb-4 flex flex-col items-center">
                        {/* TODO: Look into Next image here */}
                        <img
                          src={src}
                          alt={alt}
                          className="md:rounded-lg object-cover object-center max-h-[336px] w-full"
                        />
                        <figcaption className="text-xs text-gray-600 mt-2">Photo by: {credit.name}</figcaption>
                      </figure>
                    ))}
                    <div className="px-6 md:px-0">
                      <h2 className="text-4xl font-display font-semibold mb-4 tracking-wider">{title}</h2>
                      <div className="text-sm text-gray-600 mb-4">
                        {date.toDateString()} • {duration}
                      </div>
                      <p className="text-lg">{description}</p>
                    </div>
                  </article>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Home> = async () =>
  new FsArticles().list.map((posts) => ({ props: { posts: toSerialisable(posts) } })).toPromise();
