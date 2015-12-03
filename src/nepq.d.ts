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
      error: any;
      result: any;
    }

    export class NepQ {
      private data: Request;
      private retrieve;
      private callbacks: any;

      constructor();

      parse(data: string): Request;

      bodyParser(): (req, res, next: Function) => void;

      private checkCallback(namespace: string, name: string, method: string): boolean;

      private process(req, res, next: Function): void;

      on(method: string, namespace: string, name: string,
        callback: (param: any, retrieve: any, req, res, next: Function) => Response|void): void;

      response(result: any, error: any): Response;
    }
  }
  export = n;
}
