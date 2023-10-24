<template>
  <div class="container">
    <a-card title="内联查询表单">
      <div class="box">
        <QueryForm
          v-model="state.fields3"
          :col-span="6"
          :label-col-props="{ span: 10 }"
          :wrapper-col-props="{ span: 14 }"
          :horizontal-main-col-style="{ width: '700px' }"
          horizontal-main-col-flex="none"
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
    fields3: [
      {
        name: 'id',
        label: '用户id',
        type: 'input',
        value: '',
      },
      {
        name: 'name',
        label: '用户名',
        type: 'input',
        value: '',
      },
      {
        name: 'mobile',
        label: '手机号',
        type: 'input',
        value: '',
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
</script>

<script lang="ts">
  export default {
    name: 'DemoFormInlineQuery',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
