export declare global {
  export namespace Omit {
    export type Strict<O, K extends keyof O> = Omit<O, K>;
  }
}
