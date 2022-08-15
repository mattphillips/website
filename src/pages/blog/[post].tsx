import { GetStaticPaths, GetStaticProps } from "next";
import Image from "next/future/image";
import { format } from "date-fns";
import React from "react";
import { IO } from "ts-prelude/IO/fluent";
import { fromSerialisable, toSerialisable, ToSerialisable } from "ts-prelude/Serialisable";

import { Article } from "src/articles/Articles";
import { FsArticles } from "src/articles/FsArticles";
import { Layout } from "src/components/Layout";
import Head from "next/head";

const Post = (props: ToSerialisable<Article>) => {
  // TODO: Move `fromSerialisable` to _app
  const { html, title, date, duration, image, slug, description } = fromSerialisable<Article>(props);

  // Adapted from: https://css-tricks.com/syntax-highlighting-prism-on-a-next-js-site/
  const rootRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const allPres = rootRef.current!.querySelectorAll("pre");
    const cleanup: (() => void)[] = [];

    for (const pre of allPres) {
      const code = pre.firstElementChild;
      if (!code || !/code/i.test(code.tagName)) {
        continue;
      }

      const language = [...pre.classList.values()].find((it) => /language-/.test(it))?.replace(/language-/, "");

      pre.appendChild(createCopyButton(code));

      if (pre.parentNode !== null) {
        pre.parentNode.prepend(createLanguageLabel(language || ""));
      }

      const highlightRanges = pre.dataset.line;
      const lineNumbersContainer = pre.querySelector(".line-numbers-rows");

      if (!highlightRanges || !lineNumbersContainer) {
        continue;
      }

      const runHighlight = () => highlightCode(pre, highlightRanges, lineNumbersContainer);
      runHighlight();

      const ro = new ResizeObserver(runHighlight);
      ro.observe(pre);

      cleanup.push(() => ro.disconnect());
    }

    return () => cleanup.forEach((f) => f());
  }, []);

  return (
    <>
      <Head>
        {/* TODO: Extract this into a component and app config */}
        <title>{title} | Matt Phillips</title>
        <meta name="description" content={description} />
        <meta name="og:url" content={`https://mattphillips.io/blog/${slug}`} />
        <meta name="og:title" content={`${title} | Matt Phillips`} />
        <meta name="og:description" content={description} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:creator" content="mattphillipsio" />
        <meta name="twitter:description" content={description} />

        {image.fold(null, ({ src }) => (
          <>
            <meta property="og:image" content={src} />
            <meta property="twitter:image" content={src} />
          </>
        ))}
      </Head>
      <Layout>
        <div className="max-w-4xl mx-auto pt-16" ref={rootRef}>
          <div className="px-6 lg:px-0">
            {/* TODO: Extract this (same as homepage) */}
            <h1 className="font-display text-5xl md:text-7xl font-bold mb-8 leading-tight text-center text-gray-800">
              {title}
            </h1>
            <div className="font-body text- text-gray-500 font-semibold text-center mb-12">
              <span>{format(date, "dd MMMM, yyyy")}</span>
              <span className="mx-4">•</span>
              <span>{duration}</span>
            </div>

            {/* Extract into a component */}
            {/* TODO: Image should be required */}
            {image.fold(null, ({ alt, src, credit }) => (
              <figure className="">
                <Image src={src} alt={alt} className="rounded-lg shadow-2xl" width={3500} height={2403} />
                <figcaption className="text-xs text-gray-600 mt-2 hidden">Photo by: {credit.name}</figcaption>
              </figure>
            ))}

            <article className="post mt-12 max-w-4xl mx-auto md:px-6">
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </article>
          </div>

          <div className="px-6 bg-white">
            <div className="border-y border-solid border-gray-200 py-6 md:px-6 my-12 grid md:grid-cols-2 gap-4">
              {/* Create external link component */}
              <a
                href={`https://twitter.com/intent/tweet?${new URLSearchParams({
                  url: `https://mattphillips.io/blog/${slug}`,
                  text: `I just read ${title} by @mattphillipsio\n\n`,
                })}`}
                target="_blank"
                rel="noopener"
              >
                <div className="font-body font-semibold text-lg text-gray-600">Tweet this article</div>
              </a>

              <div className="flex flex-row md:justify-end items-center flex-wrap">
                <a
                  href={`https://twitter.com/search?${new URLSearchParams({
                    q: `https://mattphillips.io/blog/${slug}`,
                  })}`}
                  target="_blank"
                  rel="noopener"
                >
                  <div className="font-body font-semibold text-lg text-gray-600">Discuss on Twitter</div>
                </a>
                <span className="mx-2 md:mx-4">•</span>
                <a
                  href={`https://github.com/mattphillips/website/edit/main/src/posts/${slug}.md`}
                  target="_blank"
                  rel="noopener"
                >
                  <div className="font-body font-semibold text-lg text-gray-600">Edit on Github</div>
                </a>
              </div>
            </div>
          </div>

          <div className="px-6 bg-white">
            <div className="pb-12 md:px-6 border-b border-gray-200 grid items-center gap-6 md:grid-flow-col">
              <img
                className="rounded-full object-cover object-center w-40 h-40"
                src="/profile.webp"
                alt="Matt Phillips"
              />
              <div className="text-gray-800 ">
                <p className="text-4xl mb-4 font-display font-bold">Matt Phillips</p>
                <p className="font-body text-lg mb-4">
                  Experienced software engineer, Jest maintainer, OSS publisher. Writing about founding products,
                  teaching with code and building in public.
                </p>
                <p className="font-body text-lg">
                  Don’t miss out on on future posts, projects and products I’m building. Follow me over on Twitter{" "}
                  <a
                    href="https://twitter.com/mattphillipsio"
                    target="_blank"
                    title="Twitter"
                    rel="noopener"
                    className="font-bold"
                  >
                    @mattphillipsio
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export const getStaticProps: GetStaticProps<ToSerialisable<Article>, { post: string }> = (ctx) =>
  new FsArticles()
    .findBySlug(`${ctx.params!.post}.md`)
    .flatMapW(IO.fromMaybe(new Error("Slug not found")))
    .orDie()
    // TODO: Create `Props` constructor that does `toSerialisable`
    .map((props) => ({ props: toSerialisable(props) }))
    .toPromise();

export const getStaticPaths: GetStaticPaths = new FsArticles().list
  .map((articles) => articles.map((a) => a.slug))
  .map((slugs) => slugs.map((slug) => ({ params: { post: slug } })))
  .map((slugs) => ({ paths: slugs, fallback: false })).toPromise;

export default Post;

function highlightCode(pre: HTMLPreElement, highlightRanges: string, lineNumberRowsContainer: Element) {
  const ranges = highlightRanges.split(",").filter((val) => val);

  console.log(pre);
  const preWidth = pre.scrollWidth;

  for (const range of ranges) {
    let [start, end] = range.split("-");
    if (!start || !end) {
      start = range;
      end = range;
    }

    for (let i = +start; i <= +end; i++) {
      const lineNumberSpan: HTMLSpanElement | null = lineNumberRowsContainer.querySelector(`span:nth-child(${i})`);
      if (lineNumberSpan !== null) {
        lineNumberSpan.style.setProperty("--highlight-background", "rgb(100 100 100 / 0.1)");
        lineNumberSpan.style.setProperty("--highlight-width", `${preWidth}px`);
      }
    }
  }
}

function createCopyButton(codeEl: Element) {
  const button = document.createElement("button");
  button.classList.add("prism-copy-button");
  const copy = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
</svg>
  `;

  const tick = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
</svg>`;
  button.innerHTML = copy;

  button.addEventListener("click", () => {
    if (button.innerHTML === tick) {
      return;
    }
    navigator.clipboard.writeText(codeEl.textContent || "");
    button.innerHTML = tick;
    button.disabled = true;
    setTimeout(() => {
      button.innerHTML = copy;
      button.disabled = false;
    }, 3000);
  });

  return button;
}

function createLanguageLabel(language: string) {
  const div = document.createElement("div");
  div.classList.add("prism-language-label");

  div.innerHTML = language.toUpperCase();

  return div;
}
