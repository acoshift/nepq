# Nep Query (nepq; NepQ)

Nep Query is an easy query pattern use in nepdb.

## Syntax

The syntax of nepq is influenced by Facebook's GraphQL but not complex.

### Request:

```
{method} {database}.{collection}({params}) {
  {retrieve}
}
```

**method**: one of CRUD (create, read, update, delete).

**database**: database to use.

**collection**: collection in database to use.

**params**: parameters.

**retrieve**: retrieve fields.

Request will convert to json for process.
```ts
interface Request {
  method: string;
  database: string;
  collection: string;
  params: any;
  retrieve: any;
}
```

Example:
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
  "database": "db",
  "collection": "user",
  "params": {
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

### Response:

Response is json with pattern

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
