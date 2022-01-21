import React from "react";
import { Github, LinkedIn, Twitter } from "./icons";

export const SocialLinks: React.FC = () => (
  <div className="flex flex-row justify-center">
    <a href="https://twitter.com/mattphillipsio" target="_blank" title="Twitter" rel="noopener">
      <div className="mr-6">
        <Twitter />
      </div>
    </a>
    <a href="https://github.com/mattphillips" target="_blank" title="Github" rel="noopener">
      <div className="mr-6">
        <Github />
      </div>
    </a>
    <a href="https://linkedin.com/in/mattphillipsio" target="_blank" title="Linked" rel="noopener">
      <div className="">
        <LinkedIn />
      </div>
    </a>
  </div>
);
