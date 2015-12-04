/// <reference path="../typings/tsd.d.ts"/>

var parser = require('./lib/parser');
var traverse = require('traverse');

module nepq {
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
    private request: Request;
    private callbacks: any;
    private callbackIndex: number;
    private req: any;
    private res: any;

    constructor() {
      this.request = null;
      this.callbacks = [];
      this.callbackIndex = 0;
      this.req = null;
      this.res = null;
    }

    _parse(data: string): Request {
      let r = null;
      try {
        r = parser.parse(data);
      } catch (e) { }
      return r;
    }

    parse(data: string): void {
      this.request = this._parse(data);
      if (this.request) {
        this.callbackIndex = 0;
        this.callCallback();
      }
    }

    bodyParser(): (req, res, next: Function) => void {
      let _ = this;
      return (req, res, next) => {
        _.req = req;
        _.res = res;

        if (req.headers['content-type'] !== 'application/nepq') { next(); return; }

        let data = '';
        req.setEncoding('utf8');
        req.on('data', function(d) { data += d; });
        req.on('end', function() {
          _.parse(data);
        });
      }
    }

    private callCallback(): void {
      let c = this.callbacks[this.callbackIndex++];
      if (c) {
        let d = this.request;
        let ns = d.namespace ? d.namespace.join('.') : '';
        if (c.method !== null && c.method !== d.method) { this.callCallback(); return; }
        if (c.namespace !== null && c.namespace !== ns) { this.callCallback(); return; }
        if (c.name !== null && c.name !== d.name) { this.callCallback(); return; }

        c.callback(d, this.req, this.res, this.callCallback);
        return;
      }
      this.callCallback();
    }

    on(method: string, namespace: string, name: string,
      callback: (q: Request, req, res, next: Function) => void): void {
      this.callbacks.push({ method: method, namespace: namespace, name: name, callback: callback });
    }

    response(result: any, error?: any): void {
      let done = (r): void => {
        this.res.writeHead(200, { 'Content-Type': 'application/json' });
        this.res.end(JSON.stringify(r));
      };

      if (!result || error) {
        done({
          ok: error ? 0 : 1,
          error: error || null,
          result: null
        });
        return;
      }

      let r = {
        ok: 1,
        error: null,
        result: {}
      };

      if (!this.request.retrieve) {
        r.result = result;
        done(r);
        return;
      }

      r.result = this.request.retrieve;
      let _ = this;
      traverse(r.result).forEach(function(x) {
        if (x === 1) {
          let k = traverse(result).get(this.path);
          if (typeof k === 'function') this.update(k(_.request));
          else this.update(k);
        }
        else if (x === 0) this.remove();
      });

      done(r);
    }
  }
}

module.exports = function() { return new nepq.NepQ(); }
