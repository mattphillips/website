import { UIO } from "ts-prelude/IO/fluent";
import { Maybe } from "ts-prelude/Maybe";
import { Nominal } from "ts-prelude/Nominal";
import { Refined } from "ts-prelude/Refined";

import { Html } from "src/Markdown";

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

export type Name = Nominal<string, { readonly Name: unique symbol }>;
export const Name = Refined.Iterable.MinLength.refinement<Name>(0);

export type Url = Nominal<string, { readonly Url: unique symbol }>;
export const Url = Refined.Iterable.MinLength.refinement<Url>(0);

export type Title = Nominal<string, { readonly Title: unique symbol }>;
export const Title = Refined.Iterable.MinLength.refinement<Title>(2);

export type Description = Nominal<string, { readonly Description: unique symbol }>;
export const Description = Refined.Iterable.MinLength.refinement<Description>(0);

export type Duration = Nominal<string, { readonly Duration: unique symbol }>;
export const Duration = Nominal<Duration>();

type Image = { src: Src; alt: Alt };

export type Article = {
  slug: Slug;
  html: Html;
  date: Date;
  title: Title;
  description: Description;
  duration: Duration;
  image: Image;
};
