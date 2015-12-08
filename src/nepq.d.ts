declare module "nepq" {

  function n(): n.NepQ;

  module n {
    export interface Request {
      method: string;
      namespace: string[];
      name: string;
      param: any;
      retrieve: any;
    }

    export class NepQ {
      request: Request;
      req: any;
      res: any;
      next: Function;
      statusCode: any;
      statusMessage: any;

      parser: {
        parse(s: string)
      };

      constructor();

      parse(s: string): void;

      bodyParser(): (req, res, next: Function) => void;

      on(method: string, namespace: string, name: string,
        callback: (q: Request, req, res, next: Function) => void): void;

      use(callback: (q: Request, req, res, next: Function) => void): void;

      error(callback: (req, res, next: Function) => void): void;

      status(code?, msg?);

      send(result?): void;

      response(result?): void;
    }
  }
  export = n;
}
