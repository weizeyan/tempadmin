<template>
  <a-card class="general-card" :title="data.name + suspend">
    <template #title>
      <span>{{ data.name }}</span>
      <span :class="{ 'b-status-red': data.suspendStatus === 'S' }">
        {{ suspend }}
      </span>
    </template>
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
        return {
          memberInfo: {},
        };
      },
    }
  );

  const suspend = computed(() => {
    if (props.data.suspendStatus === 'S') {
      return ` （状态：暂停直付，${props.data.suspendRemark}，自${props.data.suspendDate}开始）`;
    }
    return '';
  });

  const fields = computed<DescData[]>(() => {
    const memberInfo = props.data;
    return [
      {
        label: 'Card No',
        value: memberInfo.cardNo,
      },
      {
        label: 'Date Of Birth',
        value: memberInfo.dob,
      },
      {
        label: 'Age',
        value: memberInfo.age,
      },
      {
        label: 'Sex',
        value: memberInfo.sex,
      },

      {
        label: 'Relation',
        value: memberInfo.relation,
      },
      {
        label: 'Nationality',
        value: memberInfo.nationality,
      },
      {
        label: 'NRIC No',
        value: memberInfo.nricNo,
      },

      {
        label: 'NRIC Type',
        value: memberInfo.nricTypeDesc,
      },
      {
        label: 'Email',
        value: memberInfo.email,
      },
      {
        label: 'Mobile',
        value: memberInfo.mobile,
      },
      {
        label: 'Payor Name',
        value: memberInfo.payorName,
      },
      {
        label: 'Corporate',
        value: memberInfo.corporate,
      },
      {
        label: 'Plan',
        value: memberInfo.plan,
      },
    ];
  });
</script>
