import Link from "next/link";
import React from "react";
import { Article } from "src/articles/Articles";
import { PostMeta } from "./PostMeta";
import { Thumbnail } from "./Thumbnail";

type Posts = { posts: Array<Article> };

export const Posts: React.FC<Posts> = ({ posts }) => (
  <div className="grid grid-cols-1 px-6 xl:px-0 md:grid-cols-2 xl:grid-cols-3 gap-12 max-w-7xl mx-auto py-16 bg-white">
    {posts.map(({ date, slug, title, description, image, duration }) => (
      <article
        className="transition transform ease-in-out delay-75 md:hover:-translate-y-2 md:hover:scale-110 rounded-lg flex justify-center"
        key={slug}
      >
        <div className="max-w-lg">
          <Link passHref={true} href={`/blog/${slug}`}>
            <a className="no-underline">
              <article className="">
                <Thumbnail src={image.src} alt={image.alt} />
                <div className="mt-4">
                  <PostMeta className="text-sm" duration={duration} date={date} />
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
);
