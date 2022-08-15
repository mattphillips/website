import React from "react";
import classnames from "classnames";
import { Github, LinkedIn, Twitter } from "./icons";

const links = [
  { href: "https://twitter.com/mattphillipsio", title: "Twitter", icon: <Twitter /> },
  { href: "https://github.com/mattphillips", title: "Github", icon: <Github /> },
  { href: "https://linkedin.com/in/mattphillipsio", title: "LinkedIn", icon: <LinkedIn /> },
];

export const SocialLinks: React.FC<{ className?: string }> = ({ className }) => (
  <div className={classnames(className, "flex flex-row justify-center")}>
    {links.map(({ href, icon, title }) => (
      <a href={href} target="_blank" title={title} rel="noopener" key={title}>
        <div className="p-3 transition-transform transform hover:scale-125">{icon}</div>
      </a>
    ))}
  </div>
);
