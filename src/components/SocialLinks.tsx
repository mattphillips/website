import React from "react";
import classnames from "classnames";

import { config } from "src/config";
import { Github, LinkedIn, Twitter } from "./icons";

const links = [
  { href: config.social.twitter, title: "Twitter", icon: <Twitter /> },
  { href: config.social.github, title: "Github", icon: <Github /> },
  { href: config.social.linkedIn, title: "LinkedIn", icon: <LinkedIn /> },
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
