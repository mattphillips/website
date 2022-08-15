import { GetStaticPaths, GetStaticPathsContext, GetStaticProps, GetStaticPropsContext } from "next";
import { UIO } from "ts-prelude/IO/fluent";
import { toSerialisable } from "ts-prelude/Serialisable";
import { ParsedUrlQuery } from "querystring";

export namespace Props {
  export const getStatic =
    <Props, Params extends ParsedUrlQuery = ParsedUrlQuery>(
      f: (ctx: GetStaticPropsContext<Params>) => UIO<Props>
    ): GetStaticProps<Props, Params> =>
    (ctx) =>
      f(ctx)
        .map((props) => ({ props: toSerialisable(props) as Props }))
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
