/// <reference path="../typings/tsd.d.ts"/>

import * as http from 'http';
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
    private data: Request;
    private retrieve;
    private callbacks: any;

    constructor() {
      this.data = null;
      this.retrieve = null;
      this.callbacks = {};
    }

    parse(data: string): Request {
      let r = null;
      try {
        r = parser.parse(data);
      } catch (e) { }
      return r;
    }

    bodyParser(): (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void {
      let _ = this;
      return (req, res, next) => {
        if (req.headers['content-type'] !== 'application/nepq') { next(); return; }

        let data = '';
        req.setEncoding('utf8');
        req.on('data', function(d) { data += d; });
        req.on('end', function() {
          _.data = _.parse(data);
          if (_.data) {
            req['body'] = _.data;
            _.process(req, res, next);
          }
        });
      }
    }

    private checkCallback(namespace: string, name: string, method: string): boolean {
      if (namespace) {
        return this.callbacks && this.callbacks[namespace] && this.callbacks[namespace][name] && this.callbacks[namespace][name][method];
      }
      return this.callbacks && this.callbacks[name] && this.callbacks[name][method];
    }

    private process(req, res, next: Function): void {
      let { method, namespace, name, param, retrieve } = req.body;
      if (!name || !method) return;
      this.retrieve = retrieve;
      let r = null;
      if (namespace && namespace !== '') {
        let ns = namespace.join('.');
        if (this.checkCallback(ns, name, method)) {
          r = this.callbacks[ns][name][method](req.body, req, res, next);
        }
        else {
          next();
        }
      }
      else {
        if (this.checkCallback(null, name, method)) {
          r = this.callbacks[name][method](req.body, req, res, next);
        }
        else {
          next();
        }
      }
      if (r) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(r));
      }
    }

    on(method: string, namespace: string, name: string,
      callback: (q: Request, req, res, next: Function) => Response|void): void {
      if (!namespace || namespace === '') {
        if (!this.callbacks[name]) this.callbacks[name] = { };
        this.callbacks[name][method] = callback;
        return;
      }
      if (!this.callbacks[namespace]) this.callbacks[namespace] = { };
      if (!this.callbacks[namespace][name]) this.callbacks[namespace][name] = { };
      this.callbacks[namespace][name][method] = callback;
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

      if (!this.retrieve) {
        r.result = result;
        return r;
      }

      r.result = this.retrieve;
      let _this = this;
      traverse(r.result).forEach(function(x) {
        if (x === 1) {
          let k = traverse(result).get(this.path);
          if (typeof k === 'function') this.update(k(_this.data));
          else this.update(k);
        }
        else if (x === 0) this.remove();
      });

      return r;
    }
  }
}

module.exports = function() { return new nepq.NepQ(); }
