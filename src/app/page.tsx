import { Balancer } from 'react-wrap-balancer';
import { IO } from 'ts-prelude/IO/fluent';

import { Button } from 'src/components/Button';
import { Github, Twitter } from 'src/components/icons';
import { ProfileAvatar } from 'src/components/ProfileAvatar';
import { config } from 'src/config';

import { FilterablePosts } from '../components/FilterablePosts';

import { Next } from './next/Next';

const Home = Next.rsc(({ capabilities }) =>
  IO.do(function* ($) {
    const posts = yield* $(capabilities.articles.list);

    return (
      <div className="px-6">
        <div className="max-w-7xl mx-auto pt-4 pb-12 md:py-12 flex flex-col-reverse md:flex-row items-center justify-center border-b border-gray-200 dark:border-gray-500">
          <div className="mt-4 md:mt-0 md:mr-8 md:w-1/2">
            <span className="text-3xl md:text-5xl font-display font-bold">
              Hey there <span className="animate-wave inline-block origin-[70%_70%]">👋</span>, I&apos;m
            </span>
            <h1 className="text-5xl md:text-7xl mt-4 mb-4 md:mb-8 font-display font-bold">Matt Phillips.</h1>
            <div className="space-y-4 text-lg font-medium">
              <p>Software engineer, founder, perpetual learner, and mentor from the UK.</p>
              <p>
                If I&apos;m not tinkering on my own products, I&apos;m working on open-source. I&apos;ve published
                multiple successful packages and most notably helped maintain{' '}
                <Button
                  tag="ExternalLink"
                  variant="link"
                  size="link"
                  href={config.urls.external.openSource.jest.website}
                >
                  Jest
                </Button>{' '}
                and the{' '}
                <Button
                  tag="ExternalLink"
                  variant="link"
                  size="link"
                  href={config.urls.external.openSource.jestCommunity.github}
                >
                  Jest Community
                </Button>
                .
              </p>
              <p>
                Here I write about all things code. You can expect to learn more about Typescript, Node, React, Testing
                and Functional Programming – with some content on career development and founding products thrown in
                too.
              </p>
              <p>
                If you want to help support my work please consider sponsoring me over on{' '}
                <Button tag="ExternalLink" variant="link" size="link" href={config.urls.external.sponsor}>
                  <Github className="w-3 h-3 mr-1" />
                  GitHub
                </Button>
                .
              </p>
            </div>
          </div>
          <ProfileAvatar className="rounded-full h-56 w-56 md:h-72 md:w-72" priority />
        </div>

        <div className="my-10 max-w-7xl mx-auto">
          <h2 className="text-center text-3xl font-display mb-8" id={config.ids.blog}>
            <Balancer>Blog</Balancer>
          </h2>
          <FilterablePosts posts={posts} />
        </div>

        <div className="my-10 max-w-7xl mx-auto border-y border-gray-200 dark:border-gray-500 py-8">
          <div className="mx-auto text-center">
            <p className="font-medium text-lg text-center mb-4">
              <Balancer>
                Want to keep up to date with everything I&apos;m working on? Then follow me over on Twitter.
              </Balancer>
            </p>
            <Button size="lg" variant="default" tag="ExternalLink" href={config.urls.external.interact.follow}>
              <Twitter className="w-4 h-4 mr-2" />
              Follow me
            </Button>
          </div>
        </div>
      </div>
    );
  })
);

export default Home;
