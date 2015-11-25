# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![npm download](https://img.shields.io/github/tag/acoshift/nepq.svg)]()
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm download](https://img.shields.io/npm/dt/nepq.svg)]()
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is an easy query pattern.

## Usage
`$ npm install nepq`

```js
var nepq = require("nepq");

var n = 'create myweb.db.user(username: "user1", password: "1234")';
var j = nepq.parse(n);
console.log(j);
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

**retrieve**: fields that server will include in response, can be null or empty.

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

will convert to

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

will convert to

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

will convert to

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
