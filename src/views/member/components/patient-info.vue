<template>
  <a-card class="general-card" title="就诊人信息">
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
    const memberInfo = props.data;
    return [
      {
        label: '姓名',
        value: memberInfo.name,
      },
      {
        label: '保险卡号',
        value: memberInfo.cardNo,
      },
      {
        label: '出生日期',
        value: memberInfo.dob,
      },
      {
        label: '年龄',
        value: memberInfo.age,
      },
      {
        label: '性别',
        value: memberInfo.sex,
      },

      {
        label: '主/被保险人',
        value: memberInfo.relation,
      },
      {
        label: '国籍',
        value: memberInfo.nationality,
      },
      {
        label: '证件号码',
        value: memberInfo.nricNo,
      },

      {
        label: '证件类型',
        value: memberInfo.nricTypeDesc,
      },
      {
        label: '邮箱',
        value: memberInfo.email,
      },
      {
        label: '手机号',
        value: memberInfo.mobile,
      },
    ];
  });
</script>
