'use client';

import { usePathname } from 'next/navigation';

export const NotFoundPathTitle = () => {
  const path = usePathname();

  return (
    <p className="font-body text-lg md:text-xl mb-4">
      <code>{path}</code> does not exist
    </p>
  );
};
