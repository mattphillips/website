import { GetStaticPaths, GetStaticProps } from 'next';
import React from 'react';
import { Maybe } from 'ts-prelude/Maybe';
import { IO } from 'ts-prelude/IO/fluent';
import Balancer from 'react-wrap-balancer';

import { Article, Slug } from 'src/articles/Articles';
import { Layout } from 'src/components/Layout';
import { Thumbnail } from 'src/components/Thumbnail';
import { SEO } from 'src/components/Seo';
import { PostMeta } from 'src/components/PostMeta';
import { ExternalLink } from 'src/components/ExternalLink';
import { config } from 'src/config';
import { ProfileAvatar } from 'src/components/ProfileAvatar';
import { NotFound, Paths, Props } from 'src/next/Props';
import { ContentLayerArticles } from 'src/articles/ContentLayerArticles';
import { MDX } from 'src/components/mdx';
import { TagButton } from 'src/components/TagButton';
import { Posts } from 'src/components/Posts';
import { ScrollArea } from 'src/components/ScrollArea';
import { Button } from 'src/components/Button';
import { TableOfContents } from 'src/components/Toc';
import { Github, Twitter } from 'src/components/icons';

type Props = { article: Article; recommendations: Array<Article.Preview> };

export default function Post({
  article: { description, duration, image, mdx, publishedAt, slug, title, tags, toc },
  recommendations
}: Props) {
  return (
    <>
      <SEO title={Maybe.just(title)} slug={`/blog/${slug}`} description={description} image={image.src} />
      <Layout>
        <div className="max-w-4xl mx-auto pt-16 relative">
          {/* Article */}
          <div className="px-6 lg:px-0">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight text-center">
              <Balancer>{title}</Balancer>
            </h1>
            <PostMeta className="mb-12" duration={duration} publishedAt={publishedAt} />

            {tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2.5 my-10">
                {tags.map((tag) => (
                  <TagButton key={tag} type="Unselected" count={0} tag={tag} />
                ))}
              </div>
            )}

            <Thumbnail src={image.src} alt={image.alt} priority />

            <article className="post mt-12 max-w-4xl mx-auto md:px-6">
              <MDX code={mdx} />
            </article>
          </div>

          {/* Share / edit */}
          <div className="px-6">
            <div className="border-y border-solid border-gray-200 dark:border-gray-500 py-6 md:px-6 my-12 grid md:grid-cols-2 gap-4 font-body font-semibold text-lg text-gray-600 dark:text-gray-300">
              <Button
                className="w-full md:w-1/2"
                variant="outline"
                size="sm"
                tag="ExternalLink"
                href={config.interact.share(slug, title)}
              >
                Share article <Twitter className="w-4 h-4 ml-2" />
              </Button>
              <div className="flex flex-row md:justify-end items-center flex-wrap space-y-4 md:space-y-0">
                <Button
                  className="w-full md:flex-1"
                  variant="outline"
                  size="sm"
                  tag="ExternalLink"
                  href={config.interact.share(slug, title)}
                >
                  Discuss article <Twitter className="w-4 h-4 ml-2" />
                </Button>
                <span className="hidden md:inline md:mx-4">•</span>
                <Button
                  className="w-full md:flex-1"
                  variant="default"
                  size="sm"
                  tag="ExternalLink"
                  href={config.interact.edit(slug)}
                >
                  Edit on GitHub
                  <Github className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          {/* Author outro */}
          <div className="px-6">
            <div className="pb-12 md:px-6 border-b border-gray-200 dark:border-gray-500 grid items-center gap-6 md:grid-flow-col">
              <ProfileAvatar className="rounded-full h-40 w-40" />
              <div>
                <p className="text-4xl mb-4 font-display font-bold">Matt Phillips</p>

                <p className="font-body text-lg mb-4">
                  Open-source software engineer and tech founder with a passion for teaching all things software
                  related, career development and building products.
                </p>
                <p className="font-body text-lg">
                  Don’t miss out on on future posts, projects and products I’m working on by following me over on
                  Twitter{' '}
                  <ExternalLink className="font-bold" href={config.social.twitter}>
                    @mattphillipsio
                  </ExternalLink>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="absolute top-16 -right-64 h-full hidden xl:block">
            <div className="sticky top-16 w-56 shrink-0 overflow-y-hidden">
              {toc.enabled && (
                <>
                  <ScrollArea>
                    <TableOfContents headings={toc.headings} />
                  </ScrollArea>
                  <hr className="w-7 my-4" />
                </>
              )}

              <div className="space-y-4 flex flex-col">
                <Button variant="outline" size="sm" tag="ExternalLink" href={config.interact.share(slug, title)}>
                  Share article <Twitter className="w-4 h-4 ml-2" />
                </Button>

                <Button variant="outline" size="sm" tag="ExternalLink" href={config.interact.edit(slug)}>
                  Edit on GitHub
                  <Github className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div className="px-6">
          <div className="max-w-4xl mx-auto pt-16">
            <h3 className="text-center text-3xl font-display">Related posts that you may also enjoy</h3>
          </div>
          <Posts posts={recommendations} />
        </div>
      </Layout>
    </>
  );
}

export const getStaticProps: GetStaticProps<Props, { slug: Slug }> = Props.getStatic((ctx) =>
  IO.do(function* (_) {
    const articles = new ContentLayerArticles();
    const slug = ctx.params!.slug;
    const article = yield* _(articles.findBySlug(slug).flatMapW(IO.fromMaybe(new NotFound())));
    const recommendations = yield* _(articles.findRecommendations(slug));

    return { article, recommendations };
  })
);

export const getStaticPaths: GetStaticPaths<{ slug: Slug }> = Paths.getStatic(() =>
  new ContentLayerArticles().list.map((articles) => articles.map((_) => ({ slug: _.slug })))
);
