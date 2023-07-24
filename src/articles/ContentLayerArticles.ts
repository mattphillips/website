import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import reading from 'reading-time';
import { IO, UIO } from 'ts-prelude/IO/fluent';
import { Maybe } from 'ts-prelude/Maybe';
import { eitherToResult } from 'ts-prelude/fp-ts-interop';

import { allBlogs, Blog } from 'contentlayer/generated';
import {
  Articles,
  Article,
  Title,
  Summary,
  Src,
  Alt,
  Slug,
  Duration,
  MDX,
  PublishedAt,
  Tag,
  Keyword
} from './Articles';
import { IterableToCodec } from 'src/codecs/Iterable';

const article = t.type({
  body: t.type({ code: IterableToCodec(MDX), raw: t.string }),
  publishedAt: tt.DateFromISOString,
  title: IterableToCodec(Title),
  slug: IterableToCodec(Slug),
  summary: IterableToCodec(Summary),
  image: t.type({
    src: IterableToCodec(Src),
    alt: IterableToCodec(Alt)
  }),
  tags: t.array(IterableToCodec(Tag)),
  keywords: t.array(IterableToCodec(Keyword))
});

const readEnv = (key: string): IO<Error, string> =>
  IO.suspend(() => IO.fromMaybe<Error, string>(new Error())(Maybe.fromNullable(process.env[key])));

const isProduction: UIO<boolean> = readEnv('NODE_ENV').fold(
  () => false,
  (env) => env === 'production'
);

export class ContentLayerArticles implements Articles {
  list: UIO<Array<Article>> = IO.sync<never, Array<Blog>>(() => allBlogs)
    .flatMapW((blogs) => isProduction.map((isProd) => blogs.filter((b) => (isProd ? !b.draft : true))))
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
                  duration: Duration(reading(a.body.raw).text),
                  tags: a.tags.map(Tag.toLowerCase),
                  keywords: a.keywords
                })
            ),
          []
        )
        .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
    );

  findBySlug = (slug: string): UIO<Maybe<Article>> =>
    this.list.map((articles) => Maybe.fromNullable(articles.find((a) => a.slug === slug)));
}
