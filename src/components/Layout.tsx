import Link from "next/link";
import { useTheme } from "next-themes";
import React from "react";

import { config } from "src/config";
import { Moon, Sun } from "./icons";
import { SocialLinks } from "./SocialLinks";

export const Layout: React.FC = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  const { resolvedTheme, setTheme } = useTheme();

  React.useEffect(() => setMounted(true), []);

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
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="p-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg transition-transform transform hover:scale-110"
          >
            {mounted && (resolvedTheme === "dark" ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />)}
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
