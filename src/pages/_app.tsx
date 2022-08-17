import "../styles/globals.css";
import "../styles/prism-features.css";
import "../styles/light-code.css";
import "../styles/dark-code.css";
import "../styles/post.css";

import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { fromSerialisable } from "ts-prelude/Serialisable";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Component {...fromSerialisable(pageProps)} />
    </ThemeProvider>
  );
}

export default MyApp;
