import "../styles/globals.css";
import "../styles/prism-line-numbers.css";
import "../styles/github.css";
import "../styles/post.css";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
