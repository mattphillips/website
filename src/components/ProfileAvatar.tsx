import classNames from "classnames";
import Image from "next/future/image";
import React from "react";

import me from "../../public/profile.webp";

type ProfileAvatar = { className?: string; priority?: boolean };

export const ProfileAvatar: React.FC<ProfileAvatar> = ({ className, priority = false }) => (
  <Image
    className={classNames(className, "object-cover object-center")}
    src={me}
    alt="Matt Phillips"
    priority={priority}
  />
);
