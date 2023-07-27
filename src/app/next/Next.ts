import { Metadata } from 'next';
import { RedirectType } from 'next/dist/client/components/redirect';
import { notFound, redirect } from 'next/navigation';
import { IO, UIO } from 'ts-prelude/IO/fluent';
import { TaggedUnion } from 'ts-prelude/TaggedUnion';

import { Articles } from 'src/articles/Articles';
import { ContentLayerArticles } from 'src/articles/ContentLayerArticles';
import { Route } from 'src/config';

type SearchParams = Record<string, string | string[] | undefined>;
type PathParams = Record<string, string>;

interface Capabilities {
  articles: Articles;
}

export namespace Next {
  type Props<P extends PathParams> = { params: P; searchParams: SearchParams };
  type CapabilitiesProps<P extends PathParams> = { capabilities: Capabilities } & Props<P>;

  type Exception = TaggedUnion<{
    NotFound: {};
    Redirect: { route: Route; type?: 'replace' | 'push' };
  }>;
  export const Exception = TaggedUnion<Exception>(['NotFound', 'Redirect']);

  const genericExceptionHandler = Exception.match({
    NotFound: notFound,
    Redirect: ({ route, type }) => redirect(route, type && RedirectType[type])
  });

  export const rsc =
    <P extends PathParams, E extends Exception = Exception>(f: (p: CapabilitiesProps<P>) => IO<E, JSX.Element>) =>
    (p: Props<P>): Promise<JSX.Element> =>
      withCapabilities((capabilities) => f({ capabilities, ...p }).mapError(genericExceptionHandler));

  export const route =
    <P extends PathParams, R extends Request, E extends Exception = Exception>(
      f: (p: CapabilitiesProps<P> & { request: R }) => IO<E, Response>
    ) =>
    (request: R, p: Props<P>): Promise<Response> =>
      withCapabilities((capabilities) => f({ capabilities, request, ...p }).mapError(genericExceptionHandler));

  export const generateMetadata =
    <P extends PathParams, E extends Exception = Exception>(f: (p: CapabilitiesProps<P>) => IO<E, Metadata>) =>
    (p: Props<P>): Promise<Metadata> =>
      withCapabilities((capabilities) => f({ capabilities, ...p }).mapError(genericExceptionHandler));

  export const withCapabilities = <A>(f: (capabilities: Capabilities) => UIO<A>): Promise<A> => {
    const articles = new ContentLayerArticles();
    const capabilities = { articles };
    return f(capabilities).toPromise();
  };
}
