declare module "nepq" {
  export interface NepQ {
    method: string;
    name: string;
    params: any;
    retrieves: any;
  }
  export function parser(): any;
  export function parse(s: string): NepQ;
  export function response(nq: NepQ, result: any): any;
}
