import parser from './lib/parser';
import _ from 'lodash';

class NepQ {
  constructor(r) {
    Object.assign(this, r);
  }

  response(result) {
    result = (typeof result === 'undefined') ? null : result;

    if (this.retrieve === 1 || result === null) return result;

    let callFunc = f => {
      let r, t;
      r = f(this, p => {
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
          let l = _.get(this.retrieve, j);
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
      result = result.map(pick).filter(x => !_.isEmpty(x));
    } else {
      result = pick(result);
    }

    return result;
  }
}

class Nq {
  constructor() {
    this._callbacks = [];
    this._errorCallback = () => {};
    this._parserEvent = {};
  }

  get parser() {
    let _this = this;
    return {
      parse(s) {
        if (_this._parserEvent['before']) s = _this._parserEvent['before'](s);
        let r = null;
        try {
          r = new NepQ(parser.parse(s));
          if (_this._parserEvent['after']) _this._parserEvent['after'](r);
        } catch (e) { }
        return r;
      },
      on(event, handler) {
        _this._parserEvent[event] = handler;
      }
    };
  }

  parse(s, t, ...args) {
    if (!t) t = {};
    t.body = this.parser.parse(s);
    if (t.body) {
      this._callCallback.apply(this, [0, t].concat(args));
    } else {
      this._errorCallback.apply(this, [t].concat(args));
    }
  }

  bodyParser() {
    return (req, res, next) => {
      if (req.headers['content-type'] !== 'application/nepq') return next();

      let data = '';
      req.setEncoding('utf8');
      req.on('data', d => { data += d; });
      req.on('end', () => { this.parse(data, req, res, next); });
    };
  }

  _callCallback(i, t, ...args) {
    let c = this._callbacks[i++];
    if (c) {
      let d = t.body;
      let ns = d.namespace ? d.namespace.join('.') : '';
      if (c.method !== null && c.method !== d.method) return this._callCallback.apply(this, [i, t].concat(args));
      if (c.namespace !== null && c.namespace !== ns) return this._callCallback.apply(this, [i, t].concat(args));
      if (c.name !== null && c.name !== d.name) return this._callCallback.apply(this, [i, t].concat(args));

      c.callback.apply(this, [d, t].concat(args).concat(() => this._callCallback(this, [i, t].concat(args))));
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
}

function n() { return new Nq(); }

module.exports = n;
module.default = n;
