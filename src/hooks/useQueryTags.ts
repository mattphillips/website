import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useRouter } from 'next/router';

import { Tag } from 'src/articles/Articles';
import { IterableToCodec } from 'src/codecs/Iterable';

const tagC = IterableToCodec(Tag);

const query = t.type({ t: t.union([tagC, t.array(tagC)]) });

export const useQueryTags = (): Array<Tag> => {
  const router = useRouter();

  return Tag.unique(
    pipe(
      query.decode(router.query),
      E.fold(
        () => [],
        (a) => (typeof a.t === 'string' ? [a.t] : a.t)
      )
    ).map(Tag.toLowerCase)
  );
};
