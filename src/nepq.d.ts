declare module "nepq" {
  import * as http from 'http';

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

      bodyParser(): (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void;

      private checkCallback(namespace: string, name: string, method: string): boolean;

      private process(req: http.IncomingMessage, res: http.ServerResponse, next: Function): void;

      on(method: string, namespace: string, name: string,
        callback: (param: any, retrieve: any, req: http.IncomingMessage, res: http.ServerResponse, next: Function) => Response|void): void;

      response(result: any, error: any): Response;
    }
  }
  export = n;
}
