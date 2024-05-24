<template>
  <div flex="~ col nowrap" @click.right="isExpire ? undefined : (showRefreshBtn = true)"
    class="w-100vw text-xl font-bold items-center text">
    <div>LabVIEW 2023 Q3 Pro</div>
    <div class="flex items-center mt-3 text-xl" @click.right="showExitBtn = true"
      v-if="!showExitBtn && !showRefreshBtn">
      <q-img :src="isExpire ? 许可过期 : 许可图标" class="!w-6 mr-2" no-spinner no-transition />
      {{ isExpire ? "许可证已过期" : "已许可" }}
    </div>
    <div v-if="showExitBtn || isExpire">
      <q-btn unelevated style="background-color: rgb(252, 72, 81) !important"
        class="!rounded-xl !font-bold !px-8 !text-lg !min-h-8 mt-2" text-color="white" label="停用许可证" ref="changeBtn"
        @click.stop="store.code = ''" />
    </div>
    <div v-else-if="showRefreshBtn">
      <q-btn unelevated class="!rounded-xl !font-bold !text-lg !min-h-8  bg-green-custom !px-8 mt-2" text-color="white"
        label="刷新许可证信息" ref="changeBtn" @click.stop="toRefresh" />
    </div>

    <div class="mt-3 text-lg">
      到期时间: {{ moment(info.vipExpDate).format("YYYY-MM-DD") }}
    </div>
    <div v-if="!isExpire" class="text-lg mt-2">剩余{{ restDay }}天</div>
  </div>
</template>

<script setup lang="ts">
import 许可过期 from "~/assets/许可过期.svg";
import 许可图标 from "~/assets/许可图标.svg";
import moment from "moment";
import { Notify, is } from "quasar";

const store = useConfigStore();
const info = computed(() => store.info);
const isExpire = computed(() => {
  if (!info.value) return false;
  return new Date(info.value.vipExpDate) < new Date();
});
const restDay = computed(() => {
  if (!info.value) return 0;
  return Math.floor(
    (new Date(info.value.vipExpDate).getTime() - new Date().getTime()) /
    (1000 * 60 * 60 * 24)
  );
});

watchEffect(() => {
  // 如果许可证已过期，或者到期时间不到7天 弹窗
  if (isExpire.value) {
    Notify.create({
      message: "许可证已过期，请您更换许可证",
      color: "negative",
      position: "bottom-right",
      timeout: 10000,
    });
  } else if (restDay.value < 7) {
    Notify.create({
      message: `许可证还有${restDay.value}天到期，请您及时更换许可证`,
      color: "warning",
      position: "bottom-right",
      timeout: 10000,
    });
  }
});

const showExitBtn = ref(false);
const showRefreshBtn = ref(false);
const changeBtn = ref();
onClickOutside(changeBtn, (e) => {
  if (isExpire.value) return;

  showExitBtn.value = false;
  showRefreshBtn.value = false;
});

function toRefresh () {
  store.refresh().then((e) => {
    if (!e) return;
    Notify.create({
      message: "许可证信息刷新成功",
      color: "positive",
      position: "bottom-right",
      timeout: 5000,
    });
  });
}

// exec pkgutil --pkgs | grep -i LabView
import { Command } from '@tauri-apps/api/shell';
const command = new Command('pkgutil');

setTimeout(async () => {
  if (!isExpire.value && store.code) {
    const result = await new Promise<string>((resolve) => {
      const output = [] as string[];
      command.on('close', (code) => {
        resolve(output.join('\n'));
      });
      command.on('error', (err) => {
        console.error('Failed to execute command:', err);
        resolve('');
      });
      command.stdout.on('data', (data) => {
        output.push(data);
      });
      command.spawn();
    });

    console.log('result:', result);
    const isInstalled = result.toLowerCase().includes('labview');
    store.install = !isInstalled;
  }
}, 3000);
</script>
