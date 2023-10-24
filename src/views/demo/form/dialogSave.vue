<template>
  <div class="container">
    <a-card title="弹框表单" style="margin-top: 20px">
      <div class="box">
        <a-button type="primary" @click="initDialog()">新增用户</a-button>
        &nbsp;
        <a-button type="primary" @click="initDialog('1')">编辑用户</a-button>
        <a-modal
          v-model:visible="state.openState"
          title="新增/编辑用户"
          :mask-closable="false"
          :esc-to-close="false"
          :on-before-ok="
            () => {
              return $dialogForm.query();
            }
          "
        >
          <div>
            <QueryForm
              v-if="state.openState"
              ref="$dialogForm"
              v-model="state.saveFields2"
              :form-type="2"
              :col-span="24"
              label-align="right"
              direction="vertical"
              :show-button-bar="false"
              :save="saveDialogForm"
            >
            </QueryForm>
          </div>
        </a-modal>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { Field } from '@/components/query-form/index.vue';
  import { Message } from '@arco-design/web-vue';
  const state = reactive({
    saveFields2: [] as Field[],
    openState: false,
  });
  const $dialogForm = ref();

  async function saveDialogForm(form: Record<string, any>) {
    console.log('form', form);
    return new Promise((resolve) => {
      setTimeout(() => {
        Message.success('保存成功');

        resolve(true);
      }, 2000);
    });
  }
  function getDetail(id?: number | string): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = {
          name: '',
          mobile: '',
        };
        if (id) {
          data.name = '测试用户名';
          data.mobile = '13000000000';
        }
        resolve(data);
      }, 1000);
    });
  }
  async function asyncFields(id?: number | string) {
    const data = await getDetail(id);
    const fields: Field[] = [
      {
        name: 'name',
        label: '用户名',
        type: 'input',
        value: data.name,
        rules: [
          {
            required: true,
            message: '请输入用户名',
          },
        ],
      },

      {
        name: 'mobile',
        label: '手机号',
        type: 'input',
        value: data.mobile,
        rules: [
          {
            required: true,
            message: '请输入手机号',
          },
        ],
      },
    ];

    return fields;
  }

  async function initDialog(id?: string | number) {
    state.openState = true;
    state.saveFields2 = await asyncFields(id);
  }
</script>

<script lang="ts">
  export default {
    name: 'DemoFormDialogSave',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
