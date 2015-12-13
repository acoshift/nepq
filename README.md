# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is a query language influenced by Facebook's GraphQL.

## Syntax

```
{method} {namespace}.{name}({param}) {
  {retrieve}
}
```

will be parsed into object:

```ts
interface NepQ {
  method: string;         // not null, not empty
  namespace: string[];    // can be empty array
  name: string;           // not null, can be empty string
  param: any;             // can be null, empty array, or empty object
  retrieve: any;          // not null
}
```

### Example

> Basic request.
```
read stock.product(id: 10) { name, price }
```
```js
{
  method: "read",
  namespace: [ "stock" ],
  name: "product",
  param: {
    id: 10
  },
  retrieve: {
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
  namespace: [ "db", "user" ],
  name: "customer",
  param: {
    user: "cust1",
    email: "cust1@email.com",
    tel: "+661234567",
    address: {
      province: "Bangkok",
      zip: "12345",
      country: "TH"
    }
  },
  retrieve: { }
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
  namespace: [ "db", "user" ],
  name: "customer",
  param: {
    email: "cust1@email.com"
  },
  retrieve: {
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
  namespace: [ ],
  name: "user",
  param: [
    { id: 1234 },
    { email: "new_mail@email.com" }
  ],
  retrieve: { }
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
  namespace: [ "db" ],
  name: "user",
  param: 1234,
  retrieve: 1
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
  namespace: [ ],
  name: "",
  param: { },
  retrieve: 1
}
```
```
read stock.product
```
```js
{
  method: "read",
  namespace: [ "stock" ],
  name: "product",
  param: { },
  retrieve: 1
}
```
```
read stock.product { name }
```
```js
{
  method: "read",
  namespace: [ "stock" ],
  name: "product",
  param: { },
  retrieve: {
    name: 1
  }
}
```

## API Document

```js
var nepq = require('nepq')(); // : Nq
// or
var nepq = require('nepq');   // : Function(): Nq
var nq = nepq();              // : Nq
```

`class Nq`
* `parser.parse(s: string): NepQ`

 Parse string into request object.

 Return object if valid, otherwise null.

* `parser.on(event: string, handler: Function)`

  * `parser.on('before', (s: string) => string): void`

    Before parse event.

  * `parser.on('after', (q: NepQ) => void: void`

    After parsed event.

  * `parser.on('error', (err: Error, s: string) => NepQ): void`

    On parse error, can fix result here, return null or undefined will call nepq.error.

* `parse(s: string, ...args): void`

 Parse string into request, then call callbacks from 'on'.

* `on(method: string, namespace: string, name: string, callback: (q: NepQ, ...args, next: Function) => void): void`

 Register callback into queue and will be called on parse.

 If next was called, next matched callback in queue will be called.

 method, namespace, or name can be null for matched anything.

* `use(callback: (q: NepQ, ...args, next: Function) => void): void`

 Short version for nepq.on(null, null, null, callback).

* `error(callback: (...args) => void): void`

 Callback will be called when parse error.

* `bodyParser(): (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void`

 Return body-parser function for "application/nepq" content-type.

 nepq.parse will be called after get request.

`class NepQ`

* `method: string`

* `namespace: string[]`

* `name: string`

* `param: any`

* `retrieve: any`

* `response(result?: any): any`

 Fillter result into retrieve format.

 Return result in retrieve format.

## Example
```js
var nepq = require('nepq')(),
    express = require('express');

var app = express(),
    users = [],
    _id = 0;

nepq.on('create', '', 'user', function (q, req, res, next) {
  if (!q.param.name || !q.param.pwd) {
    res.status(400).send('invalid name or password!');
    return;
  }
  var user = {
    id: _id++,
    name: q.param.name,
    pwd: q.param.pwd
  };
  users.push(user);
  res.json(q.response(user));
});

nepq.on('read', '', 'user', function(q, req, res, next) {
  var user = users.filter(function(x) {
    return (!q.param.id || q.param.id === x.id) &&
           (!q.param.name || q.param.name === x.name) &&
           (!q.param.pwd || q.param.pwd === x.pwd);
  });
  res.json(q.response(user ? user[0] : null));
});

nepq.use(function(q, req, res, next) {
  res.status(400).send('no api');
});

nepq.error(function(req, res, next) {
  res.status(400).send('bad request');
});

app.use(nepq.bodyParser());

app.use(function(req, res) {
  res.end('no api');
});

app.listen(8000);
```

```
$ curl localhost:8000
> no api

$ curl --header "content-type: application/nepq" localhost:8000
> bad request

$ curl --header "content-type: application/nepq" --data "create user() {}" localhost:8000
> invalid name or password!

$ curl --header "content-type: application/nepq" --data "create user(name: \"user1\", pwd: \"1234\")" localhost:8000
> {"id":0,"name":"user1","pwd":"1234"}

$ curl --header "content-type: application/nepq" --data "create user(name: \"user2\", pwd: \"6666\") { }" localhost:8000
> {}

$ curl --header "content-type: application/nepq" --data "read user(name: \"user2\") { id, pwd }" localhost:8000
> {"id":1,"pwd":"6666"}
```
