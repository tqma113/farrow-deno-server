/**
 * This file was generated by farrow-api
 * Don't modify it manually
 */

import { createApiPipelineWithUrl, ApiInvokeOptions } from 'farrow-api-client'

/**
 * {@label CountState}
 */
export type CountState = {
  /**
   * @remarks count of counter
   */
  count: number
}

export const url = '/api'

export const apiPipeline = createApiPipelineWithUrl(url)

export const api = {
  getCount: (input: {}, options?: ApiInvokeOptions) =>
    apiPipeline.invoke(
      { type: 'Single', path: ['getCount'], input },
      options
    ) as Promise<CountState>,
  setCount: (
    input: {
      /**
       * @remarks new count value
       */
      newCount: number
    },
    options?: ApiInvokeOptions
  ) =>
    apiPipeline.invoke(
      { type: 'Single', path: ['setCount'], input },
      options
    ) as Promise<CountState>,
  triggerError: (input: {}, options?: ApiInvokeOptions) =>
    apiPipeline.invoke(
      { type: 'Single', path: ['triggerError'], input },
      options
    ) as Promise<{}>,
}