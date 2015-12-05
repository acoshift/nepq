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

    export interface Response {
      ok: number;
      error?: any;
      result?: any;
    }

    export class NepQ {
      private data: Request;
      private retrieve;

      constructor();

      parse(data: string): void;

      bodyParser(): (req, res, next: Function) => void;

      on(method: string, namespace: string, name: string,
        callback: (q: Request, req, res, next: Function) => void): void;

      response(result?: any, error?: any): Response;
    }
  }
  export = n;
}
