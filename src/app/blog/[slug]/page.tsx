import { format } from 'date-fns';
import { Metadata } from 'next';
import { Balancer } from 'react-wrap-balancer';
import { Next } from 'src/app/next/Next';
import { Slug, Tag } from 'src/articles/Articles';
import { Button } from 'src/components/Button';
import { ExternalLink } from 'src/components/ExternalLink';
import { PostMeta } from 'src/components/PostMeta';
import { Posts } from 'src/components/Posts';
import { ProfileAvatar } from 'src/components/ProfileAvatar';
import { ScrollArea } from 'src/components/ScrollArea';
import { Tags } from 'src/components/Tags';
import { Thumbnail } from 'src/components/Thumbnail';
import { TableOfContents } from 'src/components/Toc';
import { Github, Twitter } from 'src/components/icons';
import { MDX } from 'src/components/mdx';
import { config } from 'src/config';
import { IO } from 'ts-prelude/IO/fluent';

export const generateStaticParams = () => Next.withCapabilities((capabilities) => capabilities.articles.list);

export const generateMetadata = Next.generateMetadata<{ slug: string }>(({ capabilities, params }) =>
  capabilities.articles
    .findBySlug(Slug.unsafeFrom(params.slug))
    .flatMapW(IO.fromMaybe(Next.Exception.of.NotFound({})))
    .map<Metadata>((post) => {
      const { title, publishedAt, description, image, slug } = post;

      // Pull domain in from config
      const ogImage = config.urls.ogImage(image.src);
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          type: 'article',
          publishedTime: format(publishedAt, 'yyyy-MM-dd'),
          url: config.urls.blog(slug),
          images: [
            {
              url: ogImage
            }
          ]
        },
        twitter: {
          card: 'summary',
          title,
          description,
          images: [ogImage]
        }
      };
    })
);

const Blog = Next.rsc<{ slug: string }>(({ capabilities, params }) =>
  IO.do(function* ($) {
    const slug = Slug.unsafeFrom(params.slug);
    const post = yield* $(
      capabilities.articles.findBySlug(slug).flatMapW(IO.fromMaybe(Next.Exception.of.NotFound({})))
    );
    const recommendations = yield* $(capabilities.articles.findRecommendations(slug));

    return (
      <>
        <div className="max-w-4xl mx-auto pt-16 relative">
          {/* Article */}
          <div className="px-6 lg:px-0">
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight text-center">
              <Balancer>{post.title}</Balancer>
            </h1>
            <PostMeta className="mb-8" duration={post.duration} publishedAt={post.publishedAt} />

            {post.tags.length > 0 && (
              <div className="mb-8">
                <Tags
                  tags={post.tags.map((tag) => ({ tag, type: 'Unselected', count: 0 }))}
                  onUnselected={(_) => config.routes.tag(Tag.toQuery([_]))}
                  onSelected={() => config.routes.tag(Tag.toQuery([]))}
                />
              </div>
            )}

            <Thumbnail src={post.image.src} alt={post.image.alt} priority />

            <article className="post mt-12 max-w-4xl mx-auto md:px-6">{<MDX code={post.mdx} />}</article>
          </div>

          {/* Share / edit */}
          <div className="px-6">
            <div className="border-y border-solid border-gray-200 dark:border-gray-500 py-6 md:px-6 my-12 grid md:grid-cols-2 gap-4 font-body font-semibold text-lg text-gray-600 dark:text-gray-300">
              <Button
                className="w-full md:w-1/2"
                variant="outline"
                size="sm"
                tag="ExternalLink"
                href={config.urls.external.interact.share(slug, post.title)}
              >
                Share article <Twitter className="w-4 h-4 ml-2" />
              </Button>
              <div className="flex flex-row md:justify-end items-center flex-wrap space-y-4 md:space-y-0">
                <Button
                  className="w-full md:flex-1"
                  variant="outline"
                  size="sm"
                  tag="ExternalLink"
                  href={config.urls.external.interact.discuss(slug)}
                >
                  Discuss article <Twitter className="w-4 h-4 ml-2" />
                </Button>
                <span className="hidden md:inline md:mx-4">•</span>
                <Button
                  className="w-full md:flex-1"
                  variant="default"
                  size="sm"
                  tag="ExternalLink"
                  href={config.urls.external.interact.edit(slug)}
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
                  <ExternalLink className="font-bold" href={config.urls.external.social.twitter}>
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
              {post.toc.enabled && (
                <>
                  <ScrollArea>
                    <TableOfContents headings={post.toc.headings} />
                  </ScrollArea>
                  <hr className="w-7 my-4" />
                </>
              )}

              <div className="space-y-4 flex flex-col">
                <Button
                  variant="outline"
                  size="sm"
                  tag="ExternalLink"
                  href={config.urls.external.interact.share(slug, post.title)}
                >
                  Share article <Twitter className="w-4 h-4 ml-2" />
                </Button>

                <Button variant="outline" size="sm" tag="ExternalLink" href={config.urls.external.interact.edit(slug)}>
                  Edit on GitHub
                  <Github className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended */}
        <div className="px-6 my-10">
          <div className="max-w-4xl mx-auto mb-12">
            <h3 className="text-center text-3xl font-display">
              <Balancer>Related posts that you may also enjoy</Balancer>
            </h3>
          </div>
          <Posts posts={recommendations} />
        </div>
      </>
    );
  })
);

export default Blog;
