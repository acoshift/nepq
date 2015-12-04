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
        let ns = d.namespace ? d.namespace.join('.') : null;
        if (c.method && c.method !== d.method) { this.callCallback(); return; }
        if (c.namespace && c.namespace !== ns) { this.callCallback(); return; }
        if (c.name && c.name !== d.name) { this.callbacks(); return; }

        this.process(c.callback(d, this.req, this.res, this.callCallback));
      }
    }

    private process(r): void {
      let { method, namespace, name, param, retrieve } = this.request;
      if (r) {
        this.res.writeHead(200, { 'Content-Type': 'application/json' });
        this.res.end(JSON.stringify(r));
      }
    }

    on(method: string, namespace: string, name: string,
      callback: (q: Request, req, res, next: Function) => Response|void): void {
      this.callbacks.push({ method: method, namespace: namespace, name: name, callback: callback });
    }

    response(result: any, error: any): Response {
      if (!result || error) {
        return {
          ok: error ? 0 : 1,
          error: error || null,
          result: null
        };
      }

      var r = {
        ok: 1,
        error: null,
        result: {}
      };

      if (!this.request.retrieve) {
        r.result = result;
        return r;
      }

      r.result = this.request.retrieve;
      let _this = this;
      traverse(r.result).forEach(function(x) {
        if (x === 1) {
          let k = traverse(result).get(this.path);
          if (typeof k === 'function') this.update(k(_this.request));
          else this.update(k);
        }
        else if (x === 0) this.remove();
      });

      return r;
    }
  }
}

module.exports = function() { return new nepq.NepQ(); }
