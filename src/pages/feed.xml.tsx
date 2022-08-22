import RSS from "rss";
import { GetServerSideProps } from "next";
import { FsArticles } from "src/articles/FsArticles";
import { config } from "src/config";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const feed = new RSS({
    title: "Matt Phillips",
    site_url: config.domain,
    feed_url: `${config.domain}/feed.xml`,
  });

  await new FsArticles().list
    .tap((posts) =>
      posts.forEach((post) => {
        feed.item({
          title: post.title,
          url: `${config.domain}/blog/${post.slug}`,
          date: post.date,
          description: post.description,
        });
      })
    )
    .toPromise();

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=1200, stale-while-revalidate=600");
  res.write(feed.xml({ indent: true }));
  res.end();

  return {
    props: {},
  };
};

export default function RSSFeed() {
  return null;
}