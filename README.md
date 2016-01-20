# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is a query language influenced by Facebook's GraphQL.

## Syntax

```
{method} {name}({params}) {
  {retrieves}
}
```

will be parsed into object:

```ts
interface NepQ {
  method: string;
  name: string;
  params: any;
  retrieves: any;
}
```

### Example

Basic request.
```
read stock.product(id: 10) { name, price }
```
```js
{
  method: "read",
  name: "stock.product",
  params: {
    id: 10
  },
  retrieves: {
    name: 1,
    price: 1
  }
}
```
---
Use json as parameter.
```
create db.user.customer({
  "user": "cust1",
  "email": "cust1@email.com",
  "tel": "+661234567",
  "address": {
    "province": "Bangkok",
    "zip": "12345",
    "country": "TH"
  }
}) { }
```
```js
{
  method: "create",
  name: "db.user.customer",
  params: {
    user: "cust1",
    email: "cust1@email.com",
    tel: "+661234567",
    address: {
      province: "Bangkok",
      zip: "12345",
      country: "TH"
    }
  },
  retrieves: { }
}
```
---
Nested retrieve.
```
read db.user.customer(email: "cust1@email.com") {
  id,
  user,
  email,
  address {
    zip,
    country
  }
}
```
```js
{
  method: "read",
  name: "db.user.customer",
  params: {
    email: "cust1@email.com"
  },
  retrieves: {
    id: 1,
    user: 1,
    email: 1,
    address: {
      zip: 1,
      country: 1
    }
  }
}
```
---
Anonymous parameters.
```
update user({ id: 1234 }, { email: "new_mail@email.com" }) { }
```
```js
{
  method: "update",
  name: "user",
  params: [
    { id: 1234 },
    { email: "new_mail@email.com" }
  ],
  retrieves: { }
}
```
---
Retrieve everything.
```
delete db.user(1234)
```
```js
{
  method: "delete",
  name: "db.user",
  params: 1234,
  retrieves: 1
}
```
---
These are valid.
```
read
```
```js
{
  method: "read",
  name: "",
  params: { },
  retrieves: 1
}
```
```
read stock.product
```
```js
{
  method: "read",
  name: "stock.product",
  params: { },
  retrieves: 1
}
```
```
read stock.product { name }
```
```js
{
  method: "read",
  name: "stock.product",
  params: { },
  retrieves: {
    name: 1
  }
}
```

## API
```ts
declare module "nepq" {
  export interface NepQ {
    method: string;
    name: string;
    params: any;
    retrieves: any;
  }

  export var parser: {
    parse: (input: string) => NepQ;
  };

  export function parse(input: string): NepQ;

  export function response(nq: NepQ, obj: any, cb?: (result: any, error: Error) => void): any;

  export function bodyParser(opt?: {
    encoding?: string;
  }): (req, res, next) => void;
}
```

## Example

```
$ npm init
$ npm install express nepq lodash
```

```ts
import express = require('express');
import nepq = require('nepq');

var app = express();
var db: { [key: string]: any[] } = {};
var _id = 0;

app.use(nepq.bodyParser());

app.use((req, res) => {
  let nq: nepq.NepQ = req.body;
  if (nq == null) return res.sendStatus(400);

  console.log(nq);

  let get = id => db[nq.name].reduce((p, v, i, x) => {
    return p === null && v._id === id ? i : p;
  }, null);

  let response = result => res.json(nepq.response(nq, result));

  let i, d;

  switch (nq.method) {
    case 'create':
      if (!db[nq.name]) db[nq.name] = [];
      nq.params._id = _id++;
      db[nq.name].push(nq.params);
      console.log(nepq.response(nq, nq.params));
      response(nq.params);
      break;
    case 'read':
      if (!db[nq.name]) return response(null);
      if (typeof nq.params === 'object' && Object.keys(nq.params).length === 0) {
        return response(db[nq.name]);
      }
      response(db[nq.name].filter(x => x._id === nq.params)[0] || null);
      break;
    case 'update':
      if (!db[nq.name]) return response(null);
      if (!(nq.params instanceof Array)) return response(null);
      i = get(nq.params[0]);
      if (i === null) return response(null);
      nq.params[1]._id = db[nq.name][i]._id;
      db[nq.name][i] = nq.params[1];
      response(nq.params[1]);
      break;
    case 'delete':
      if (!db[nq.name]) return response(null);
      i = get(nq.params);
      if (i === null) return response(null);
      d = db[nq.name][i];
      delete db[nq.name][i];
      response(d);
      break;
    case 'calc':
      switch (nq.name) {
        case 'sum':
          if (!(nq.params instanceof Array)) nq.params = [ nq.params ];
          response({
            result: ([init]) => nq.params.reduce((p, v) => p + v, init)
          });
          break;
        default:
          res.sendStatus(501);
      }
      break;
    default:
      res.sendStatus(501);
  }
});

app.listen(8000);
```

```
$ curl localhost:8000
> Bad Request

$ curl --header "content-type: application/nepq" localhost:8000
> Not Implemented

$ curl --header "content-type: application/nepq" --data "create contact({name: \"n1\"})" localhost:8000
> {"name":"n1","_id":0}

$ curl --header "content-type: application/nepq" --data "create contact(name: \"n2\") { _id }" localhost:8000
> {"_id":1}

$ curl --header "content-type: application/nepq" --data "read contact(0) -{ _id }" localhost:8000
> {"name":"n1"}

$ curl --header "content-type: application/nepq" --data "update contact(0, {name: \"new n1\"})" localhost:8000
> {"name":"new n1","_id":0}

$ curl --header "content-type: application/nepq" --data "read contact { name }" localhost:8000
> [{"name":"new n1"},{"name":"n2"}]

$ curl --header "content-type: application/nepq" --data "calc sum(10, 20, 30, 40) { result(0) }" localhost:8000
> {"result":100}

$ curl --header "content-type: application/nepq" --data "calc sum(10, 20, 30, 40) { result(\"\") }" localhost:8000
> {"result":"10203040"}
```
