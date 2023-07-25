'use client';

import * as E from 'fp-ts/Either';
import { identity, pipe } from 'fp-ts/lib/function';
import * as t from 'io-ts';
import { useSearchParams } from 'next/navigation';

import { Tag } from 'src/articles/Articles';
import { IterableToCodec } from 'src/codecs/Refined';

const query = t.array(IterableToCodec(Tag));

export const useQueryTags = (): Array<Tag> => {
  const searchParams = useSearchParams();
  return Tag.unique(
    pipe(
      searchParams?.getAll(Tag.queryName),
      query.decode,
      E.fold(() => [], identity)
    ).map(Tag.toLowerCase)
  );
};
