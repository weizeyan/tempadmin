<template>
  <div class="container">
    <a-card title="查询表单">
      <div class="box">
        <QueryForm
          v-model="state.fields"
          :col-span="12"
          @query="query"
        ></QueryForm>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { Field } from '@/components/query-form/index.vue';
  import { Message } from '@arco-design/web-vue';
  const state = reactive({
    fields: [
      {
        name: 'id',
        label: '用户id',
        type: 'input',
        value: '',
      },
      {
        name: 'date',
        label: '日期',
        type: 'date-picker',
        value: '',
      },
      {
        name: 'dateTime',
        label: '日期时间',
        type: 'date-picker',
        value: '',
        showTime: true,
      },
      {
        name: 'dateRange1',
        label: '日期范围',
        type: 'range-picker',
        value: [],
      },
      {
        name: 'dateRange2',
        label: '日期时间范围',
        type: 'range-picker',
        value: [],
        showTime: true,
      },
      {
        name: 'dateTimeRange',
        label: '日期+时间范围',
        type: 'date-time-range',

        value: {
          date: '',
          timeRange: '',
        },
      },

      {
        name: 'status',
        label: '状态',
        type: 'select',
        value: '',

        options: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '正常',
            value: '1',
          },
          {
            label: '删除',
            value: '2',
          },
        ],
      },
    ] as Field[],
  });

  function query(form: Record<string, any>) {
    console.log('form', form);
  }
</script>

<script lang="ts">
  export default {
    name: 'DemoFormQuery',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
