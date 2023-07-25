import { IO } from 'ts-prelude/IO/fluent';

import { RSC } from 'src/app/next/RSC';
import { ProfileAvatar } from 'src/components/ProfileAvatar';
import { FilterablePosts } from '../components/FilterablePosts';

const Home = RSC.withCapabilities(({ capabilities }) =>
  IO.do(function* ($) {
    const posts = yield* $(capabilities.articles.list);

    return (
      <>
        {/* Profile intro */}
        <div className="px-6">
          <div className="max-w-5xl mx-auto pt-4 pb-12 md:py-12 flex flex-col-reverse md:flex-row items-center justify-center border-b border-gray-200 dark:border-gray-500">
            <div className="mt-4 md:mt-0 md:mr-8 md:w-1/2">
              <span className="text-3xl md:text-5xl font-display font-bold">
                Hi <span className="animate-wave inline-block origin-[70%_70%]">👋</span>, I'm
              </span>
              <h1 className="text-5xl md:text-7xl mt-4 mb-4 md:mb-8 font-display font-bold">Matt Phillips</h1>

              <p className="font-body text-lg mb-4">
                Experienced software engineer in open-source, managing teams and building products. I help to maintain
                Jest and Jest Community packages and have recently founded a learn-to-drive startup.
              </p>

              <p className="font-body text-lg">
                Here I write about all things code. You can expect to learn more about Typescript, Node, React, Testing
                and Functional Programming – with some content on career development and founding products thrown in
                too.
              </p>
            </div>
            <ProfileAvatar className="rounded-full h-56 w-56 md:h-72 md:w-72" priority />
          </div>
        </div>

        <div className="my-10">
          <FilterablePosts posts={posts} />
        </div>
      </>
    );
  })
);

export default Home;
