import axios, { type AxiosInstance } from 'axios'

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 60000
})
