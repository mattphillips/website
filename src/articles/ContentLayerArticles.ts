import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import reading from 'reading-time';
import { TagUnion } from 'ts-prelude/match';
import { IO, UIO } from 'ts-prelude/IO/fluent';
import { Maybe } from 'ts-prelude/Maybe';
import { eitherToResult } from 'ts-prelude/fp-ts-interop';
import { Refined } from 'ts-prelude/Refined';
import { SimpleNominal } from 'ts-prelude/Nominal';

import { allBlogs, Blog } from 'contentlayer/generated';
import { Articles, Article, Title, Summary, Src, Alt, Slug, Duration, MDX, PublishedAt } from './Articles';

const IterableToCodec = <A extends SimpleNominal<unknown>, Tag extends TagUnion>(
  refinement: Refined<A, Tag>
): t.Type<A> =>
  new t.Type(
    'ToCodec',
    refinement.is,
    (input, context) =>
      Symbol.iterator in Object(input)
        ? refinement.from(input).fold(
            (e) => t.failure(input, context, e.tag),
            (a) => t.success(a)
          )
        : t.failure(input, context, 'Not iterable'),
    t.identity
  );

const article = t.type({
  body: t.type({ code: IterableToCodec(MDX) }),
  publishedAt: tt.DateFromISOString,
  title: IterableToCodec(Title),
  slug: IterableToCodec(Slug),
  summary: IterableToCodec(Summary),
  image: t.type({
    src: IterableToCodec(Src),
    alt: IterableToCodec(Alt)
  })
});

const readEnv = (key: string): IO<Error, string> =>
  IO.suspend(() => IO.fromMaybe<Error, string>(new Error())(Maybe.fromNullable(process.env[key])));

const isProduction: UIO<boolean> = readEnv('NODE_ENV').fold(
  () => false,
  (env) => env === 'production'
);

export class ContentLayerArticles implements Articles {
  list: UIO<Array<Article>> = IO.sync<never, Array<Blog>>(() => allBlogs)
    .flatMapW((blogs) =>
      isProduction.tap((b) => console.log(b)).map((isProd) => blogs.filter((b) => (isProd ? !b.draft : true)))
    )
    .map((blogs) =>
      blogs
        .map((blog) => eitherToResult(article.decode(blog)))
        .reduce<Array<Article>>(
          (acc, a) =>
            a.fold<Array<Article>>(
              () => acc,
              (a) =>
                acc.concat({
                  publishedAt: PublishedAt(a.publishedAt),
                  description: a.summary,
                  image: a.image,
                  title: a.title,
                  mdx: a.body.code,
                  slug: a.slug,
                  duration: Duration(reading(a.body.code).text)
                })
            ),
          []
        )
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    );

  findBySlug = (slug: string): UIO<Maybe<Article>> =>
    this.list.map((articles) => Maybe.fromNullable(articles.find((a) => a.slug === slug)));
}
