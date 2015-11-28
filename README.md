# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![github tag](https://img.shields.io/github/tag/acoshift/nepq.svg)]()
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is an easy query pattern.

## Usage
`$ npm install nepq`

#### Example
```
$ npm init
$ npm install express --save
$ npm install nepq --save
$ npm install -g typescript tsd
$ tsc --init
$ tsd init
$ tsd install express --save
```
index.ts
```ts
/// <reference path="./typings/tsd.d.ts"/>
/// <reference path="./node_modules/nepq/nepq.d.ts"/>

import * as nepq from 'nepq';
import * as express from 'express';

var app = express(),
    nepParser = nepq(),
    users = [],
    _id = 0;

nepParser.on('create', null, 'user', (param) => {
  if (!param.name || !param.pwd) return nepParser.response(null, 'invalid name or password!');
  let user = {
    id: _id++,
    name: param.name,
    pwd: param.pwd
  };
  users.push(user);
  return nepParser.response(user, null);
});

nepParser.on('read', null, 'user', (param) => {
  let user = users.filter((x) => {
    return (!param.id || param.id === x.id) && (!param.name || param.name === x.name) && (!param.pwd || x.pwd);
  });
  return nepParser.response(user ? user[0] : null, null);
});

app.use(nepParser.bodyParser());

app.use((req, res) => {
  res.json(nepParser.response(null, 'no api'));
});

app.listen(8000);
```
```
$ tsc -p .
$ node build/index.js
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

**method**: one of CRUD (create, read, update, delete).

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

##### Create

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

##### Read

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

##### Update

Update method can be implement many ways.

For example

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

##### Delete

```
delete db.user(id: 1234) { }
```
```json
{
  "method": "delete",
  "namespace": [ "db" ],
  "name": "user",
  "param": {
    "id": 1234
  },
  "retrieve": {
  }
}
```

or

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
