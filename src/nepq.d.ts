declare module "nepq" {

  function n(): Nq;

  interface NepQ {
    method: string;
    name: string;
    params: any;
    retrieves: any;

    response(result?): any;
  }

  class Nq {
    parser: {
      parse(s: string),
      on(event: string, handler: Function)
    };

    constructor();

    parse(s: string, ...args): void;

    bodyParser(): (req, res, next: Function) => void;

    on(method: string, name: string, callback: (q: NepQ, ...args) => void): void;

    use(callback: (q: NepQ, ...args) => void): void;

    error(callback: (...args) => void): void;
  }

  export = n;
}
