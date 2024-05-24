<template>
  <div class="mb-1">授权验证地址:</div>
  <!-- 强制大写 -->
  <input v-model="currentUrl" border="3 solid focus:blue-5"
    class="px-2 text-center outline-none input h-10 w-250px text-sm" />


  <div class="flex flex-nowrap mt-7 flex-center">
    <q-btn unelevated class="mr-4  !min-h-8 !rounded-xl bg-green-custom !font-bold !px-8 !text-lg" text-color="white"
      label="确定" @click="toActive" />
    <q-btn unelevated style="background-color: rgb(252, 72, 81) !important"
      class="!rounded-xl  !min-h-8 !font-bold !px-8 !text-lg" text-color="white" label="取消" @click="emits('close')" />
  </div>
</template>

<script setup lang="ts">
const configStore = useConfigStore();
const currentUrl = ref(configStore.serverUrl);

const emits = defineEmits(["close"]);
async function toActive () {
  configStore.serverUrl = currentUrl.value;
  emits("close");
}
</script>
