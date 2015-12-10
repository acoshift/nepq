import parser from './lib/parser';
import traverse from 'traverse';

class NepQ {
  constructor() {
    this.request = null;
    this._callbacks = [];
    this._callbackIndex = 0;
    this._errorCallback = () => {};
    this.req = null;
    this.res = null;
    this.next = () => {};
    this.statusCode = null;
    this.statusMessage = null;
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
      this.statusCode = 200;
      this.statusMessage = null;
      this._callbackIndex = 0;
      this._callCallback();
    } else {
      this._errorCallback(this.req, this.res, this.next);
    }
  }

  bodyParser() {
    return (req, res, next) => {
      this.req = req;
      this.res = res;
      this.next = next;

      if (req.headers['content-type'] !== 'application/nepq') return next();

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
      if (c.method !== null && c.method !== d.method) return this._callCallback();
      if (c.namespace !== null && c.namespace !== ns) return this._callCallback();
      if (c.name !== null && c.name !== d.name) return this._callCallback();

      c.callback(d, this.req, this.res, this._callCallback);
    }
  }

  on(method, namespace, name, callback) {
    this._callbacks.push({ method: method, namespace: namespace, name: name, callback: callback });
  }

  use(callback) {
    this._callbacks.push({ method: null, namespace: null, name: null, callback: callback });
  }

  error(callback) {
    this._errorCallback = callback;
  }

  status(code, msg) {
    this.statusCode = (typeof code === 'undefined') ? 200 : code;
    this.statusMessage = (typeof msg === 'undefined') ? null : msg;
    return this;
  }

  send(result) {
    result = this.response(result);

    if (this.statusMessage !== null) {
      this.res.writeHead(this.statusCode, this.statusMessage, { 'Content-Type': 'application/json' });
    } else {
      this.res.writeHead(this.statusCode, { 'Content-Type': 'application/json' });
    }
    this.res.end(JSON.stringify(result));
  }

  response(result) {
    result = (typeof result === 'undefined') ? null : result;

    if (!this.request || this.request.retrieve === 1 || result === null) return result;

    result = Object.assign({}, result);

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
        if (!traverse(r).has(this.path)) return;
        let p = this.path.filter(isNaN);
        let k = traverse(_.request.retrieve).get(p);
        let v = (() => {
          while (p.length > 0) {
            if (traverse(_.request.retrieve).get(p) === 1) return true;
            p.pop();
          }
          return false;
        })();
        if ((v || k instanceof Object) && typeof x === 'function') {
          this.update(getResult(x));
        } else if (typeof k === 'undefined') {
          if (v) return;
          this.remove();
        } else if (k === 0) {
          this.remove();
        } else if (k instanceof Object && !(x instanceof Object)) {
          if (this.parent.node instanceof Array) {
            this.parent.remove();
          } else {
            this.remove();
          }
        }
      });
    }

    if (result instanceof Array) {
      result.forEach(map);
    } else {
      map(result);
    }

    return result;
  }
}

module.exports = function() { return new NepQ(); };
