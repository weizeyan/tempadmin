<template>
  <div>
    <a-button class="btn-1" type="primary" @click="onOpen"
      >独立窗口打开</a-button
    >
    <a-card class="iframe-card">
      <iframe class="iframe-wrap" :src="state.url" frameborder="0"></iframe>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { reactive, onMounted } from 'vue';
  import dayjs from 'dayjs';

  const props = withDefaults(
    defineProps<{
      data: Record<string, any>;
    }>(),
    {
      data() {
        return {};
      },
    }
  );

  const state = reactive({
    url: '',
  });

  const onOpen = () => {
    window.open(state.url);
  };

  onMounted(() => {
    const { claimId } = props.data;

    const ts = dayjs().format('DD/MM/YYYY HH:mm:ss');

    state.url = `${
      import.meta.env.VITE_ECCS_URL
    }/CSPortal/Forms/MSWA0214_CS?cid=${claimId}&ishist=0&ts=${ts}&from=csPortal`;
  });
</script>

<style lang="less" scoped>
  .btn-1 {
    margin: 0 20px;
  }

  .iframe-card {
    margin: 10px 20px;
  }
  .iframe-wrap {
    width: 100%;
    height: 700px;
  }
</style>
