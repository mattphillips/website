import "../styles/globals.css";
import "../styles/prism-features.css";
import "../styles/light-code.css";
import "../styles/dark-code.css";
import "../styles/post.css";

import type { AppProps } from "next/app";
import { fromSerialisable } from "ts-prelude/Serialisable";
import { ThemeProvider } from "src/hooks/useTheme";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <Component {...fromSerialisable(pageProps)} />
    </ThemeProvider>
  );
}

export default MyApp;
