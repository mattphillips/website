import RSS from 'rss';
import { config } from 'src/config';
import { RSC } from '../next/RSC';

export async function GET() {
  // TODO: Create specific Next functions powered by `withCapabilities` i.e. `RSC.GET`/`RSC.generateMetadata` etc
  return RSC.withCapabilities(({ capabilities }) => {
    const feed = new RSS({
      title: config.author.name,
      site_url: config.urls.home,
      feed_url: config.urls.rss
    });

    return capabilities.articles.list
      .tap((posts) =>
        posts.forEach((post) => {
          feed.item({
            title: post.title,
            url: config.urls.blog(post.slug),
            date: post.publishedAt,
            description: post.description,
            categories: post.tags,
            author: config.author.name
          });
        })
      )
      .map(
        () =>
          new Response(feed.xml({ indent: true }), {
            headers: {
              'Content-Type': 'application/atom+xml; charset=utf-8'
            }
          })
      );
  })({ params: {} });
}
