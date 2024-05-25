import { invoke } from '@tauri-apps/api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import moment from 'moment'
import { Notify } from 'quasar'
import { Command } from '@tauri-apps/api/shell'
const command = new Command('pkgutil')

type Info = {
  AppUrl: string
  email: string
  grade: string
  id: string
  kami: string
  note: string
  state: 'y' | 'n'
  token: string
  vipExpDate: string
  vipExpTime: string
}

export const useConfigStore = defineStore('config', () => {
  const code = useStorage('code', '')
  const info = useStorage('info', {} as Info)

  const enableSettingCard = ref(false)
  const version = '2023 Q3 Pro'

  const machineUid = computedAsync(getMachineUID)

  async function getMachineUID() {
    try {
      const machineUID = await invoke('get_machine_uid')
      console.log('Machine UID:', machineUID)

      return machineUID as string
    } catch (error) {
      console.error('Failed to get machine UID:', error)
    }
  }

  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  const randomId = useStorage('randomId', generateUUID())
  const machineId = computed(() => {
    return machineUid.value || randomId.value
  })

  const lastSync = useStorage('lastSync', 0)

  const refresh = async () => {
    console.log('刷新中:', code.value, machineId.value)
    const result = await refreshCode(code.value, machineId.value).catch((data) => {
      console.error('刷新失败:', data)
      Notify.create({
        type: 'negative',
        message: data.msg
      })
    })

    if (!result) {
      info.value = {} as Info
      code.value = ''
      return false
    }

    console.log('刷新成功:', result)
    info.value = result
    lastSync.value = Date.now()
    return true
  }
  const checkSync = async () => {
    const todayStart = moment().startOf('day').valueOf()
    if (lastSync.value < todayStart && code.value) {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await refresh()
      return true
    }
  }

  const serverUrl = useStorage('serverUrl', 'http://154.3.1.68:100')
  const install = ref(false)
  const installed = useStorage('installed', false)

  const checkIsInstalled = async () => {
    const result = await new Promise<string>((resolve) => {
      const output = [] as string[]
      command.on('close', (code) => {
        resolve(output.join('\n'))
      })
      command.on('error', (err) => {
        console.error('Failed to execute command:', err)
        resolve('')
      })
      command.stdout.on('data', (data) => {
        output.push(data)
      })
      command.spawn()
    })

    console.log('result:', result)
    const isInstalled = result.toLowerCase().includes('com.ni.labviewcore_x64_230')

    console.log('isInstalled:', isInstalled)
    installed.value = isInstalled
    return isInstalled
  }
  return {
    code,
    info,
    enableSettingCard,
    version,
    machineId,
    refresh,
    checkSync,
    serverUrl,
    install,
    installed,
    checkIsInstalled
  }
})
