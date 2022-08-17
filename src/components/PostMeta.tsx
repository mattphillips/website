import classNames from "classnames";
import { format } from "date-fns";
import { Duration } from "src/articles/Articles";

type PostMeta = { date: Date; duration: Duration; className?: string };

export const PostMeta = ({ date, duration, className }: PostMeta) => (
  <div className={classNames(className, "font-body text-gray-500 dark:text-gray-400 font-semibold text-center")}>
    <span>{format(date, "dd MMMM, yyyy")}</span>
    <span className="mx-4">•</span>
    <span>{duration}</span>
  </div>
);
