<template>
  <div class="advance-pay-wrap">
    <QueryForm
      ref="$form"
      v-model="state.saveFields"
      direction="vertical"
      :show-button-bar="false"
    >
    </QueryForm>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, watch } from 'vue';
  import { Field } from '@/components/query-form/index.vue';

  const props = defineProps({
    modelValue: {
      type: Object,
      default: () => ({}),
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const $form = ref();

  const state = reactive({
    saveFields: [
      {
        name: 'member',
        label: '陪诊人员',
        type: 'feishuInput',
        value: '',
        fsIds: [],
        placeholder: '请选择',
        rules: [
          {
            message: '请选择陪诊人员',
            required: true,
          },
        ],
      },
      {
        name: 'contactMobile',
        label: '陪诊说明',
        type: 'textarea',
        value: '',
        showWordLimit: true,
        autoSize: {
          minRows: 8,
        },
        maxLength: 500,
        placeholder: '请添加描述',
        rules: [
          {
            required: true,
            message: '请输入陪诊说明',
          },
        ],
      },
    ] as Field[],
  });

  watch(
    () => [state.saveFields[0].value, state.saveFields[1].value],
    () => {
      emit('update:modelValue', state.saveFields);
    },
    {
      immediate: true,
    }
  );
  defineExpose({
    $form,
  });
</script>

<style lang="less" scoped>
  .advance-pay-wrap {
    width: 500px;
  }
</style>
