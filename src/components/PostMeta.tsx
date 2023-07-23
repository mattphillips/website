import { format } from 'date-fns';
import { Duration, PublishedAt } from 'src/articles/Articles';
import { cn } from 'src/styles/cn';

type PostMeta = { publishedAt: PublishedAt; duration: Duration; className?: string };

export const PostMeta = ({ publishedAt, duration, className }: PostMeta) => (
  <div className={cn(className, 'font-body text-gray-500 dark:text-gray-400 font-semibold text-center')}>
    <span>{format(publishedAt, 'dd MMMM, yyyy')}</span>
    <span className="mx-4">•</span>
    <span>{duration}</span>
  </div>
);
