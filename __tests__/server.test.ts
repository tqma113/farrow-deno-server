import fs from 'fs'
import request from 'supertest'
import { Int, ObjectType, Type } from 'farrow-schema'
import { Http, HttpPipelineOptions } from 'farrow-http'
import { Api } from 'farrow-api'
import { DenoService } from '../src/index'
import { createApiClients } from 'farrow/dist/api-client'

const createHttp = (options?: HttpPipelineOptions) => {
  return Http({
    logger: false,
    ...options,
  })
}

class CountState extends ObjectType {
  count = {
    description: 'count of counter',
    [Type]: Int,
  }
}

let count = 0

const getCount = Api(
  {
    input: {},
    output: CountState,
  },
  () => {
    return {
      count,
    }
  },
)

const setCount = Api(
  {
    input: {
      newCount: {
        description: 'new count value',
        [Type]: Int,
      },
    },
    output: CountState,
  },
  (input) => {
    count = input.newCount
    return getCount({})
  },
)

const triggerError = Api(
  {
    input: {},
    output: {},
  },
  () => {
    throw new Error('trigger error')
  },
)

const entries = {
  getCount,
  setCount,
  triggerError,
}

const CounterService = DenoService({
  entries,
})

describe('deno-server', () => {
  it('client in server services', async () => {
    const http = createHttp()
    const server = http.server()

    const PORT = 3000
    const path = `${__dirname}/client.ts`

    http.route('/counter').use(CounterService)

    http.listen(PORT)

    const client = createApiClients({
      services: [
        {
          src: `http://localhost:${PORT}/counter`,
          dist: path,
          alias: '/api',
        },
      ],
    })
  
    await client.sync()

    const source = fs.readFileSync(path, 'utf-8')

    await request(server)
      .get('/counter/client.ts')
      .send()
  })
})