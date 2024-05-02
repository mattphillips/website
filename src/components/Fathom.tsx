'use client';

import { load, trackPageview } from 'fathom-client';
import { usePathname, useSearchParams } from 'next/navigation';
import * as React from 'react';

function TrackPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Load the Fathom script on mount
  React.useEffect(() => {
    load('SOXPNAPR', {
      auto: false
    });
  }, []);

  // Record a pageview when route changes
  React.useEffect(() => {
    if (!pathname) return;

    trackPageview({
      url: pathname + searchParams.toString(),
      referrer: document.referrer
    });
  }, [pathname, searchParams]);

  return null;
}

export const Fathom = () => (
  <React.Suspense fallback={null}>
    <TrackPageView />
  </React.Suspense>
);
