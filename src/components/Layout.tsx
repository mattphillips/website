import Link from "next/link";
import { useTheme } from "next-themes";
import React from "react";

import { config } from "src/config";
import { Moon, Sun } from "./icons";
import { SocialLinks } from "./SocialLinks";

export const Layout: React.FC = ({ children }) => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4">
        <div className="max-w-5xl mx-auto flex flex-row justify-between items-center">
          <Link passHref href="/">
            <a title={config.domain}>
              <span className="inline-block font-display bg-gray-800 dark:bg-white text-2xl font-semibold p-2 rounded text-white dark:text-gray-800 transition-all transform duration-300 hover:scale-110">
                MP
              </span>
            </a>
          </Link>

          <button
            aria-label="Toggle dark mode"
            type="button"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="bg-gray-100 dark:bg-gray-700 inline-flex items-center justify-center overflow-hidden rounded-lg p-2 md:transition-transform md:transform md:hover:scale-125"
          >
            <div className="relative h-6 w-6">
              <Sun className="absolute inset-0 rotate-90 transform transition-transform duration-700 dark:rotate-0 origin-[50%_40px]" />
              <Moon className="absolute inset-0 rotate-0 transform transition-transform duration-700 dark:-rotate-90 origin-[50%_40px]" />
            </div>
          </button>
          <SocialLinks className="hidden md:flex" />
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="p-4 sm:p-6">
        <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between">
          <div className="order-2">
            <SocialLinks className="text-gray-500 dark:text-gray-400" />
          </div>
          <div className="mt-4 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-500 dark:text-gray-400">
              &copy; 2022 Matt Phillips. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
