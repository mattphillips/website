import * as t from 'io-ts';
import * as tt from 'io-ts-types';
import * as A from 'fp-ts/Array';
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

  findRecommendations = (slug: string): UIO<Array<Article.Preview>> => {
    const { findBySlug, list } = this;
    return IO.do(function* ($) {
      const article = yield* $(findBySlug(slug).flatMapW(IO.fromMaybe(new Error())));

      const articles = yield* $(list);

      const matches = articles
        .reduce<Array<{ article: Article; score: number }>>((acc, a) => {
          if (a.slug === slug) return acc;

          const keywords = frequency(article.keywords, (_) => a.keywords.includes(_));
          const tags = frequency(article.tags, (_) => a.tags.includes(_));

          if (keywords === 0 && tags === 0) {
            return acc;
          } else {
            return acc.concat({
              article: a,
              // TODO: Figure out the best scoring algo keywords vs tags
              score: keywords + tags
            });
          }
        }, [])
        .sort((a, b) => b.score - a.score)
        .map((_) => _.article);

      const index = articles.findIndex((_) => _.slug === slug);

      // Note: `articles` is sorted by date so next would be at a lower index in the arry
      const next = Maybe.fromNullable(articles.slice(0, index).find((_) => !A.elem(Article.eq)(_)(matches)));
      const previous = Maybe.fromNullable(articles.slice(index + 1).find((_) => !A.elem(Article.eq)(_)(matches)));

      const fallback = next.fold([], (_) => [_]).concat(previous.fold([], (_) => [_]));

      return A.uniq(Article.eq)(matches.concat(fallback)).slice(0, 3).map(Article.toPreview);
    }).handleError(() => []);
  };
}

const frequency = <A>(as: Array<A>, p: (a: A) => boolean): number => as.reduce((acc, _) => (p(_) ? acc + 1 : acc), 0);
