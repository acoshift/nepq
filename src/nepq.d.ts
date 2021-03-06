export interface NepQ {
  method: string;
  name: string;
  params: any[];
  retrieves: any;
  $_: number;
}

export var parser: {
  parse: (input: string) => NepQ;
};

export function parse(input: string): NepQ;
export function response(nq: NepQ, obj: any, cb: (result: any) => void): void;
export function bodyParser(opt?: {
  encoding?: string;
}): (req, res, next) => void;
