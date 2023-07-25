import { config } from 'src/config';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*'
      }
    ],
    sitemap: config.urls.sitemap,
    host: config.urls.home
  };
}
