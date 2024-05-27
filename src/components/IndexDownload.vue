<template>
  <div flex="~ col nowrap" class="w-400px mt-6 text-1rem flex-center">
    <template v-if="progress < 1">
      <q-linear-progress track-color="FFFFFF" color="00cb87" :value="progress" class="w-full !h-0.6rem rounded-xl" />

      <div class="text-center mt-4">下载中... {{ (progress * 100).toFixed(0) }}%</div>
    </template>
    <template v-else-if="!successInstall">
      <div class="flex items-center">
        <div style="color: #03b585" class="i-mdi:check-circle text-green-500 mr-2 text-1.25rem" />
        下载完成
      </div>
      <div class="mt-2">请在弹出的窗口中进行手动安装</div>
    </template>
    <template v-else>
      <div class="flex items-center">
        <div style="color: #03b585" class="i-mdi:check-circle text-green-500 mr-2 text-1.25rem" />
        安装完成
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

const store = useConfigStore();

async function downloadFile () {
  const path = `software.dmg`;

  // progress.value = 0.5;
  // await new Promise((resolve) => setTimeout(resolve, 10000000));
  const DOWNLOAD_URL = store.info.AppUrl;
  console.log("DOWNLOAD_URL:", DOWNLOAD_URL);

  const downloadPromise = invoke("download_file_custom", {
    url: DOWNLOAD_URL,
    path,
  });
  const unlisten = await listen("DOWNLOAD_PROGRESS", (event) => {
    const progress = (event.payload as any).percentage as number;
    // console.log(`Downloaded ${(progress * 100).toFixed(2)}%`);
    updateProgressBar(progress);
  });

  const unlisten2 = await listen("DOWNLOAD_FINISHED", (event) => {
    console.log(`Downloaded finished`);
    updateProgressBar(1);

    unlisten();
    unlisten2();
  });

  try {
    await downloadPromise;
    startWaitInstallSuccess()
    await invoke("install_dmg", { path });
  } catch (err) {
    console.error("Failed to download or install DMG file:", err);
  } finally {
    unlisten();
  }
}

const progress = ref(0);
function updateProgressBar (value: number) {
  progress.value = value;
}

// async function installDmg(filePath: string) {
//   try {
//     await open(filePath, { singleInstance: true })
//   } catch (err) {
//     console.error('Failed to open DMG file:', err)
//   }
// }

onMounted(downloadFile);

const successInstall = ref(false);
function startWaitInstallSuccess () {
  const interval = setInterval(async () => {
    const result = await store.checkIsInstalled()
    if (result) {
      clearInterval(interval);
      successInstall.value = true;
    }
  }, 4000);
}

// 安装成功后删除下载的文件，并卸载 dmg文件
import { Command } from "@tauri-apps/api/shell";
whenever(successInstall, async () => {
  const command = new Command("hdiutil");
  await command.execute().then((result) => {
    console.log("卸载结果:", result);
  }).catch((err) => {
    console.error("卸载失败:", err);
  });

  invoke("delete_file", { path: "software.dmg" });
});
</script>
