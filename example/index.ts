import * as express from 'express'
import * as nepq from 'nepq'

const app = express()
const db: { [key: string]: any[] } = {}
let _id = 0

app.use(nepq.bodyParser())

app.use((req, res) => {
  let nq: nepq.NepQ = req.body
  if (nq == null) return res.sendStatus(400)

  console.log(nq)

  let get = id => db[nq.name].reduce((p, v, i, x) => {
    return p === null && v._id === id ? i : p
  }, null)

  let response = result => res.json(nepq.response(nq, result))

  let i, d

  switch (nq.method) {
    case 'create':
      if (!db[nq.name]) db[nq.name] = []
      nq.params[0]._id = _id++
      db[nq.name].push(nq.params[0])
      response(nq.params[0])
      break
    case 'read':
      if (!db[nq.name]) return response(null)
      if (nq.params.length === 0) {
        return response(db[nq.name])
      }
      response(db[nq.name].filter(x => x._id === nq.params[0])[0] || null)
      break
    case 'update':
      if (!db[nq.name]) return response(null)
      i = get(nq.params[0])
      if (i === null) return response(null)
      nq.params[1]._id = db[nq.name][i]._id
      db[nq.name][i] = nq.params[1]
      response(nq.params[1])
      break
    case 'delete':
      if (!db[nq.name]) return response(null)
      i = get(nq.params[0])
      if (i === null) return response(null)
      d = db[nq.name][i]
      delete db[nq.name][i]
      response(d)
      break
    case 'calc':
      switch (nq.name) {
        case 'sum':
          response({
            result: ([init]): any => nq.params.reduce((p, v) => p + v, init)
          })
          break
        default:
          res.sendStatus(501)
      }
      break
    default:
      res.sendStatus(501)
  }
})

app.listen(8000)
