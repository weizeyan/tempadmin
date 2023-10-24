<template>
  <a-card class="general-card" title="预约结果">
    <a-descriptions :data="fields" bordered></a-descriptions>
  </a-card>
</template>

<script lang="ts" setup>
  import { DIRECT_PAYMENT_METHODS } from '@/utils/consts';
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
        label: '直付方式',
        value: info.directPaymentMethod
          ? DIRECT_PAYMENT_METHODS[info.directPaymentMethod]
          : '-',
      },
      {
        label: '处理状态',
        value: info.processingStatusDesc || '-',
      },
      {
        label: '就诊医院',
        value: info.finalHospital || '-',
      },
      {
        label: '医院地址',
        value: info.finalHospitalAddress || '-',
      },
      {
        label: '就诊科室',
        value: info.finalDepartment || '-',
      },
      {
        label: '就诊医生',
        value: info.finalDoctor || '-',
      },
      {
        label: '就诊时间',
        value: info.finalVisitDate
          ? `${info.finalVisitDate} ${info.finalVisitTime}`
          : '-',
      },
      {
        label: '联系人姓名',
        value: info.finalContact || '-',
      },
      {
        label: '联系人电话',
        value: info.finalContactMobile || '-',
      },
    ];
  });
</script>
