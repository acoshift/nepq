const _ = require('lodash')
const async = require('async')
const parser = require('./lib/parser')
const retrieveParser = require('./lib/retrieve')

function fastParse (input) {
  let s = ''
  let i
  let p

  // trim input
  let inStr = false
  let skip = false
  for (i = 0; i < input.length; ++i) {
    p = input[i]
    if (p === '\\') {
      s += p + input[++i]
      continue
    }
    if (p === '"') {
      inStr = !inStr
    }
    if (!inStr && (p === '\r' || p === '\n' || p === '\t')) p = ' '
    if (p === ' ') {
      if (!inStr && skip) continue
      if (!inStr && !skip) skip = true
    } else {
      if (skip) skip = false
    }
    s += p
  }
  s = s.trim()

  const l = s.length
  let state = 0
  let r = ['', '', '[]', '']
  let t = ''
  inStr = false

  i = 0
  for (; i < l; ++i) {
    p = s[i]
    if (p === ' ') {
      state = 1
      ++i
      break
    }
    if (p === '(') {
      state = 2
      break
    }
    if (p === '{' || p === '+' || p === '-' || p === '*') {
      state = 3
      break
    }
    t += p
  }
  r[0] = t
  t = ''

  if (state === 1) {
    for (; i < l; ++i) {
      p = s[i]
      if (p === ' ') {
        ++i
        break
      }
      if (p === '(') {
        state = 2
        break
      }
      if (p === '{' || p === '+' || p === '-' || p === '*') {
        state = 3
        break
      }
      t += p
    }
    r[1] = t
    t = ''
  }

  if (state === 1) {
    if (p === '(') {
      state = 2
    }
    if (p === '{' || p === '+' || p === '-' || p === '*') {
      state = 3
    }
  }

  if (state === 2) {
    ++i
    let flatten = 0
    if (s.substr(i, 3) === '...') {
      flatten = 1
      i += 3
    }
    if (flatten) {
      for (; i < l; ++i) {
        p = s[i]
        if (p === '\\') {
          t += p + s[++i]
          continue
        }
        if (p === ')' && !inStr) {
          ++i
          break
        }
        if (p === '"') inStr = !inStr
        t += p
      }
      r[2] = t
    } else {
      let pair = 0
      let key = -1
      for (; i < l; ++i) {
        p = s[i]
        if (p === '\\') {
          t += p + s[++i]
          continue
        }
        if (!inStr) {
          if (p === ':' && pair === 0) pair = 1
          if (p === '{' && pair === 0) pair = -1
          if (p === ')' && !inStr) {
            ++i
            break
          }
          if (key < 0) {
            if (p === '"') {
              key = key === -1 ? 2 : 3
            } else if (p !== '{' && p !== '[' && p !== ' ') {
              key = key === -1 ? 1 : 4
              t += '"'
            }
          } else if ((key === 1 || key === 4) && p === ':') {
            key = key === 1 ? 0 : 3
            t += '"'
          } else if (key === 2 && p === ':') {
            key = 0
          } else if (key === 0 && (p === ',' || p === '{' || p === '[')) {
            key = -1
          } else if (key === 1 && p === ',') {
            key = 3
          } else if (key === 3 && p === '{') {
            key = -2
          }
        }
        if (p === '"') inStr = !inStr
        t += p
      }
      if (pair <= 0 && t[0] === '"') {
        r[2] = '[' + t.substr(1) + ']'
      } else if (pair === 1) {
        r[2] = '[{' + t + '}]'
      } else {
        r[2] = '[' + t + ']'
      }
    }
    t = ''
  }

  r[3] = s.substr(i)

  try {
    r[2] = JSON.parse(r[2])
  } catch (e) {
    r[2] = []
  }
  r[3] = retrieveParser.parse(r[3])

  return {
    method: r[0],
    name: r[1],
    params: r[2],
    retrieves: r[3].retrieves,
    $_: r[3].$_
  }
}

module.exports = {
  parser: parser,
  fastParse (input) {
    try {
      return fastParse(input)
    } catch (e) {
      return null
    }
  },

  parse (input) {
    try {
      return this.parser.parse(input)
    } catch (e) {
      return null
    }
  },

  response (nq, obj, cb) {
    if (_.isUndefined(obj) || _.isNull(obj) || _.isFunction(obj)) {
      cb(null)
      return
    }
    if (nq.retrieves === 0) {
      cb({})
      return
    }

    let callFunc = (f, args, cb) => {
      let r = f(args, nq, (p) => { if (_.isUndefined(r)) cb(p) })
      if (!_.isUndefined(r)) cb(r)
    }

    let expand = (r, cb) => {
      async.parallel(
        _.map(r, (v, k) => {
          return (cb) => {
            let elseCheck = () => {
              if (_.isArray(v)) return expand(v, cb)
              if (_.isObject(v)) return expand(v, cb)
              cb()
            }
            if (_.isFunction(v)) {
              callFunc(v, [], (p) => {
                r[k] = v = p
                elseCheck()
              })
            } else {
              elseCheck()
            }
          }
        }), () => cb())
    }

    if (nq.retrieves === 1) {
      expand(obj, () => cb(obj))
      return
    }

    let pick = (r, cb) => {
      let obj
      let rec = (r, path, met, cb) => {
        async.parallel(
          _.map(r, (v, k) => {
            return (cb) => {
              let p = _.slice(path)
              p.push(k)
              let retPath = _.filter(p, isNaN)
              let j = retPath.join('.')
              let y = [_.dropRight(retPath), _.last(retPath)]
              let args = () => {
                let r = _.get(nq.retrieves, y[0].join('.')) || nq.retrieves
                return _.has(r, y[1] + '.$') ? r[y[1] + '.$'] : []
              }
              let $_ = (() => {
                let r = _.get(nq.retrieves, y[0].join('.')) || nq.retrieves
                return _.has(r, y[1] + '.$_') ? r[y[1] + '.$_'] : undefined
              })()
              let l = _.get(nq.retrieves, j)
              let mk = _.isUndefined($_) ? met : $_
              let pj = p.join('.')
              let checkRet = () => {
                if (met === 1) {
                  if (_.has(obj, pj)) _.unset(obj, pj)
                  if (_.isUndefined(l)) return cb()
                  if (_.isFunction(v)) {
                    return callFunc(v, args(), (p) => {
                      v = p
                      return checkRet()
                    })
                  }
                  if (l !== 1) {
                    if (_.isArray(v)) return rec(v, p, mk, cb)
                    if (_.isObject(v)) return rec(v, p, mk, cb)
                    return cb()
                  }
                  if (_.isObject(v)) {
                    expand(v, () => {
                      _.set(obj, pj, v)
                      cb()
                    })
                    return
                  }
                  _.set(obj, pj, v)
                  return cb()
                } else if (met === 0) {
                  if (l === 1) {
                    _.unset(obj, pj)
                    return cb()
                  }
                  if (_.isFunction(v)) {
                    return callFunc(v, args(), (p) => {
                      v = p
                      return checkRet()
                    })
                  }
                  _.set(obj, pj, v)
                  if (_.isArray(v)) return rec(v, p, mk, cb)
                  if (_.isObject(v)) return rec(v, p, mk, cb)
                  return cb()
                } else if (_.isNull(met)) {
                  if (_.isFunction(v)) {
                    return callFunc(v, args(), (p) => {
                      v = p
                      return checkRet()
                    })
                  }
                  _.set(obj, pj, v)
                  if (_.isArray(v)) return rec(v, p, mk, cb)
                  if (_.isObject(v)) return rec(v, p, mk, cb)
                  return cb()
                }
              }
              checkRet()
            }
          }), () => cb()
        )
      }

      obj = nq.$_ === 1 ? {} : _.cloneDeep(r)
      rec(r, [], nq.$_, () => cb(obj))
    }

    if (_.isArray(obj)) {
      async.parallel(
        _.map(obj, (v, k, a) => {
          return (cb) => {
            pick(v, (p) => {
              a[k] = p
              cb()
            })
          }
        }), () => cb(_.filter(obj, (x) => !_.isEmpty(x)))
      )
    } else {
      pick(obj, cb)
    }
  },

  bodyParser (opt) {
    return (req, res, next) => {
      if (!req) return next()
      if (req.headers['content-type'] !== 'application/nepq') return next()

      if (!opt) opt = {}
      if (!opt.encoding) opt.encoding = 'utf8'

      let data = []
      req.on('data', (d) => {
        data.push(d)
      }).on('end', () => {
        req.body = this.parse(Buffer.concat(data).toString(opt.encoding))
        next()
      })
    }
  }
}
