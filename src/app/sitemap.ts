import { format } from 'date-fns';

import { config } from 'src/config';

import { Next } from './next/Next';

const sitemap = () =>
  Next.withCapabilities((capabilities) =>
    capabilities.articles.list.map((posts) => {
      const allPosts = posts.map((post) => ({
        url: config.urls.blog(post.slug),
        lastModified: formatDate(post.publishedAt)
      }));

      const routes = [config.urls.home].map((url) => ({
        url,
        lastModified: formatDate(new Date())
      }));

      return [...routes, ...allPosts];
    })
  );

const formatDate = (d: Date): string => format(d, 'yyyy-MM-dd');

export default sitemap;
