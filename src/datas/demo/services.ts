import type { DemoItem, RequestDemoList } from './types'

import createFetcher from '../../libs/createFetcher'
import type { BaseResponse } from '../../types/response'

export function fetchDemoList(params: RequestDemoList) {
  return createFetcher<BaseResponse<DemoItem[]>>({
    url: `/api/demo/list`,
    jsonMockup: '/apiMockup/demo/list.json',
    delay: 3000,
    params
  })
}

export function fetchDemoCreate(params: DemoItem) {
  return createFetcher<BaseResponse<DemoItem>>({
    method: 'POST',
    url: `/api/demo/create`,
    jsonMockup: '/apiMockup/demo/create.json',
    delay: 3000,
    params
  })
}
