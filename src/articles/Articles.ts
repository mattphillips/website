import { UIO } from 'ts-prelude/IO/fluent';
import { Maybe } from 'ts-prelude/Maybe';
import { Nominal } from 'ts-prelude/Nominal';
import { Refined } from 'ts-prelude/Refined';

export interface Articles {
  list: UIO<Array<Article>>;

  findBySlug: (slug: string) => UIO<Maybe<Article>>;
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

export type Summary = Nominal<string, { readonly Summary: unique symbol }>;
export const Summary = Refined.Iterable.MinLength.refinement<Summary>(0);

export type Duration = Nominal<string, { readonly Duration: unique symbol }>;
export const Duration = Nominal<Duration>();

export type PublishedAt = Nominal<Date, { readonly PublishedAt: unique symbol }>;
export const PublishedAt = Nominal<PublishedAt>();

export type MDX = Nominal<string, { readonly MDX: unique symbol }>;
export const MDX = Refined.Iterable.MinLength.refinement<MDX>(0);

type Image = { src: Src; alt: Alt };

export type Article = {
  slug: Slug;
  mdx: MDX;
  publishedAt: PublishedAt;
  title: Title;
  description: Summary;
  duration: Duration;
  image: Image;
};
