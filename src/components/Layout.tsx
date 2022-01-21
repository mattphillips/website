import Link from "next/link";
import React from "react";
import { SocialLinks } from "./SocialLinks";

export const Layout: React.FC = ({ children }) => (
  <>
    <header className="p-6 border-b border-solid border-gray-200">
      <div className="max-w-5xl mx-auto flex flex-row justify-between items-center bg-white">
        <Link passHref href="/">
          <a title="mattphillips.io">
            <span className="font-display text-xl md:text-2xl tracking-wider uppercase ">Matt Phillips</span>
          </a>
        </Link>
        <SocialLinks />
      </div>
    </header>
    <main>{children}</main>
    <footer className="bg-white p-4 sm:p-6 border-t border-solid border-gray-200">
      <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between">
        <div className="order-2">
          <SocialLinks className="fill-gray-400" />
        </div>
        <div className="mt-4 md:mt-0 md:order-1">
          <p className="text-center text-base text-gray-400">&copy; 2022 Matt Phillips. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </>
);
