<template>
  <a-card class="general-card">
    <a-button v-if="state.initData" type="primary" @click="open"
      >独立窗口打开</a-button
    >
  </a-card>

  <a-card class="iframe-card">
    <iframe
      class="iframe-wrap"
      :src="state.initData?.url"
      frameborder="0"
    ></iframe>
  </a-card>
</template>

<script lang="ts" setup>
  import { onMounted, ref, reactive, computed } from 'vue';
  import { eccsUrl } from '@/api/member';
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
    memberControlNo: props.data.memberControlNo,
    initData: null as Record<string, any> | null,
  });

  async function getInitData() {
    const json: any = await eccsUrl({
      memberControlNo: state.memberControlNo,
      planCode: props.data.plan,
      corporateCode: props.data.corporateCode,
    }).catch(() => false);
    return json
      ? {
          url: json.data,
        }
      : null;
  }

  function open() {
    window.open(state.initData?.url);
  }
  onMounted(async () => {
    state.initData = await getInitData();
  });
</script>

<style lang="less" scoped>
  .iframe-card {
    margin: 10px 20px;
  }
  .iframe-wrap {
    width: 100%;
    height: 700px;
  }
</style>
