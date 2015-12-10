import parser from './lib/parser';
import _ from 'lodash';

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

    let callFunc = f => {
      let r, t;
      r = f(this.request, p => {
        t = p;
      });
      return typeof t !== 'undefined' ? t : r;
    }

    let pick = (r) => {
      let result = {};
      let expand = (r) => {
        return _.transform(r, (r, v, k) => {
          if (_.isFunction(v)) {
            v = callFunc(v);
          }
          if (_.isArray(v)) expand(v);
          if (_.isObject(v)) expand(v);
          r[k] = v;
        });
      }
      let rec = (r, path) => {
        _.forOwn(r, (v, k) => {
          let p = path.slice();
          p.push(k);
          let j = p.filter(isNaN).join('.');
          let l = _.get(this.request.retrieve, j);
          if (l === undefined) return;
          if (_.isFunction(v)) {
            v = callFunc(v);
          }
          if (l !== 1) {
            if (_.isArray(v)) return rec(v, p);
            if (_.isObject(v)) return rec(v, p);
            return;
          }
          if (_.isObject(v)) v = expand(v);
          _.set(result, p.join('.'), v);
        });
      };
      rec(r, []);
      return result;
    };

    if (_.isArray(result)) {
      result.forEach((x, i, a) => a[i] = pick(x));
    } else {
      result = pick(result);
    }

    return result;
  }
}

module.exports = function() { return new NepQ(); };
