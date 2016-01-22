import { LoDashStatic } from 'lodash';
var _: LoDashStatic;
import { NepQ } from './nepq.d';

export = {
  parser: require('./lib/parser'),

  parse(input: string): NepQ {
    try {
      return this.parser.parse(input);
    } catch(e) {
      return null;
    }
  },

  response(nq: NepQ, obj: any, cb?: (result: any, error: Error) => void): any {
    if (typeof _ === 'undefined') {
      try {
        _ = require('lodash');
      } catch(e) {}
      if (typeof _ === 'undefined') {
        let res = new Error('nepq.response need lodash.');
        if (cb) cb(null, res);
        return res;
      }
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

    let callFunc = (f, args?) => {
      let r, t;
      r = f(args, nq, p => t = p);
      return !_.isUndefined(t) ? t : r;
    };

    let pick = r => {
      let obj;
      let expand = r => {
        _.forOwn(r, (v, k) => {
          if (_.isFunction(v)) r[k] = callFunc(v);
          if (_.isArray(v)) expand(v);
          if (_.isObject(v)) expand(v);
        });
      };
      let rec = (r, path, met) => {
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
          let $_ = (() => {
            let r = _.get(nq.retrieves, y[0].join('.')) || nq.retrieves;
            return _.has(r, y[1] + '.$_') ? r[y[1] + '.$_'] : undefined;
          })();
          let l = _.get(nq.retrieves, j);
          let mk = _.isUndefined($_) ? met : $_;
          if (met === 1) {
            _.unset(obj, p.join('.'));
            if (_.isUndefined(l)) return;
            if (_.isFunction(v)) v = callFunc(v, args());
            if (l !== 1) {
              if (_.isArray(v)) return rec(v, p, mk);
              if (_.isObject(v)) return rec(v, p, mk);
              return;
            }
            if (_.isObject(v)) expand(v);
            _.set(obj, p.join('.'), v);
          } else if (met === 0) {
            if (l === 0) {
              _.unset(obj, p.join('.'));
              return;
            }
            if (_.isFunction(v)) v = callFunc(v, args());
            _.set(obj, p.join('.'), v);
            if (_.isArray(v)) return rec(v, p, mk);
            if (_.isObject(v)) return rec(v, p, mk);
          } else if (_.isNull(met)) {
            if (_.isFunction(v)) v = callFunc(v, args());
            _.set(obj, p.join('.'), v);
            if (_.isArray(v)) return rec(v, p, mk);
            if (_.isObject(v)) return rec(v, p, mk);
          }
        });
      };

      obj = nq.$_ === 1 ? {} : _.cloneDeep(r);
      rec(r, [], nq.$_);
      return obj;
    };

    if (_.isArray(obj)) {
      obj = _(obj).map(pick).filter(x => !_.isEmpty(x)).value();
    } else {
      obj = pick(obj);
    }

    if (error) {
      if (cb) cb(null, error);
      return null;
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
