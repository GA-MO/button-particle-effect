import { useMutation, useQuery } from '@tanstack/react-query'
import { getQueryClient } from '../../libs/reactQuery'
import { fetchDemoList, fetchDemoCreate } from './services'
import type { RequestDemoList } from './types'

export const useDemoList = (params: RequestDemoList) => {
  return useQuery({
    queryKey: ['demoList', params],
    queryFn: () => fetchDemoList(params),
    select: (data) => data.data
  })
}

export const useCreateDemo = () => {
  return useMutation({
    mutationFn: fetchDemoCreate,
    onSuccess: () => {
      getQueryClient().invalidateQueries({ queryKey: ['demoList'] })
    }
  })
}
