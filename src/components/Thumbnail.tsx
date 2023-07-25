import React from 'react';
import { Alt, Src } from 'src/articles/Articles';
import Image from 'next/image';

type Thumbnail = { className?: string; src: Src; alt: Alt; priority?: boolean };

export const Thumbnail: React.FC<Thumbnail> = ({ src, alt, priority = false }) => (
  <Image src={src} alt={alt} className="rounded-lg shadow-xl" width={1400} height={875} priority={priority} />
);
