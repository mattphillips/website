import '../styles/globals.css';
import '../styles/post.css';

import { getYear } from 'date-fns';
import { Metadata } from 'next';
import { Open_Sans, Playfair_Display } from 'next/font/google';

import { Action } from 'src/components/Action';
import { Button } from 'src/components/Button';
import { Fathom } from 'src/components/Fathom';
import { Rss } from 'src/components/icons';
import { SocialLinks } from 'src/components/SocialLinks';
import { ThemeButton } from 'src/components/ThemeButton';
import { config } from 'src/config';

import { Providers } from './Providers';

const playfairDispaly = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--display-font'
});

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--body-font'
});

const description = `Software engineer and founder from the UK with a passion for teaching all things software related, career development and building products.`;
const ogImage = config.urls.profileImage;
export const metadata: Metadata = {
  metadataBase: new URL(config.urls.home),
  title: {
    default: config.author.name,
    template: `%s | ${config.author.name}`
  },
  description,
  openGraph: {
    title: config.author.name,
    description,
    url: config.urls.home,
    siteName: config.author.name,
    locale: 'en-GB',
    type: 'website',
    images: [{ url: ogImage }]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  twitter: {
    title: config.author.name,
    card: 'summary_large_image',
    creator: `@${config.author.twitter}`,
    images: [{ url: ogImage }]
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      // Surpressed to satisify `next-themes` see: https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
      lang="en"
      className={`${playfairDispaly.variable} ${openSans.variable} h-full min-h-full antialiased`}
    >
      <body className="font-body flex h-full min-h-full flex-col">
        <Fathom />
        <Providers>
          <div className="flex flex-col h-full">
            {/* TODO: Pull out into a component */}
            <header className="p-4">
              <div className="relative max-w-5xl mx-auto flex flex-row justify-between items-center">
                <Action tag="Link" href={config.routes.home} title={config.urls.home}>
                  <span className="inline-block font-display bg-gray-800 dark:bg-white text-2xl font-semibold p-2 rounded text-white dark:text-gray-800 transition-all transform duration-300 hover:scale-110">
                    MP
                  </span>
                </Action>

                <div className="md:absolute md:top-1 md:right-1/2">
                  <ThemeButton />
                </div>

                <SocialLinks className="hidden md:flex" />

                <Button
                  tag="Link"
                  href={config.routes.id(config.ids.blog)}
                  variant="ghost"
                  className="md:hidden font-semibold"
                >
                  Blog
                </Button>
              </div>
            </header>

            <main className="flex-1">{children}</main>

            {/* Todo: pull into a component */}
            <footer className="p-4 sm:p-6 text-gray-600 dark:text-gray-300">
              <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between">
                <div className="order-2 flex items-center justify-center space-x-2">
                  <Button tag="ExternalLink" variant="ghost" size="grow" href={config.urls.rss}>
                    <Rss className="w-6 h-6" />
                    <span className="sr-only">rss feed</span>
                  </Button>

                  <SocialLinks />
                </div>
                <div className="mt-4 md:mt-0 md:order-1">
                  <p className="text-center text-base">
                    &copy; {getYear(new Date())} Matt Phillips. All rights reserved.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
