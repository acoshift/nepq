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

  response(nq: NepQ, obj: any, cb: (result: any) => void): void {
    if (typeof _ === 'undefined') {
      try {
        _ = require('lodash');
      } catch(e) {}
      if (typeof _ === 'undefined') {
        cb(undefined);
        return;
      }
    }
    if (_.isUndefined(obj)) {
      cb(null);
      return;
    }
    if (_.isNull(obj)) {
      cb(null);
      return;
    }
    if (nq.retrieves === 0) {
      cb({});
      return;
    }

    let callFunc = (f, args, cb) => {
      let r = f(args, nq, p => { if (_.isUndefined(r)) cb(p); });
      if (!_.isUndefined(r)) cb(r);
    };

    let expand = (r, cb) => {
      let cnt = 1;
      let done = () => {
        if (--cnt === 0) cb();
      }
      _.forOwn(r, (v, k) => {
        ++cnt;
        let elseCheck = () => {
          if (_.isArray(v)) return expand(v, done);
          if (_.isObject(v)) return expand(v, done);
          done();
        }
        if (_.isFunction(v)) {
          callFunc(v, [], p => {
            r[k] = v = p;
            elseCheck();
          });
        } else {
          elseCheck();
        }
      });
      done();
    };

    if (nq.retrieves === 1) {
      expand(obj, () => cb(obj));
      return;
    }

    let pick = (r, cb) => {
      let obj;
      let rec = (r, path, met, cb) => {
        let cnt = 1;
        let done = () => {
          if (--cnt === 0) cb();
        }
        _.forOwn(r, (v, k) => {
          ++cnt;
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
              if (_.isUndefined(l)) return done();
              if (_.isFunction(v)) return callFunc(v, args(), p => { v = p; checkRet(); });
              if (l !== 1) {
                if (_.isArray(v)) return rec(v, p, mk, done);
                if (_.isObject(v)) return rec(v, p, mk, done);
                done();
                return;
              }
              if (_.isObject(v)) {
                expand(v, () => { _.set(obj, pj, v); done(); });
                return;
              }
              _.set(obj, pj, v);
              done();
            } else if (met === 0) {
              if (l === 1) {
                _.unset(obj, pj);
                done();
                return;
              }
              if (_.isFunction(v)) return callFunc(v, args(), p => { v = p; checkRet(); });
              _.set(obj, pj, v);
              if (_.isArray(v)) return rec(v, p, mk, done);
              if (_.isObject(v)) return rec(v, p, mk, done);
              done();
            } else if (_.isNull(met)) {
              if (_.isFunction(v)) return callFunc(v, args(), p => { v = p; checkRet(); });
              _.set(obj, pj, v);
              if (_.isArray(v)) return rec(v, p, mk, done);
              if (_.isObject(v)) return rec(v, p, mk, done);
              done();
            }
          }
          checkRet();
        });
        done();
      };

      obj = nq.$_ === 1 ? {} : _.cloneDeep(r);
      rec(r, [], nq.$_, () => cb(obj));
    };

    if (_.isArray(obj)) {
      let cnt = 1;
      let done = () => {
        if (--cnt === 0) cb(_.filter(obj, x => !_.isEmpty(x)));
      }
      _.forEach(obj, (v, k, a) => {
        ++cnt;
        pick(v, p => { a[k] = p; done(); });
      });
      done();
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
