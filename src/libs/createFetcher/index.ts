import type { ServiceError } from '../../types/serviceError'
import { modals } from '@mantine/modals'
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { httpClient } from '../axios/apiClient'
import { removeCookie } from 'typescript-cookie'
import { MODAL_APPLICATION_ERROR } from '../mantine/AppErrorModal'

export interface FetcherOptions extends AxiosRequestConfig {
  mock?: boolean
  jsonMockup?: string
  delay?: number
  showErrorDialog?: boolean
}

export const defaultOptions: FetcherOptions = {
  mock: true,
  jsonMockup: '',
  delay: 0,
  timeout: 0,
  showErrorDialog: true
}

function shouldUseMockup(options: FetcherOptions) {
  if (!import.meta.env.DEV) return false
  if (!options.mock) return false
  if (options.jsonMockup === '') return false

  return true
}

function createFetcher<T>(options: FetcherOptions) {
  const fetchOptions: FetcherOptions = {
    ...defaultOptions,
    ...options
  }

  return new Promise<AxiosResponse<T>['data']>((resolve, reject) => {
    async function callFetch() {
      try {
        if (shouldUseMockup(fetchOptions)) {
          const response = await httpClient.get<T>(`${fetchOptions.jsonMockup}`)
          resolve(response.data)
        } else {
          const response = await httpClient.request<T>(fetchOptions)
          resolve(response.data)
        }
      } catch (error) {
        let title = 'Error'
        let message = 'พบข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        let isUnauthorized = false

        if (axios.isAxiosError(error)) {
          title = error.response?.statusText ?? title
          message = error.response?.data.message || error.message
          isUnauthorized = error.response?.status === 401
        }

        if (isUnauthorized) {
          removeCookie('SID')
          window.location.href = '/login'
        }

        const appError: ServiceError = {
          title,
          message
        }

        if (fetchOptions.showErrorDialog) {
          modals.openContextModal({
            modal: MODAL_APPLICATION_ERROR,
            withCloseButton: false,
            centered: true,
            innerProps: {
              title: appError.title,
              message: appError.message
            }
          })
        }

        reject(appError)
      }
    }

    setTimeout(() => callFetch(), fetchOptions.delay || 0 * 1000)
  })
}

export default createFetcher
