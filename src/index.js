import parser from './lib/parser';
import traverse from 'traverse';

class NepQ {
  constructor() {
    this.request = null;
    this._callbacks = [];
    this._callbackIndex = 0;
    this.req = null;
    this.res = null;
  }

  get parser() {
    return {
      parse(s) {
        let r = null;
        try {
          r = parser.parse(s);
        } catch (e) { }
        return r;
      }
    };
  }

  parse(s) {
    this.request = this.parser.parse(s);
    if (this.request) {
      this._callbackIndex = 0;
      this._callCallback();
    }
  }

  bodyParser() {
    return (req, res, next) => {
      this.req = req;
      this.res = res;

      if (req.headers['content-type'] !== 'application/nepq') { next(); return; }

      let data = '';
      req.setEncoding('utf8');
      req.on('data', d => { data += d; });
      req.on('end', () => { this.parse(data); });
    };
  }

  _callCallback() {
    let c = this._callbacks[this._callbackIndex++];
    if (c) {
      let d = this.request;
      let ns = d.namespace ? d.namespace.join('.') : '';
      if (c.method !== null && c.method !== d.method) { this._callCallback(); return; }
      if (c.namespace !== null && c.namespace !== ns) { this._callCallback(); return; }
      if (c.name !== null && c.name !== d.name) { this._callCallback(); return; }

      c.callback(d, this.req, this.res, this._callCallback);
    }
  }

  on(method, namespace, name, callback) {
    this._callbacks.push({ method: method, namespace: namespace, name: name, callback: callback });
  }

  use(callback) {
    this._callbacks.push({ method: null, namespace: null, name: null, callback: callback });
  }

  response(result, error) {
    result = (typeof result === 'undefined') ? null : result;
    error = (typeof error === 'undefined') ? null : error;

    let done = r => {
      if (r.error === null) delete r.error;
      if (r.result === null) delete r.result;
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

    let _ = this;

    function getResult(f) {
      let r, t;
      r = f(_.request, p => {
        t = p;
      });
      return typeof t !== 'undefined' ? t : r;
    }

    function map(r) {
      traverse(r).forEach(function(x) {
        if (typeof x === 'function') {
          this.update(getResult(x));
        }
        let p = this.path;
        let k = traverse(_.request.retrieve).get(p);
        if (typeof k === 'undefined') {
          while (p.length > 0) {
            if (traverse(_.request.retrieve).get(p) === 1) return;
            p.pop();
          }
          this.remove();
        }
        else if (k === 0) {
          this.remove();
        }
      });
    }

    r.result = result;

    if (r.result instanceof Array) {
      r.result.forEach(function(x) {
        map(x);
      });
    }
    else {
      map(r.result)
    }

    done(r);
  }
}

module.exports = function() { return new NepQ(); };
