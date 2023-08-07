import { Brand } from 'effect';

export namespace Nominal {
  type Nominal<A, Brand extends symbol> = A & {
    __brand: Brand;
    __original: A;
  };

  const Nominal =
    <N extends Nominal<unknown, symbol>>() =>
    (a: N['__original']): N =>
      a as N;

  type FirstName = Nominal<string, { readonly FirstName: unique symbol }['FirstName']>;
  const FirstName = Nominal<FirstName>();

  type LastName = Nominal<string, { readonly LastName: unique symbol }['LastName']>;
  const LastName = Nominal<LastName>();

  type Email = Nominal<string, { readonly Email: unique symbol }['Email']>;
  const Email = Nominal<Email>();

  type Initials = Nominal<string, { readonly Initials: unique symbol }['Initials']>;
  const Initials = Nominal<Initials>();

  type OptInMarketing = Nominal<boolean, { readonly OptInMarketing: unique symbol }['OptInMarketing']>;
  const OptInMarketing = Nominal<OptInMarketing>();

  type User = {
    firstName: FirstName;
    lastName: LastName;
    email: Email;
    optInMarketing: OptInMarketing;
  };

  const user: User = {
    firstName: FirstName('Matt'),
    lastName: LastName('Phillips'),
    email: Email(''),
    optInMarketing: OptInMarketing(true)
  };

  const getInitials = (firstName: FirstName, lastName: LastName): Initials => {
    return Initials(`${firstName.charAt(0)}${lastName.charAt(0)}`);
  };

  const valid = getInitials(user.firstName, user.lastName);
  //    ^^^^^^^^ "MP"

  const wontCompile = getInitials(user.lastName, user.firstName);
  //    ^^^^^^^^^^^ Argument of type 'LastName' is not assignable to parameter of type 'FirstName'.
}

export namespace EffectBrand {
  type FirstName = number & Brand.Brand<'FirstName'>;
  const FirstName = Brand.nominal<FirstName>();

  const firstName = FirstName('Matt');

  const LastNameBrand = Symbol('LastName');
  type LastName = string & Brand.Brand<typeof LastNameBrand>;
  const LastName = Brand.nominal<LastName>();

  const lastName = LastName('Phillips');
}
