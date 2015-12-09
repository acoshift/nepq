# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![github tag](https://img.shields.io/github/tag/acoshift/nepq.svg)]()
[![github commit](https://img.shields.io/github/commits-since/acoshift/nepq/v1.0.2.svg)]()
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is a query language influenced by Facebook's GraphQL.

## Request

```
{method} {namespace}.{name}({param}) {
  {retrieve}
}
```

Request will be parsed into object:

```ts
interface Request {
  method: string;
  namespace: string[];
  name: string;
  param: any;
  retrieve: any;
}
```

* **method**: method of query. (ex. create, read, update, delete)
* **namespace**: namespace of query, can be empty and nested. (ex. db, )
* **name**: name can be empty. (ex. user, product)
* **param**: parameters for query. (see more in example)
* **retrieve**: fields that want in response. (see more in example)

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

## Response

Response can be anything.

## API Documentation

```js
var nepq = require('nepq')();
// or
var nepq = require('nepq');
var nq = nepq();
```

* `nepq.parser.parse(s: string): Request`

 Parse string into request object.

 Return object if valid, otherwise null.

* `nepq.parse(s: string): void`

 Parse string into request, then call callbacks from 'on'.

* `nepq.on(method: string, namespace: string, name: string, callback: (q: Request, req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void): void`

 Register callback into queue and will be call on parse.

 If next was called, next matched callback in queue will be called.

 method, namespace, or name can be null for matched anything.

* `nepq.use(callback: (q: Request, req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void): void`

 Short version for nepq.on(null, null, null, callback).

* `nepq.error(callback: (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void): void`

 Callback will be called when parse error.

* `nepq.bodyParser(): (req: http.IncomingMessage, res: http.ServerResponse, next: Function) => void`

 Return body-parser function for "application/nepq" content-type.

 nepq.parse will be called after get request.

* `nepq.response(result?: any): any`

 Traverse over result for fillter result into retrieve format.

 Return result in retrieve format.

* `nepq.status(statusCode?: any, statusMessage?: any): NepQ`

 Write statusCode and statusMessage for nepq.send.

 Return its instance (this).

* `nepq.send(result?: any): void`

 Call nepq.response(result) and send with http.ServerResponse.

* `nepq.request: Request`

 Request object from nepq.parse.

* `nepq.statusCode: any`

 Status code that will be sent with nepq.send.

* `nepq.statusMessage: any`

 Status message that will be sent with nepq.send.

* `nepq.req: http.IncomingMessage`

 Http request from body-parser.

* `nepq.res: http.ServerResponse`

 Http response from body-parser.

## Example
```js
var nepq = require('nepq')(),
    express = require('express');

var app = express(),
    users = [],
    _id = 0;

nepq.on('create', '', 'user', function (q, req, res) {
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
  nepq.send(user);
});

nepq.on('read', '', 'user', function(q) {
  var user = users.filter(function(x) {
    return (!q.param.id || q.param.id === x.id) &&
           (!q.param.name || q.param.name === x.name) &&
           (!q.param.pwd || q.param.pwd === x.pwd);
  });
  nepq.send(user ? user[0] : null);
});

nepq.use(function() {
  nepq.status(400).send('no api');
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
