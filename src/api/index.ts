import api from 'src/modules/request'
export const queryCode = (code: string, machineId: string) =>
  api.post('/api/logon', {
    user: code,
    udid: machineId.replace(/-/g, '')
  })

export const refreshCode = (code: string, machineId: string) =>
  api.post('/api/refresh', {
    user: code,
    udid: machineId.replace(/-/g, '')
  })

type AppInfo = {
  name: string
  version: string
  AppMsg: string
}
export const getInfo = () => api.get<AppInfo>('/api/ini')
