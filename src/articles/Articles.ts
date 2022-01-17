import { UIO } from "ts-prelude/IO/fluent";
import { Maybe } from "ts-prelude/Maybe";

export interface Articles {
  list: UIO<Array<Article>>;

  findBySlug: (slug: string) => UIO<Maybe<Article>>;
}

type Image = {
  src: string;
  alt: string;
  credit: {
    name: string;
    url: string;
  };
};

export type Article = {
  slug: string;
  content: string;
  date: Date;
  title: string;
  description: string;
  image: Maybe<Image>;
};
