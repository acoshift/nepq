# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![github tag](https://img.shields.io/github/tag/acoshift/nepq.svg)]()
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is an easy query pattern.

## Usage
```js
var nepq = require('nepq')(),
    express = require('express');

var app = express(),
    users = [],
    _id = 0;

nepq.on('create', null, 'user', function (q) {
  if (!q.param.name || !q.param.pwd) return nepq.response(null, 'invalid name or password!');
  var user = {
    id: _id++,
    name: q.param.name,
    pwd: q.param.pwd
  };
  users.push(user);
  return nepq.response(user, null);
});

nepq.on('read', null, 'user', function (q) {
  var user = users.filter(function (x) {
    return (!q.param.id || q.param.id === x.id) && (!q.param.name || q.param.name === x.name) && (!q.param.pwd || x.pwd);
  });
  return nepq.response(user ? user[0] : null, null);
});

app.use(nepq.bodyParser());

app.use(function (req, res) {
  res.json(nepq.response(null, 'no api'));
});

app.listen(8000);
```
```
$ curl localhost:8000
> {"ok":0,"error":"no api","result":null}

$ curl --header "content-type: application/nepq" --data "create user() {}" localhost:8000
> {"ok":0,"error":"invalid name or password!","result":null}

$ curl --header "content-type: application/nepq" --data "create user(name: \"user1\", pwd: \"1234\")" localhost:8000
> {"ok":1,"error":null,"result":{"id":0,"name":"user1","pwd":"1234"}}

$ curl --header "content-type: application/nepq" --data "create user(name: \"user2\", pwd: \"6666\") { }" localhost:8000
> {"ok":1,"error":null,"result":{}}

$ curl --header "content-type: application/nepq" --data "read user(name: \"user2\") { id, pwd }" localhost:8000
> {"ok":1,"error":null,"result":{"id":1,"pwd":"6666"}}
```

## Syntax

The syntax of nepq is influenced by Facebook's GraphQL but not complex.

### Request:

```
{method} {namespace}.{name}({param}) {
  {retrieve}
}
```

**method**: method can be anything (ex. CRUD: create, read, update, delete).

**namespace**: namespace, can be nested or empty.

**name**: name of anything.

**param**: parameters, can be json.

**retrieve**: fields that server will include in response. If retrieve is null, server should return all fields.

Request will be converted into json.

```ts
interface Request {
  method: string;
  namespace: string[];
  name: string;
  param: any;
  retrieve: any;
}
```

#### Example:
```
create db.user({
  "username": "me",
  "email": "me@email.com",
  "tel": "+661234567",
  "address": {
    "province": "Bangkok",
    "zip": "12345",
    "country": "TH"
  }
}) {
  id
}
```
```json
{
  "method": "create",
  "namespace": [ "db" ],
  "name": "user",
  "param": {
    "username": "me",
    "email": "me@email.com",
    "tel": "+661234567",
    "address": {
      "province": "Bangkok",
      "zip": "12345",
      "country": "TH"
    }
  },
  "retrieve": {
    "id": 1
  }
}
```
---
```
read db.user(email: "me@email.com") {
  id,
  username,
  email,
  address: {
    zip,
    country
  }
}
```
```json
{
  "method": "read",
  "namespace": [ "db" ],
  "name": "user",
  "param": {
    "email": "me@email.com"
  },
  "retrieve": {
    "id": 1,
    "username": 1,
    "email": 1,
    "address": {
      "zip": 1,
      "country": 1
    }
  }
}
```
---
```
update db.user(select: {"id": 1234 }, update: {
  "email": "me2@mail.com"
}) { }
```
```json
{
  "method": "update",
  "namespace": [ "db" ],
  "name": "user",
  "param": {
    "select": {
      "id": 1234
    },
    "update": {
      "email": "me2@mail.com"
    }
  },
  "retrieve": {
  }
}
```
---
```
delete db.user(id: 1234)
```
```json
{
  "method": "delete",
  "namespace": [ "db" ],
  "name": "user",
  "param": {
    "id": 1234
  },
  "retrieve": null
}
```

### Response:

Response is a simple json.

```ts
interface Response {
  ok: number;
  error: any;
  result: any;
}
```

Example:

```json
{
  "ok": 1,
  "error": null,
  "result": {
    "id": 1234,
    "username": "me",
    "email": "me@email.com",
    "address": {
      "zip": "12345",
      "country": "TH"
    }
  }
}
```
