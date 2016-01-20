var parser = require('./lib/parser');
import _ = require('lodash');

interface NepQ {
  method: string;
  name: string;
  params: any;
  retrieves: any;
}

export = {
  parser: parser,

  parse(s: string): NepQ {
    return this.parser.parse(s);
  },

  response(nq: NepQ, obj: any, cb?: (result: any, error: Error) => void): any {
    if (typeof _ === 'undefined') {
      let res = new Error('nepq.response need lodash.');
      if (cb) cb(null, res);
      return res;
    }
    if (_.isUndefined(obj)) {
      if (cb) cb(null, null);
      return null;
    }
    if (_.isNull(obj)) {
      if (cb) cb(null, null);
      return null;
    }
    if (nq.retrieves === 1) {
      if (cb) cb(obj, null);
      return obj;
    }
    if (nq.retrieves === 0) {
      let res = {};
      if (cb) cb(res, null);
      return res;
    }

    let error = null;

    let method = null;
    let findRetrieveMethod = ret => {
      _.forOwn(ret, v => {
        if (_.isPlainObject(v)) findRetrieveMethod(v);
        if (_.isFinite(v)) {
          if (_.isNull(method)) {
            method = v;
          } else {
            if (method !== v) {
              error = new Error('Retrieve can not mix with inclusion and exclusion.');
              return;
            }
          }
        }
      });
    };
    findRetrieveMethod(nq.retrieves);
    if (error) {
      if (cb) cb(null, error);
      return error;
    }

    let callFunc = (f, args?) => {
      let r, t;
      r = f(args, nq, p => t = p);
      return !_.isUndefined(t) ? t : r;
    };

    let pick = r => {
      let obj = {};
      let expand = r => {
        return _.transform(r, (r, v, k) => {
          if (_.isFunction(v)) v = callFunc(v);
          if (_.isArray(v)) expand(v);
          if (_.isObject(v)) expand(v);
          r[k] = v;
        });
      };
      let rec = (r, path) => {
        _.forOwn(r, (v, k) => {
          let p = _.slice(path);
          p.push(k);
          let retPath = _.filter(p, isNaN);
          let j = retPath.join('.');
          let y: any = [_.dropRight(retPath), _.last(retPath)];
          let args = () => {
            let r = _.get(nq.retrieves, y[0].join('.')) || nq.retrieves;
            return _.has(r, y[1] + '.$') ? r[y[1] + '.$'] : null;
          };
          let l = _.get(nq.retrieves, j);
          if (method === 1) {
            if (_.isUndefined(l)) return;
            if (_.isFunction(v)) v = callFunc(v, args());
            if (l !== 1) {
              if (_.isArray(v)) return rec(v, p);
              if (_.isObject(v)) return rec(v, p);
              return;
            }
            if (_.isObject(v)) v = expand(v);
          } else if (method === 0) {
            if (l === 0) return;
            if (_.isFunction(v)) v = callFunc(v, args());
            if (_.isArray(v)) return rec(v, p);
            if (_.isObject(v)) return rec(v, p);
          }
          _.set(obj, p.join('.'), v);
        });
      };
      rec(r, []);
      return obj;
    };

    if (_.isArray(obj)) {
      obj = _(obj).map(pick).filter(x => !_.isEmpty(x)).value();
    } else {
      obj = pick(obj);
    }

    if (cb) cb(obj, null);
    return obj;
  },

  bodyParser(opt?: {
    encoding?: string;
  }) {
    return (req, res, next) => {
      if (!req) return next();
      if (req.headers['content-type'] !== 'application/nepq') return next();

      if (!opt) opt = {};
      if (!opt.encoding) opt.encoding = 'utf8';

      let data = [];
      req.on('data', d => {
        data.push(d);
      }).on('end', () => {
        req.body = this.parse(Buffer.concat(data).toString(opt.encoding));
        next();
      });
    };
  }
};
