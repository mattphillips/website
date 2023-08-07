/* eslint-disable */

import { Brand } from 'effect';

type X = string & Brand.Brand<{ readonly X: symbol }['X']>;
type Y = string & Brand.Brand<{ readonly Y: unique symbol }['Y']>;

const ZBrand = Symbol('');
type Z = string & Brand.Brand<typeof ZBrand>;

type Int = number & Brand.Brand<'Int'>;
type Float = number & Brand.Brand<'Int'>;

const Y = Brand.nominal<Y>();

const y: Y = Y('hello');

type Equals<A, B> = A extends B ? true : false;

type Test = Equals<X, Y>;
type Test2 = Equals<Int, Float>;

namespace Aliases {
  type FirstName = string;
  type LastName = string;

  type Test = Equals<FirstName, LastName>; // true

  declare const first: FirstName;
  declare const last: LastName;

  declare const test: (firstName: FirstName, lastName: LastName) => string;
  test(last, first);
}

namespace Classes {
  class FirstName {
    constructor(public value: string) {}
  }

  class LastName {
    constructor(public value: string) {}
  }

  type Test = Equals<FirstName, LastName>; // true

  declare const first: FirstName;
  declare const last: LastName;

  declare const test: (firstName: FirstName, lastName: LastName) => string;
  test(last, first);
}

export namespace Opaque {
  type FirstName = string & { readonly FirstName: unique symbol };
  type LastName = string & { readonly LastName: unique symbol };

  type Test = Equals<FirstName, LastName>;

  declare const first: FirstName;
  declare const last: LastName;

  first.length;

  declare const test: (firstName: FirstName, lastName: LastName) => string;
  test(last, first);
}
