<template>
  <div class="w-100vw h-100vh select-none" flex="~ col nowrap">
    <div
      data-tauri-drag-region
      class="px-4 py-3 font-bold items-center bg-light-600 text-lg"
      flex="~ nowrap"
    >
      <q-img :src="顶栏图标" class="!w-6 !h-6 mr-3" no-spinner no-transition />
      许可证激活
      <q-space />
      <q-badge
        rounded
        class="w-4 h-4 transition-all hover:drop-shadow-lg hover:scale-110"
        color="red"
        @click="quitApp"
      />
    </div>

    <div flex="~ col nowrap grow" class="flex-center relative">
      <q-img :src="LOGO" class="!w-8 absolute top-6 left-6" no-spinner no-transition />

      <div class="flex flex-nowrap items-center mb-10 text">
        <q-img :src="LabView" class="!w-100px mr-4" no-spinner no-transition />
        <div class="text-64px leading-64px flex items-start">
          {{ appInfo?.name || "LabVIEW" }}
          <div class="text-lg font-bold">TM</div>
        </div>
      </div>
      <div class="text-xl font-bold text flex flex-col flex-nowrap">
        <IndexChangeServerCard
          v-if="configStore.enableSettingCard"
          @close="configStore.enableSettingCard = false"
        />
        <IndexDownload v-else-if="configStore.install" />
        <IndexInputCode v-else-if="!configStore.code" />
        <IndexInfo v-else />
      </div>
    </div>

    <div
      class="p-4 text-1.05rem bg-light-500 font-bold text"
      v-if="appInfo?.AppMsg"
      data-tauri-drag-region
    >
      <div v-html="appInfo.AppMsg.split('\\n').join('<br />')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { appWindow } from "@tauri-apps/api/window";
import 顶栏图标 from "~/assets/顶栏图标.svg";
import LOGO from "~/assets/logo.png";
import LabView from "~/assets/LabVIEW图标.svg";

const cacheAppInfo = useStorage("appInfo", {} as any);
const appInfo = computedAsync(getInfo, cacheAppInfo.value);
whenever(appInfo, (value) => {
  cacheAppInfo.value = value;
});

const configStore = useConfigStore();
configStore.checkSync();

//屏蔽右键菜单
document.oncontextmenu = function (event: any) {
  if (window.event) {
    event = window.event;
  }
  try {
    var the = event.srcElement;
    if (
      !(
        (the.tagName == "INPUT" && the.type.toLowerCase() == "text") ||
        the.tagName == "TEXTAREA"
      )
    ) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
const quitApp = () => {
  appWindow.close();
};
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
