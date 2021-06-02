# farrow-deno-server

[![NPM](https://img.shields.io/npm/v/farrow-deno-server.svg)](https://www.npmjs.com/package/farrow-deno-server)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](https://github.com/tqma113/farrow-deno-server#readme)
[![Action Status](https://github.com/tqma113/farrow-deno-server/workflows/Test/badge.svg)](https://github.com/tqma113/farrow-deno-server/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/tqma/farrow-deno-server/blob/master/LICENSE)

A deno server middleware for [farrow-http](https://github.com/Lucifier129/farrow).

## Install

```sh
npm install farrow-deno-server

yarn add farrow-deno-server
```

## Frist Look

```ts
// server
import { Http } from 'farrow-http'
import { DenoService } from from 'farrow-deno-server'

// api defination
...

const entries = {
  getCount,
  setCount,
  triggerError,
}

const CounterService = DenoService({
  entries,
})
const http = Http()
const server = http.server()

http.route('/counter').use(CounterService)

http.listen(3000)
```

```ts
// client
import { api } from 'http://localhost:3000/counter/client.ts'

api.getCount({}).then(console.log)
```

## Options

### entries

```ts
entries: ApiEntries
```

[ApiEntries](https://github.com/Lucifier129/farrow/blob/master/packages/farrow-api/src/api.ts#L111)

### namesapce

```ts
namesapce: string = 'client'
```

it affect the path of file:

```ts
import { api } from 'http://localhost:3000/counter/client.ts'
```

in client.

### codegen

```ts
codegen?: CodegenOptions
```

[CodegenOptions](https://github.com/Lucifier129/farrow/blob/master/packages/farrow-api/src/codegen.ts#L126)

### transform

```ts
transform?: (source: string) => string
```

[transform](https://github.com/Lucifier129/farrow/blob/master/packages/farrow/src/api-client/index.ts#L51)

### format

```ts
format?: (source: string) => string
```

[format](https://github.com/Lucifier129/farrow/blob/master/packages/farrow/src/api-client/index.ts#L55)
