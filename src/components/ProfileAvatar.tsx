import Image from 'next/image';
import React from 'react';

import { cn } from 'src/styles/cn';

import me from '../../public/profile.webp';

type ProfileAvatar = { className?: string; priority?: boolean };

export const ProfileAvatar: React.FC<ProfileAvatar> = ({ className, priority = false }) => (
  <Image className={cn(className, 'object-cover object-center')} src={me} alt="Matt Phillips" priority={priority} />
);
