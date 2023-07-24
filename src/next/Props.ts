import {
  GetStaticPaths,
  GetStaticPathsContext,
  GetStaticProps,
  GetStaticPropsContext,
  GetStaticPropsResult
} from 'next';
import { IO, UIO } from 'ts-prelude/IO/fluent';
import { toSerialisable } from 'ts-prelude/Serialisable';
import { ParsedUrlQuery } from 'querystring';

export class NotFound extends Error {
  tag: 'NotFound' = 'NotFound';
}

export namespace Props {
  export const getStatic =
    <E extends NotFound | never, Props extends { [key: string]: any }, Params extends ParsedUrlQuery = ParsedUrlQuery>(
      f: (ctx: GetStaticPropsContext<Params>) => IO<E, Props>
    ): GetStaticProps<Props, Params> =>
    (ctx) =>
      f(ctx)
        .map((props) => ({ props: toSerialisable(props) as Props }))
        .mapError<GetStaticPropsResult<Props>>(() => ({ notFound: true }))
        .merge()
        .toPromise();
}

export namespace Paths {
  export const getStatic =
    <Params extends ParsedUrlQuery>(f: (ctx: GetStaticPathsContext) => UIO<Array<Params>>): GetStaticPaths<Params> =>
    (ctx) => {
      return f(ctx)
        .map((p) => p.map((params) => ({ params })))
        .map((paths) => ({ paths, fallback: false }))
        .toPromise();
    };
}
