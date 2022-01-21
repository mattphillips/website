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
      <nav className="max-w-2xl mx-auto py-6">
        <ul className="flex flex-row justify-evenly list-none">
          <li className="font-semibold">Home</li>
          <li className="font-semibold">About</li>
          <li className="font-semibold">Services</li>
          <li className="font-semibold">Products</li>
          <li className="font-semibold">Projects</li>
          <li className="font-semibold">Blog</li>
          <li className="font-semibold">Contact</li>
        </ul>
      </nav>
      <header className="py-20  bg-gray-50">
        <div className="max-w-5xl mx-auto py-6">
          <div className="flex flex-row items-start">
            <div className="mr-8">
              <span className="text-5xl font-display">Hi 👋, I'm </span>
              <h1 className="text-7xl my-4">Matt Phillips</h1>
              <p className="font-body text-2xl mb-8">
                Welcome to my site where I write on all things related to code and careers in tech with a focus on
                Typescript, Testing and Functional Programming.
              </p>
              <div className="flex flex-row">
                <a href="https://twitter.com/mattphillipsio" target="_blank" title="Twitter" rel="noopener">
                  <div className="border-2 border-solid border-black rounded-full p-3 mr-6">
                    <Twitter />
                  </div>
                </a>
                <a href="https://github.com/mattphillips" target="_blank" title="Github" rel="noopener">
                  <div className="border-2 border-solid border-black rounded-full p-3 mr-6">
                    <Github />
                  </div>
                </a>
                <a href="https://linkedin.com/in/mattphillipsio" target="_blank" title="Linked" rel="noopener">
                  <div className="border-2 border-solid border-black rounded-full p-3 mr-6">
                    <LinkedIn />
                  </div>
                </a>
              </div>
            </div>
            <img className="rounded-full w-[400px] h-[400px]" src="/profile.jpg" alt="Matt Phillips" />
          </div>
        </div>
      </header>
      <ul className="list-none p-0 m-0">
        {posts.map(({ date, slug, title, description, image, duration }) => (
          <li className="py-10 hover:shadow-[0_5px_40px_rgb(0,0,0,0.04)] border-b border-solid border-200" key={slug}>
            <Link passHref={true} href={`/blog/${slug}`}>
              <a className="no-underline">
                <article className="max-w-2xl mx-auto flex flex-col w-full ">
                  {image.fold(null, ({ alt, src, credit }) => (
                    <figure className="mb-4 flex flex-col items-center">
                      {/* TODO: Look into Next image here */}
                      <img src={src} alt={alt} className="rounded-lg object-cover object-center max-h-[336px] w-full" />
                      <figcaption className="text-xs text-gray-600 mt-2">Photo by: {credit.name}</figcaption>
                    </figure>
                  ))}
                  <h2 className="text-3xl font-display font-semibold mb-4 tracking-wider leading-9">{title}</h2>
                  <div className="text-sm text-gray-600">
                    {date.toDateString()} • {duration}
                  </div>
                  <p className="my-4 text-lg">{description}</p>
                </article>
              </a>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export const getStaticProps: GetStaticProps<Home> = async () =>
  new FsArticles().list.map((posts) => ({ props: { posts: toSerialisable(posts) } })).toPromise();
