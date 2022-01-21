import React from "react";
import Head from "next/head";

import { GetStaticProps } from "next";
import { FsArticles } from "src/articles/FsArticles";
import { Article } from "src/articles/Articles";
import { fromSerialisable, ToSerialisable, toSerialisable } from "ts-prelude/Serialisable";
import Link from "next/link";
import { Github, LinkedIn, Twitter } from "src/components/icons";

type Home = {
  posts: ToSerialisable<Array<Article>>;
};

export default function Home(props: Home) {
  const posts = fromSerialisable<Array<Article>>(props.posts);

  return (
    <>
      <Head>
        <title>Matt Phillips</title>
      </Head>
      <header className="">
        <nav className="p-6">
          <div className="max-w-5xl mx-auto flex flex-row justify-between items-center bg-white">
            <Link passHref href="/">
              <a title="mattphillips.io">
                <span className="font-display text-xl md:text-2xl tracking-wider uppercase ">Matt Phillips</span>
              </a>
            </Link>
            <div className="flex flex-row">
              <a href="https://twitter.com/mattphillipsio" target="_blank" title="Twitter" rel="noopener">
                <div className="mr-6">
                  <Twitter />
                </div>
              </a>
              <a href="https://github.com/mattphillips" target="_blank" title="Github" rel="noopener">
                <div className="mr-6">
                  <Github />
                </div>
              </a>
              <a href="https://linkedin.com/in/mattphillipsio" target="_blank" title="Linked" rel="noopener">
                <div className="">
                  <LinkedIn />
                </div>
              </a>
            </div>
          </div>
        </nav>
        <div className="p-6 md:py-10 bg-gray-50">
          <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center">
            <div className="md:mr-10">
              <span className="text-2xl md:text-5xl font-display">Hi 👋, I'm </span>
              <h1 className="text-3xl md:text-7xl mt-4 mb-4 md:mb-8">Matt Phillips</h1>
              <p className="font-body text-xl md:text-2xl">
                Welcome to my site where I write on all things related to code and careers in tech with a focus on
                Typescript, Testing and Functional Programming.
              </p>
            </div>
            <img
              className="rounded-full w-[200px] h-[200px] md:w-[400px] md:h-[400px] "
              src="/profile.jpg"
              alt="Matt Phillips"
            />
          </div>
        </div>
      </header>
      <main>
        <ul className="list-none p-0 m-0">
          {posts.map(({ date, slug, title, description, image, duration }) => (
            <li
              className="py-10 transition-all hover:shadow-[0_5px_40px_rgb(0,0,0,0.04)] border-b border-solid border-200"
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
                      <h2 className="text-3xl font-display font-semibold mb-4 tracking-wider leading-9">{title}</h2>
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
      </main>
      <footer className="bg-white p-4 sm:p-6">
        <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://twitter.com/mattphillipsio" target="_blank" title="Twitter" rel="noopener">
              <div className=" mr-6">
                <Twitter />
              </div>
            </a>
            <a href="https://github.com/mattphillips" target="_blank" title="Github" rel="noopener">
              <div className=" mr-6">
                <Github />
              </div>
            </a>
            <a href="https://linkedin.com/in/mattphillipsio" target="_blank" title="Linked" rel="noopener">
              <div className="">
                <LinkedIn />
              </div>
            </a>
          </div>
          <div className="mt-4 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">&copy; 2022 Matt Phillips. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}

export const getStaticProps: GetStaticProps<Home> = async () =>
  new FsArticles().list.map((posts) => ({ props: { posts: toSerialisable(posts) } })).toPromise();
