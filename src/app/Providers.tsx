'use client';

import { ThemeProvider } from 'next-themes';
import React from 'react';

type Props = { children: React.ReactNode };

export const Providers = ({ children }: Props) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
};
