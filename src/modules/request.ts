import { api } from 'src/modules/axios'
import { fetch, Body, Response, ResponseType, getClient } from '@tauri-apps/api/http'
import { Notify } from 'quasar'

export interface HttpResponse<T = unknown> {
  data: T
  code?: number
  success?: boolean
  message?: string
}

const parseError = (result: any) => {
  Notify.create({
    type: 'warning',
    position: 'bottom-right',
    message: result.msg ?? result.data
  })
}

const handleUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url
  }
  const baseUrl = useConfigStore().serverUrl || localStorage.getItem('serverUrl')

  return baseUrl + url
}

const handleResponse = (res: Response<any>) => {
  const data = res.data
  if (res.status === 200) {
    if (data.code === 1 || data.success || data.code == 200) {
      return data
    }
  }

  throw data
}

const fetchAgent = async (url: string, options: any) => {
  console.log('url', url, 'opt', options)
  return fetch(url, options)
}

const get = async <T>(url: string, params?: any) => {
  const response = await fetchAgent(handleUrl(url), {
    method: 'GET',
    query: params
  })
  return handleResponse(response).data as T
}

const post = async (url: string, params?: any) => {
  const form = new FormData()
  if (params !== undefined) {
    Object.keys(params).forEach((key) => {
      form.append(key, params[key])
    })
  }
  const response = await fetchAgent(handleUrl(url), {
    method: 'POST',
    body: Body.form(form)
  }).catch((e) => {
    console.error(e)
    parseError(e)
    throw new Error('执行出错')
  })
  return handleResponse(response).data
}

const getAxios = async (url: string, params?: any) => {
  const response = await api.get(url, { params })
  return response.data
}

const postAxios = async (url: string, params?: any) => {
  const response = await api.post(url, params)
  return response.data
}
export default {
  get,
  post,
  getAxios,
  postAxios
}
