import { Slug, Title } from "./articles/Articles";

const domain = "https://mattphillips.io";
const twitterUser = "mattphillipsio";
const githubUser = "mattphillips";

export const config = {
  domain,
  twitterUser,
  social: {
    twitter: "https://twitter.com/mattphillipsio",
    github: "https://github.com/mattphillips",
    linkedIn: "https://linkedin.com/in/mattphillipsio",
  },

  interact: {
    share: (slug: Slug, title: Title) =>
      `https://twitter.com/intent/tweet?${new URLSearchParams({
        url: `${config.domain}/blog/${slug}`,
        text: `I just read ${title} by @${config.twitterUser}\n\n`,
      })}`,

    edit: (slug: Slug) => `https://github.com/${githubUser}/website/edit/main/src/posts/${slug}.md`,

    discuss: (slug: Slug) =>
      `https://twitter.com/search?${new URLSearchParams({
        q: `${domain}/blog/${slug}`,
      })}`,
  },
};
