import * as t from "io-ts";
import * as tt from "io-ts-types";
import matter from "gray-matter";
import reading from "reading-time";
import { IO, UIO } from "ts-prelude/IO/fluent";
import { Maybe } from "ts-prelude/Maybe";
import { eitherToResult } from "ts-prelude/fp-ts-interop";
import { Refined } from "ts-prelude/Refined";
import { SimpleNominal } from "ts-prelude/Nominal";

import fs from "fs";
import path from "path";

import { Articles, Article, Title, Description, Src, Alt, Name, Url, Slug, Duration } from "./Articles";
import { Markdown, toHtml } from "src/Markdown";

// TODO: Move to ts-prelude
// TODO: any -> TagUnion
const IterableToCodec = <A extends SimpleNominal<unknown>>(refinement: Refined<A, any>): t.Type<A> =>
  new t.Type(
    "ToCodec",
    refinement.is,
    (input, context) =>
      Symbol.iterator in Object(input)
        ? refinement.from(input).fold(
            (e) => t.failure(input, context, e.tag),
            (a) => t.success(a)
          )
        : t.failure(input, context, "Not iterable"),
    t.identity
  );

const article = t.type({
  markdown: IterableToCodec(Markdown),
  date: tt.DateFromISOString,
  title: IterableToCodec(Title),
  description: IterableToCodec(Description),
  image: t.type({
    src: IterableToCodec(Src),
    alt: IterableToCodec(Alt),
  }),
});

const readFile = IO.ioify<fs.PathLike, BufferEncoding, NodeJS.ErrnoException, string>(fs.readFile);
const readDir = IO.ioify<fs.PathLike, NodeJS.ErrnoException, string[]>(fs.readdir);
const readEnv = (key: string): IO<Error, string> =>
  IO.suspend(() => IO.fromMaybe<Error, string>(new Error())(Maybe.fromNullable(process.env[key])));

const isDevelopment: UIO<boolean> = readEnv("NODE_ENV").fold(
  () => false,
  (env) => env === "development"
);

// TODO: Inject this into the cap
const postsDirectory = path.join("src", "posts");
const draftsDirectory = path.join("src", "drafts");

export class FsArticles implements Articles {
  list: UIO<Array<Article>> = IO.suspend(() =>
    readDir(postsDirectory)
      .flatMap((posts) =>
        isDevelopment.flatMapW((dev) =>
          dev ? readDir(draftsDirectory).map((drafts) => posts.concat(drafts)) : IO.succeed(posts)
        )
      )
      .orDie()
      .flatMap(IO.traverse(this.findBySlug))
      .map((as) =>
        as
          .reduce<Array<Article>>((acc, a) => a.fold(acc, (a) => acc.concat(a)), [])
          .sort((a, b) => b.date.getTime() - a.date.getTime())
      )
  );

  findBySlug = (slug: string): UIO<Maybe<Article>> =>
    readFile(path.join(postsDirectory, slug), "utf-8")
      .catchError((e) =>
        isDevelopment.flatMapW((dev) => (dev ? readFile(path.join(draftsDirectory, slug), "utf-8") : IO.fail(e)))
      )
      .orDie()
      .map(matter)
      .flatMapW(({ data, content }) => IO.fromResult(eitherToResult(article.decode({ ...data, markdown: content }))))
      .tapError((es) =>
        console.log(
          "Unable to parse:",
          slug,
          "\nErrors at:\n ",
          es.map((e) => e.context.map((c) => c.key).join(".") + `: ${e.message}`).join("\n  ")
        )
      )
      .flatMapW((article) =>
        toHtml(article.markdown).map<Article>((html) => ({
          html,
          date: article.date,
          description: article.description,
          image: article.image,
          slug: Slug.unsafeFrom(slug.replace(".md", "")),
          title: article.title,
          duration: Duration(reading(article.markdown).text),
        }))
      )
      .fold(() => Maybe.nothing, Maybe.just);
}
