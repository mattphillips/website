import Link from "next/link";
import React from "react";
import { config } from "src/config";
import { useTheme } from "src/hooks/useTheme";
import { Moon, Sun } from "./icons";
import { SocialLinks } from "./SocialLinks";

export const Layout: React.FC = ({ children }) => {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <header className="p-4 bg-white dark:bg-gray-800">
        <div className="max-w-5xl mx-auto flex flex-row justify-between items-center text-gray-800 dark:text-gray-50">
          <Link passHref href="/">
            <a title={config.domain}>
              <span className="inline-block font-display bg-gray-800 dark:bg-gray-50 text-2xl font-semibold p-2 rounded text-white dark:text-gray-800 transition-transform transform hover:scale-110">
                MP
              </span>
            </a>
          </Link>

          <button
            onClick={toggle}
            className="p-2 bg-gray-100 dark:bg-gray-700 flex items-center justify-center rounded-lg text-gray-800 dark:text-gray-50 transition-transform transform hover:scale-110"
          >
            {theme === "dark" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </button>
          <SocialLinks className="hidden md:flex" />
        </div>
      </header>
      <main className="flex-1 bg-white dark:bg-gray-800">{children}</main>
      <footer className="bg-white dark:bg-gray-800 p-4 sm:p-6">
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
