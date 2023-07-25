import { notFound } from 'next/navigation';
import { IO } from 'ts-prelude/IO/fluent';
import { TaggedUnion } from 'ts-prelude/TaggedUnion';

import { Articles } from 'src/articles/Articles';
import { ContentLayerArticles } from 'src/articles/ContentLayerArticles';

type PropsObject = Record<string, string>;

interface Capabilities {
  articles: Articles;
}

export namespace RSC {
  interface Req<Params> {
    params: Params;
    capabilities: Capabilities;
    children?: React.ReactNode;
  }

  export type Exception = TaggedUnion<{
    NotFound: {};
  }>;

  export namespace Exception {
    const Exception = TaggedUnion<Exception>(['NotFound']);

    export const is = Exception.is;
    export const match = Exception.match;

    export const NotFound = Exception.of.NotFound({});
  }

  export const withCapabilities =
    <Params extends PropsObject, E extends Exception | never = Exception, A = JSX.Element>(
      f: (req: Req<Params>) => IO<E, A>
    ) =>
    async ({ params }: { params: Params }): Promise<A> => {
      return IO.do(function* (_) {
        const articles = new ContentLayerArticles();
        const capabilities = { articles };
        return yield* _(
          f({
            params,
            capabilities
          }).mapError(
            Exception.match({
              NotFound: () => notFound()
            })
          )
        );
      }).toPromise();
    };
}
