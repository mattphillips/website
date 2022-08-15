import React from "react";

type ExternalLink = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "target" | "rel">;

export const ExternalLink: React.FC<ExternalLink> = ({ ...props }) => <a {...props} target="_blank" rel="noopener" />;
