import Head from 'next/head';
import { Maybe } from 'ts-prelude/Maybe';

import { Summary, Src, Title } from 'src/articles/Articles';
import { config } from 'src/config';

type SEO = {
  title: Maybe<Title>;
  slug: string;
  description: Summary;
  image: Src;
};

export const SEO = ({ title, slug, description, image }: SEO) => {
  const url = `${config.domain}/${slug}`;
  const displayTitle = title.map((t) => `${t} · Matt Phillips`).getOrElse('Matt Phillips');
  return (
    <Head>
      <title>{displayTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="follow, index" />

      <meta property="og:url" content={url} />
      <meta property="og:title" content={displayTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${config.domain}${image}`} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={config.twitterUser} />
      <meta name="twitter:description" content={description} />
      <meta property="twitter:image" content={`${config.domain}${image}`} />

      <link rel="canonical" href={url} />
    </Head>
  );
};
