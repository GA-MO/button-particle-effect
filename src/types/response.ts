export type BaseResponse<T> = {
  code: number
  message: string
  data: T
}
