import { remark } from "remark";
import html from "remark-html";
import prism from "remark-prism";
import { IO, UIO } from "ts-prelude/IO/fluent";
import { Nominal } from "ts-prelude/Nominal";
import { Refined } from "ts-prelude/Refined";

export type Markdown = Nominal<string, { readonly Markdown: unique symbol }>;
export const Markdown = Refined.Iterable.MinLength.refinement<Markdown>(0);

export type Html = Nominal<string, { readonly Html: unique symbol }>;
export const Html = Refined.Iterable.MinLength.refinement<Html>(0);

export const toHtml = (markdown: Markdown): UIO<Html> =>
  IO.fromPromiseOrDie(() =>
    remark()
      .use(html, { sanitize: false })
      // @ts-ignore
      .use(prism)
      .process(markdown)
  ).flatMap((file) => IO.fromResult(Html.from(file.toString())).orDie());
