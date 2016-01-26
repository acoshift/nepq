import { NepQ } from './nepq.d';
import _ = require('lodash');
import async = require('async');

export = {
  parser: require('./lib/parser'),

  parse(input: string): NepQ {
    try {
      return this.parser.parse(input);
    } catch(e) {
      return null;
    }
  },

  response(nq: NepQ, obj: any, cb: (result: any) => void): void {
    if (_.isUndefined(obj) || _.isNull(obj) || _.isFunction(obj)) {
      cb(null);
      return;
    }
    if (nq.retrieves === 0) {
      cb({});
      return;
    }

    let callFunc = (f, args, cb): void => {
      let r = f(args, nq, p => { if (_.isUndefined(r)) cb(p); });
      if (!_.isUndefined(r)) cb(r);
    };

    let expand = (r, cb): void => {
      async.parallel(
        _.map(r, (v, k) => {
          return cb => {
            let elseCheck = () => {
              if (_.isArray(v)) return expand(v, cb);
              if (_.isObject(v)) return expand(v, cb);
              cb();
            }
            if (_.isFunction(v)) {
              callFunc(v, [], p => {
                r[k] = v = p;
                elseCheck();
              });
            } else {
              elseCheck();
            }
          };
        }), () => cb());
    };

    if (nq.retrieves === 1) {
      expand(obj, () => cb(obj));
      return;
    }

    let pick = (r, cb) => {
      let obj;
      let rec = (r, path, met, cb): void => {
        async.parallel(
          _.map(r, (v, k) => {
            return cb => {
              let p = _.slice(path);
              p.push(k);
              let retPath = _.filter(p, isNaN);
              let j = retPath.join('.');
              let y: any = [_.dropRight(retPath), _.last(retPath)];
              let args = () => {
                let r = _.get(nq.retrieves, y[0].join('.')) || nq.retrieves;
                return _.has(r, y[1] + '.$') ? r[y[1] + '.$'] : [];
              };
              let $_ = (() => {
                let r = _.get(nq.retrieves, y[0].join('.')) || nq.retrieves;
                return _.has(r, y[1] + '.$_') ? r[y[1] + '.$_'] : undefined;
              })();
              let l = _.get(nq.retrieves, j);
              let mk = _.isUndefined($_) ? met : $_;
              let pj = p.join('.');
              let checkRet = () => {
                if (met === 1) {
                  if (_.has(obj, pj)) _.unset(obj, pj);
                  if (_.isUndefined(l)) return cb();
                  if (_.isFunction(v)) return callFunc(v, args(), p => { v = p; return checkRet(); });
                  if (l !== 1) {
                    if (_.isArray(v)) return rec(v, p, mk, cb);
                    if (_.isObject(v)) return rec(v, p, mk, cb);
                    return cb();
                  }
                  if (_.isObject(v)) {
                    expand(v, () => { _.set(obj, pj, v); cb(); });
                    return;
                  }
                  _.set(obj, pj, v);
                  return cb();
                } else if (met === 0) {
                  if (l === 1) {
                    _.unset(obj, pj);
                    return cb();
                  }
                  if (_.isFunction(v)) return callFunc(v, args(), p => { v = p; return checkRet(); });
                  _.set(obj, pj, v);
                  if (_.isArray(v)) return rec(v, p, mk, cb);
                  if (_.isObject(v)) return rec(v, p, mk, cb);
                  return cb();
                } else if (_.isNull(met)) {
                  if (_.isFunction(v)) return callFunc(v, args(), p => { v = p; return checkRet(); });
                  _.set(obj, pj, v);
                  if (_.isArray(v)) return rec(v, p, mk, cb);
                  if (_.isObject(v)) return rec(v, p, mk, cb);
                  return cb();
                }
              }
              checkRet();
            };
          }), () => cb()
        );
      };

      obj = nq.$_ === 1 ? {} : _.cloneDeep(r);
      rec(r, [], nq.$_, () => cb(obj));
    };

    if (_.isArray(obj)) {
      async.parallel(
        _.map(obj, (v, k, a) => {
          return cb => {
            pick(v, p => { a[k] = p; cb(); });
          };
        }), () => cb(_.filter(obj, x => !_.isEmpty(x)))
      );
    } else {
      pick(obj, cb);
    }
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
