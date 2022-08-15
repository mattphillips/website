import "../styles/globals.css";
import "../styles/prism-features.css";
import "../styles/github.css";
import "../styles/post.css";

import type { AppProps } from "next/app";
import { fromSerialisable } from "ts-prelude/Serialisable";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...fromSerialisable(pageProps)} />;
}

export default MyApp;
