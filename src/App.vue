<template>
  <div class="w-100vw h-100vh select-none" flex="~ col nowrap" style="user-select: none">
    <!-- <div data-tauri-drag-region class="px-4 py-2 font-bold items-center bg-light-600 text-sm" flex="~ nowrap">
      <q-img :src="顶栏图标" class="!w-4 !h-4 mr-2" no-spinner no-transition />
      许可证激活
      <q-space />
      <q-badge rounded class="w-3 h-3 transition-all hover:drop-shadow-lg hover:scale-110" color="red"
        @click="quitApp" />
    </div> -->

    <div flex="~ col nowrap grow" class="items-center relative">
      <q-img :src="LOGO" class="!w-6 absolute top-5 left-5" no-spinner no-transition />

      <div class="flex flex-nowrap items-center mb-6 mt-10 text">
        <q-img :src="LabView" class="!w-70px mr-3" no-spinner no-transition />
        <div class="text-48px leading-48px flex items-start">
          {{ appInfo?.name || 'LabVIEW' }}
          <div class="text-sm pt-1 font-bold">TM</div>
        </div>
      </div>
      <div class="text-lg font-bold text flex flex-col flex-nowrap">
        <IndexChangeServerCard v-if="configStore.enableSettingCard" @close="configStore.enableSettingCard = false" />
        <IndexDownload v-else-if="configStore.install" />
        <IndexInputCode v-else-if="!configStore.code" />
        <IndexInfo v-else />
      </div>
    </div>

    <div class="p-4 pt-5 text-sm bg-light-500 font-bold text" v-if="appInfo?.AppMsg" data-tauri-drag-region>
      <div v-html="appInfo.AppMsg.split('\\n').join('<br />')" data-tauri-drag-region />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appWindow } from '@tauri-apps/api/window'
import 顶栏图标 from '~/assets/顶栏图标.svg'
import LOGO from '~/assets/logo.png'
import LabView from '~/assets/LabVIEW图标.svg'

const cacheAppInfo = useStorage('appInfo', {} as any)
const appInfo = computedAsync(getInfo, cacheAppInfo.value)
whenever(appInfo, (value) => {
  cacheAppInfo.value = value
})

const configStore = useConfigStore()
configStore.checkSync()

//屏蔽右键菜单
document.oncontextmenu = function (event: any) {
  if (window.event) {
    event = window.event
  }
  try {
    var the = event.srcElement
    if (
      !((the.tagName == 'INPUT' && the.type.toLowerCase() == 'text') || the.tagName == 'TEXTAREA')
    ) {
      return false
    }
    return true
  } catch (e) {
    return false
  }
}
const quitApp = () => {
  appWindow.close()
}
</script>

<style lang="sass">
.text
  color: rgb(91,91,91)

.input
  border-width: 3px
  border-color: rgb(91,91,91)
  border-radius: 8px

.bg-green-custom
  background-color: rgb(24, 196, 136) !important
</style>
