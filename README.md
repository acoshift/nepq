# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![GitHub license](https://img.shields.io/github/license/mashape/apistatus.svg)]()

Nep Query is an easy query pattern.

## Usage
`$ npm install nepq`

```js
var nepq = require("nepq").parser;

var n = 'create myweb.user(username: "user1", password: "1234")';
var j = nepq.parse(n);
console.log(j);
```

## Syntax

The syntax of nepq is influenced by Facebook's GraphQL but not complex.

### Request:

```
{method} {namespace}.{collection}({param}) {
  {retrieve}
}
```

**method**: one of CRUD (create, read, update, delete).

**namespace**: namespace to use.

**collection**: collection in namespace to use.

**param**: parameters.

**retrieve**: retrieve fields.

Request will convert to json for process.

```ts
interface Request {
  method: string;
  namespace: string;
  collection: string;
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

will convert to

```json
{
  "method": "create",
  "namespace": "db",
  "collection": "user",
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

will convert to

```json
{
  "method": "read",
  "namespace": "db",
  "collection": "user",
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

```
// TODO
```

will convert to

```json
// TODO
```

##### Delete

```
delete db.user(id: 1234) { }
```

will convert to

```json
{
  "method": "delete",
  "namespace": "db",
  "collection": "user",
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

will convert to

```json
{
  "method": "delete",
  "namespace": "db",
  "collection": "user",
  "param": {
    "id": 1234
  },
  "retrieve": null
}
```

### Response:

Response is json with pattern.

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
