import { Nominal } from 'ts-prelude/Nominal';
import { Slug, Tag, Title } from './articles/Articles';
import { useQueryTags } from './hooks/useQueryTags';

const domain = 'https://mattphillips.io';
const twitterUser = 'mattphillipsio';
const githubUser = 'mattphillips';

export type Route = Nominal<string, { readonly Route: unique symbol }>;
export const Route = Nominal<Route>();

export type ExternalRoute = Nominal<string, { readonly ExternalRoute: unique symbol }>;
export const ExternalRoute = Nominal<ExternalRoute>();

export const config = {
  domain,
  twitterUser,
  social: {
    twitter: ExternalRoute('https://twitter.com/mattphillipsio'),
    github: ExternalRoute('https://github.com/mattphillips'),
    linkedIn: ExternalRoute('https://linkedin.com/in/mattphillipsio')
  },

  interact: {
    share: (slug: Slug, title: Title) =>
      ExternalRoute(
        `https://twitter.com/intent/tweet?${new URLSearchParams({
          url: `${config.domain}/blog/${slug}`,
          text: `I just read ${title} by @${config.twitterUser}\n\n`
        })}`
      ),

    edit: (slug: Slug) => ExternalRoute(`https://github.com/${githubUser}/website/edit/main/src/posts/${slug}.md`),

    discuss: (slug: Slug) =>
      ExternalRoute(
        `https://twitter.com/search?${new URLSearchParams({
          q: `${domain}/blog/${slug}`
        })}`
      )
  },

  routes: {
    home: Route('/'),
    tag: (tag: Tag) => {
      const query = Tag.toQuery(Tag.unique(useQueryTags().concat(tag)));
      return Route(`/?${query}`);
    },
    untag: (tag: Tag) => {
      const query = Tag.toQuery(useQueryTags().filter((t) => t !== tag));
      if (query.length === 0) {
        return Route('/');
      } else {
        return Route(`/?${query}`);
      }
    },
    blog: (slug: Slug) => Route(`/blog/${slug}`)
  }
};
