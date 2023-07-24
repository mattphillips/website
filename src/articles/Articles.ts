import { Eq } from 'fp-ts/lib/Eq';
import { UIO } from 'ts-prelude/IO/fluent';
import { Maybe } from 'ts-prelude/Maybe';
import { Nominal } from 'ts-prelude/Nominal';
import { Refined } from 'ts-prelude/Refined';

export interface Articles {
  list: UIO<Array<Article>>;

  findBySlug: (slug: string) => UIO<Maybe<Article>>;

  findRecommendations: (slug: string) => UIO<Array<Article.Preview>>;
}

// TODO: These could be a lot stricter
export type Slug = Nominal<string, { readonly Slug: unique symbol }>;
export const Slug = Refined.Iterable.MinLength.refinement<Slug>(0);

export type Src = Nominal<string, { readonly Src: unique symbol }>;
export const Src = Refined.Iterable.MinLength.refinement<Src>(0);

export type Alt = Nominal<string, { readonly Alt: unique symbol }>;
export const Alt = Refined.Iterable.MinLength.refinement<Alt>(0);

export type Title = Nominal<string, { readonly Title: unique symbol }>;
export const Title = Refined.Iterable.MinLength.refinement<Title>(2);

export type Keyword = Nominal<string, { readonly Keyword: unique symbol }>;
export const Keyword = Refined.Iterable.MinLength.refinement<Keyword>(2);

export type Tag = Nominal<string, { readonly Tag: unique symbol }>;
export namespace Tag {
  const Tag = Refined.Iterable.MinLength.refinement<Tag>(2);
  export const from = Tag.from;
  export const handleError = Tag.handleError;
  export const is = Tag.is;
  export const unsafeFrom = Tag.unsafeFrom;
  export const minLength = Tag.minLength;

  export const toLowerCase = (t: Tag): Tag => Tag.unsafeFrom(t.toLowerCase());
  export const unique = (tags: Array<Tag>): Array<Tag> => [...new Set(tags).values()];
  export const toQuery = (tags: Array<Tag>): string => tags.map((t) => `t=${t}`).join('&');
}

export type Summary = Nominal<string, { readonly Summary: unique symbol }>;
export const Summary = Refined.Iterable.MinLength.refinement<Summary>(0);

export type Duration = Nominal<string, { readonly Duration: unique symbol }>;
export const Duration = Refined.Iterable.MinLength.refinement<Duration>(1);

export type PublishedAt = Nominal<Date, { readonly PublishedAt: unique symbol }>;
export const PublishedAt = Nominal<PublishedAt>();

export type MDX = Nominal<string, { readonly MDX: unique symbol }>;
export const MDX = Refined.Iterable.MinLength.refinement<MDX>(0);

type Image = { src: Src; alt: Alt };

export namespace Toc {
  export type Enabled = Nominal<boolean, { readonly Enabled: unique symbol }>;
  export const Enabled = Nominal<Enabled>();

  export type Content = Nominal<string, { readonly Content: unique symbol }>;
  export const Content = Refined.Iterable.MinLength.refinement<Content>(1);

  export type Id = Nominal<string, { readonly Id: unique symbol }>;
  export const Id = Refined.Iterable.MinLength.refinement<Id>(1);

  export type Level = Nominal<number, { readonly Level: unique symbol }>;
  export const Level = Refined.Number.GreaterEqual.refinement<Level>(1);

  export type Heading = { content: Content; id: Id; level: Level };
}

export type Toc = { headings: Array<Toc.Heading>; enabled: Toc.Enabled };

export type Article = {
  slug: Slug;
  mdx: MDX;
  publishedAt: PublishedAt;
  title: Title;
  description: Summary;
  duration: Duration;
  image: Image;
  tags: Array<Tag>;
  keywords: Array<Keyword>;
  toc: Toc;
};

export namespace Article {
  export type Preview = Omit.Strict<Article, 'keywords' | 'mdx' | 'tags' | 'toc'>;
  export const toPreview = ({ description, duration, image, publishedAt, slug, title }: Article): Preview => ({
    description,
    duration,
    image,
    publishedAt,
    slug,
    title
  });

  export const eq: Eq<Article> = {
    equals: (a, b) => a.slug === b.slug
  };
}
