/* eslint-disable @typescript-eslint/restrict-template-expressions */

import { Nominal } from 'ts-prelude/Nominal';

import { Slug, Src, Tag, Title } from './articles/Articles';

const domain = 'https://mattphillips.io';
const twitterUser = 'mattphillipsio';
const linkedInUser = 'mattphillipsio';
const githubUser = 'mattphillips';
const authorName = 'Matt Phillips';

export type Route = Nominal<string, { readonly Route: unique symbol }>;
const Route = Nominal<Route>();

export type ExternalRoute = Nominal<string, { readonly ExternalRoute: unique symbol }>;
const ExternalRoute = Nominal<ExternalRoute>();

export const config = {
  author: {
    name: authorName,
    twitter: twitterUser,
    github: githubUser,
    linkedIn: linkedInUser
  },

  routes: {
    home: Route('/'),
    tag: (query: Tag.Query) => {
      if (query.length === 0) {
        return Route('/');
      } else {
        return Route(`/?${query}`);
      }
    },
    blog: (slug: Slug) => Route(`/blog/${slug}`),
    id: (id: string) => Route(`#${id}`)
  },

  urls: {
    home: domain,
    blog: (slug: Slug) => `${domain}/blog/${slug}`,
    ogImage: (src: Src) => `${domain}${src}`,
    profileImage: `${domain}/profile.jpg`,
    sitemap: `${domain}/sitemap.xml`,
    rss: `${domain}/feed.xml`,

    external: {
      social: {
        twitter: ExternalRoute(`https://twitter.com/${twitterUser}`),
        github: ExternalRoute(`https://github.com/${githubUser}`),
        linkedIn: ExternalRoute(`https://linkedin.com/in/${linkedInUser}`)
      },

      openSource: {
        jest: {
          website: ExternalRoute('https://jestjs.io'),
          github: ExternalRoute('https://github.com/jestjs/jest')
        },
        jestCommunity: {
          github: ExternalRoute('https://github.com/jest-community')
        }
      },

      sponsor: ExternalRoute(`https://github.com/sponsors/${githubUser}`),

      interact: {
        follow: ExternalRoute(
          `https://twitter.com/intent/follow?${new URLSearchParams({
            screen_name: twitterUser
          })}`
        ),

        share: (slug: Slug, title: Title) =>
          ExternalRoute(
            `https://twitter.com/intent/tweet?${new URLSearchParams({
              url: `${domain}/blog/${slug}`,
              text: `I just read ${title} by @${twitterUser}\n\n`
            })}`
          ),

        edit: (slug: Slug) => ExternalRoute(`https://github.com/${githubUser}/website/edit/main/src/posts/${slug}.mdx`),

        discuss: (slug: Slug) =>
          ExternalRoute(
            `https://twitter.com/search?${new URLSearchParams({
              q: `${domain}/blog/${slug}`
            })}`
          )
      }
    }
  }
};
