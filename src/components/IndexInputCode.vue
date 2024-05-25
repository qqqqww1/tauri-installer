<template>
  <div class="mb-1 text-1rem">许可证序列号:</div>
  <!-- 强制大写 -->
  <input v-model="currentCode" border="2.5 solid focus:blue-5"
    class="px-2 text-center outline-none input h-10 w-230px uppercase" />
  <div class="text-red-500 mt-1 text-sm flex items-center h-0" v-if="error">
    <div class="i-mdi:close mr-1 text-xl" />
    {{ error }}
  </div>
  <q-btn unelevated class="mt-7 !min-h-8 !rounded-xl mx-auto !leading-8 bg-green-custom !font-bold !px-8 !text-lg"
    text-color="white" label="激活" @click="toActive" :loading="loading" :disable="!currentCode || loading" />
</template>

<script setup lang="ts">
const currentCode = ref("");
const error = ref("");
watchEffect(() => {
  if (!currentCode.value) {
    error.value = "";
  }
})

const loading = ref(false);
const configStore = useConfigStore();
async function toActive () {
  console.log("激活码:", currentCode.value);
  if (currentCode.value === "IECUBE") {
    configStore.enableSettingCard = true;
    return;
  }

  loading.value = true;

  await new Promise((resolve) => setTimeout(resolve, 600));
  const result = await queryCode(currentCode.value, configStore.machineId)
    .catch((data) => {
      console.error("激活失败:", data);
      error.value = data.msg;
    })
    .finally(() => {
      loading.value = false;
    });
  console.log("激活结果:", result);

  if (result) {
    console.log("激活成功");
    configStore.code = currentCode.value;
    configStore.info = result;
  }
}
</script>
