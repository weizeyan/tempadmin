<template>
  <a-card class="general-card" title="陪诊垫付任务">
    <a-descriptions :data="fields" bordered></a-descriptions>
  </a-card>
</template>

<script lang="ts" setup>
  import { DescData } from '@arco-design/web-vue';
  import { computed } from 'vue';
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

  const fields = computed<DescData[]>(() => {
    const info = props.data;
    return [
      {
        label: '陪诊人员',
        value: info.staff,
      },
      {
        label: '陪诊说明',
        value: info.remark,
      },
    ];
  });
</script>
