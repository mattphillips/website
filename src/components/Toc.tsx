'use client';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import React from 'react';

import { Toc } from 'src/articles/Articles';
import { config } from 'src/config';
import { cn } from 'src/styles/cn';

import { Action } from './Action';
import { Button } from './Button';

type Props = {
  headings: Array<Toc.Heading>;
};

export const TableOfContents = ({ headings }: Props) => {
  const [activeHeading, setActiveHeading] = React.useState('');

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveHeading(entry.target.id);
          }
        });
      },
      { rootMargin: `0% 0% -80% 0%` }
    );

    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <nav className="text-sm text-foreground/80 hover:text-foreground transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-foreground font-medium">On this page</span>
        <Button tag="Button" variant="ghost" size="icon" onClick={scrollToTop}>
          <span className="sr-only">Scroll to top</span>
          <ArrowUpIcon className="w-4 h-4" />
        </Button>
      </div>
      <ul className="space-y-2">
        {headings.map(({ content, id, level }) => {
          return (
            <li
              key={id}
              className={cn('', {
                'pl-2': level === 2,
                'pl-4': level === 3,
                'pl-6': level === 4,
                'pl-8': level === 5,
                'pl-10': level === 6
              })}
            >
              <Action
                className={cn('text-foreground/80 hover:text-foreground transition-colors', {
                  'font-bold': activeHeading === id
                })}
                tag="Link"
                href={config.routes.id(id)}
              >
                {content}
              </Action>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
