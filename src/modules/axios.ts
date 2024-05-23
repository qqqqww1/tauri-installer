import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Notify } from 'quasar'

export interface HttpResponse<T = unknown> {
  data: T
  code?: number
  success?: boolean
  message?: string
}

// replace this with i18n
const lang: string[] = []
const parseError = (result: any) => {
  Notify.create({
    type: 'warning',
    position: 'bottom-right',
    message: result.msg ?? result.data
  })
}

const api: AxiosInstance = axios.create({
  withCredentials: true
})

api.interceptors.request.use((req: AxiosRequestConfig) => {
  //Authorization should be processed here
  return req
})

api.interceptors.response.use(
  (res: AxiosResponse<HttpResponse>) => {
    if (res.data?.code === 200 || res.data?.success) {
      return res
    }
    // business login error can be processed here
    parseError(res.data)
    return Promise.reject(res)
  },

  async (err) => {
    const response = err.response
    parseError(response.data)
    return Promise.reject(response)
  }
)

export { api, axios }
