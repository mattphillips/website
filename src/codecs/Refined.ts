import * as t from 'io-ts';
import { TagUnion } from 'ts-prelude/match';
import { Refined } from 'ts-prelude/Refined';
import { SimpleNominal } from 'ts-prelude/Nominal';

export const IterableToCodec = <A extends SimpleNominal<unknown>, Tag extends TagUnion>(
  refinement: Refined<A, Tag>
): t.Type<A> =>
  new t.Type(
    'IterableToCodec',
    refinement.is,
    (input, context) =>
      Symbol.iterator in Object(input)
        ? refinement.from(input).fold(
            (e) => t.failure(input, context, e.tag),
            (a) => t.success(a)
          )
        : t.failure(input, context, 'Not iterable'),
    t.identity
  );

export const NumberToCodec = <A extends SimpleNominal<unknown>, Tag extends TagUnion>(
  refinement: Refined<A, Tag>
): t.Type<A> =>
  new t.Type(
    'NumberToCodec',
    refinement.is,
    (input, context) =>
      refinement.from(input).fold(
        (e) => t.failure(input, context, e.tag),
        (a) => t.success(a)
      ),
    t.identity
  );
