import React from "react";
import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document<{ theme: string }> {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Open+Sans:wght@300;400;600;700&display=swap"
            rel="stylesheet"
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            window.ga=window.ga||function(){(ga.q = ga.q || []).push(arguments)};ga.l=+new Date; ga('create',
            'UA-76782135-1', 'auto'); ga('send', 'pageview');
            `,
            }}
          />
          <script async src="https://www.google-analytics.com/analytics.js"></script>
        </Head>
        <body>
          <Main />

          <NextScript />
        </body>
      </Html>
    );
  }
}
export default MyDocument;
