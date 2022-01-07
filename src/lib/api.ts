import fs from "fs";
import { join } from "path";
import matter from "gray-matter";

import { remark } from "remark";
import html from "remark-html";
import prism from "remark-prism";

const postsDirectory = join(process.cwd(), "src/", "posts");

export function getPostSlugs() {
  return fs.readdirSync(postsDirectory);
}

type Post = {
  content: string;
  data: {
    [key: string]: string;
  };
};

export function getPostBySlug(slug: string): Post {
  const realSlug = slug.replace(/\.md$/, "");
  const fullPath = join(postsDirectory, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  return matter(fileContents);
}

export function getAllPosts(): Array<Post> {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    // sort posts by date in descending order
    .sort((post1, post2) => (post1.data.date > post2.data.date ? -1 : 1));
  return posts;
}

export async function markdownToHtml(markdown) {
  const result = await remark()
    .use(html, { sanitize: false })
    // @ts-ignore
    .use(prism)
    .process(markdown);
  return result.toString();
}
