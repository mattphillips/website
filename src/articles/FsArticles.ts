import * as t from "io-ts";
import * as tt from "io-ts-types";
import matter from "gray-matter";

import { IO, UIO } from "ts-prelude/IO/fluent";
import { Maybe, MaybeC } from "ts-prelude/Maybe";
import { eitherToResult } from "ts-prelude/fp-ts-interop";

import fs from "fs";
import path from "path";

import { Articles, Article } from "./Articles";

// TODO: Move to ts-prelude
const fromNullable = <A>(a: t.Type<A>) =>
  new t.Type<Maybe<A>, A | null, unknown>(
    "fromNullable",
    MaybeC(a).is,
    (input, context) => {
      if (input === null) {
        return t.success(Maybe.nothing);
      } else {
        const result = a.validate(input, context);
        if (result._tag === "Left") {
          return result;
        } else {
          return t.success(Maybe.just(result.right));
        }
      }
    },
    (ma) => ma.map(a.encode).toNullable
  );

const article = t.type({
  content: t.string,
  date: tt.DateFromISOString,
  title: t.string,
  description: t.string,
  image: fromNullable(
    t.type({
      src: t.string,
      alt: t.string,
      credit: t.type({
        name: t.string,
        url: t.string,
      }),
    })
  ),
});

const readFile = IO.ioify<fs.PathLike, BufferEncoding, NodeJS.ErrnoException, string>(fs.readFile);
const readDir = IO.ioify<fs.PathLike, NodeJS.ErrnoException, string[]>(fs.readdir);

// TODO: Inject this into the cap
const postsDirectory = path.join("src", "posts");

export class FsArticles implements Articles {
  list: UIO<Array<Article>> = IO.suspend(() =>
    readDir(postsDirectory)
      .orDie()
      .flatMap(IO.traverse(this.findBySlug))
      .map((as) => as.reduce<Array<Article>>((acc, a) => a.fold(acc, (a) => acc.concat(a)), []))
  );

  findBySlug = (slug: string): UIO<Maybe<Article>> =>
    readFile(path.join(postsDirectory, slug), "utf-8")
      .map(matter)
      .flatMapW(({ data, content }) => IO.fromResult(eitherToResult(article.decode({ ...data, content }))))
      .fold(
        () => Maybe.nothing,
        (a) => Maybe.just({ ...a, slug: slug.replace(".md", "") })
      );
}
