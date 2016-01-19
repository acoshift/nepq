# Nep Query (nepq; NepQ)

[![Build Status](https://travis-ci.org/acoshift/nepq.svg?branch=master)](https://travis-ci.org/acoshift/nepq)
[![npm version](https://img.shields.io/npm/v/nepq.svg)](https://www.npmjs.com/package/nepq)
[![npm license](https://img.shields.io/npm/l/nepq.svg)]()

Nep Query is a query language influenced by Facebook's GraphQL.

*Body-parser will be moved to "nepq-bodyparser"*

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

> Basic request.
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

## Example
```js
var nepq = require('nepq').parser;

console.log(nepq.parse('read stock.product(id: 10) { name, price }'));
```
