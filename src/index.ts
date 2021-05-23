import { Router, Response, RouterPipeline } from 'farrow-http'
import { List, SchemaCtor, SchemaCtorInput, Struct, toSchemaCtor, Any } from 'farrow-schema'
import { ApiDefinition, ApiEntries, getContentType, isApi } from 'farrow-api'
import { FormatResult, toJSON } from 'farrow-api/dist/toJSON'
import { createSchemaValidator, ValidationError, Validator } from 'farrow-schema/validator'
import {
  ApiError,
  ApiSuccess,
  SingleCalling,
  ApiResponseSingle,
  BatchResponse,
  IntrospectionCalling
} from 'farrow-api-server'

const BodySchema = Struct({
  path: List(String),
  input: Any,
})

const validateBody = createSchemaValidator(BodySchema)

const getErrorMessage = (error: ValidationError) => {
  let { message } = error

  if (Array.isArray(error.path) && error.path.length > 0) {
    message = `path: ${JSON.stringify(error.path)}\n${message}`
  }

  return message
}

export type CreateApiServiceOptions = {
  entries: ApiEntries
  server?: boolean
  Introspection?: boolean
}

export const createDenoApiService = (options: CreateApiServiceOptions): RouterPipeline => {
  let isNotProduction = process.env.NODE_ENV !== 'production'
  let config = {
    errorStack: isNotProduction,
    ...options,
  }
  let { entries } = options

  let router = Router()

  let validatorMap = new WeakMap<SchemaCtor, Validator>()

  let getValidator = (Schema: SchemaCtor) => {
    if (validatorMap.has(Schema)) {
      return validatorMap.get(Schema)!
    }
    let validator = createSchemaValidator(Schema)
    validatorMap.set(Schema, validator)
    return validator
  }

  let formatResult: FormatResult | undefined

  let handleCalling = async (calling: SingleCalling | IntrospectionCalling): Promise<ApiResponseSingle> => {
    /**
     * capture introspection request
     */
    if (calling.type === 'Introspection') {
      let output = (formatResult = formatResult ?? toJSON(entries))
      return ApiSuccess(output)
    }

    let bodyResult = validateBody(calling)

    if (bodyResult.isErr) {
      let message = getErrorMessage(bodyResult.value)
      return ApiError(message)
    }

    let api = get(entries, bodyResult.value.path)

    if (!isApi(api)) {
      let message = `The target API was not found with the path: [${bodyResult.value.path.join(', ')}]`
      return ApiError(message)
    }

    let definition = api.definition as ApiDefinition<SchemaCtorInput>

    let InputSchema = toSchemaCtor(getContentType(definition.input))
    let validateApiInput = getValidator(InputSchema)

    /**
     * validate input
     */
    let inputResult = validateApiInput(bodyResult.value.input)

    if (inputResult.isErr) {
      let message = getErrorMessage(inputResult.value)
      return ApiError(message)
    }

    try {
      let output = await api(inputResult.value)

      let OutputSchema = toSchemaCtor(getContentType(definition.output))
      let validateApiOutput = getValidator(OutputSchema)

      /**
       * validate output
       */
      let outputResult = validateApiOutput(output)

      if (outputResult.isErr) {
        let message = getErrorMessage(outputResult.value)
        return ApiError(message)
      }

      /**
       * response output
       */
      return ApiSuccess(outputResult.value)
    } catch (error) {
      let message = (config.errorStack ? error?.stack || error?.message : error?.message) ?? ''
      return ApiError(message)
    }
  }

  router.use(async (request, next) => {
    if (request.method?.toLowerCase() !== 'post') {
      return next()
    }

    if (request.body?.type === 'Batch') {
      // batch calling
      let callings = request.body!.callings

      if (Array.isArray(callings)) {
        let result = await Promise.all(callings.map(handleCalling))
        return Response.json(BatchResponse(result))
      }
      let message = `Unknown structure of request`
      return Response.json(ApiError(message))
    }

    // single calling
    return Response.json(await handleCalling(request.body))
  })

  return router
}

export const DenoApiService = createDenoApiService
