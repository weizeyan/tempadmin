<template>
  <div class="container">
    <a-card title="保存表单" style="margin-top: 20px">
      <div class="box">
        <QueryForm
          v-model="state.saveFields"
          :form-type="2"
          label-align="right"
          direction="vertical"
          ok-button-text="保存"
          reset-button-text="清空"
          :style="{ width: '500px', margin: '0 auto' }"
          :save="save"
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
    saveFields: [
      {
        name: 'name',
        label: '用户名',
        type: 'input',
        value: '',
        rules: [
          {
            required: true,
            message: '请输入用户名',
          },
        ],
      },
      {
        name: 'password',
        label: '密码',
        type: 'input-password',
        value: '',
        rules: [
          {
            required: true,
            message: '请输入密码',
          },
        ],
      },
      {
        name: 'mobile',
        label: '手机号',
        type: 'input',
        value: '',
        rules: [
          {
            required: true,
            message: '请输入手机号',
          },
        ],
      },
    ] as Field[],
  });

  async function save(form: Record<string, any>) {
    console.log('form', form);
    return new Promise((resolve) => {
      setTimeout(() => {
        Message.success('success');
        resolve(true);
      }, 1000);
    });
  }
</script>

<script lang="ts">
  export default {
    name: 'DemoFormSave',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
