import { GetServerSideProps } from "next";
import { FsArticles } from "src/articles/FsArticles";
import { config } from "src/config";

const createSitemap = (slugs: Array<string>) => `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${slugs
          .map((slug) => {
            return `
                <url>
                    <loc>${`${config.domain}/${slug}`}</loc>
                </url>
            `;
          })
          .join("")}
    </urlset>
`;
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const allPosts = await new FsArticles().list.map((posts) => posts.map((p) => p.slug)).toPromise();
  const allPages = [...allPosts.map((slug) => `blog/${slug}`), ...[""]];

  res.setHeader("Content-Type", "text/xml");
  res.setHeader("Cache-Control", "public, s-maxage=1200, stale-while-revalidate=600");
  res.write(createSitemap(allPages));
  res.end();

  return {
    props: {},
  };
};

export default function Sitemap() {
  return null;
}
