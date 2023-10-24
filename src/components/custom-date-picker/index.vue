<template>
  <div class="b-custom-date-picker flex-center-start">
    <div class="b-date">
      <a-range-picker
        v-if="state.isRangeDate"
        v-model="value.date"
        :disabled="disabled"
        :disabled-date="disabledDate"
        @change="dateChange"
      >
      </a-range-picker>
      <a-date-picker
        v-else
        v-model="value.date"
        :disabled="disabled"
        :disabled-date="disabledDate"
        @change="dateChange"
      >
      </a-date-picker>
    </div>
    <div class="b-timerange">
      <a-select
        v-model="value.time"
        :disabled="disabled"
        placeholder="请选择"
        allow-clear
        @change="timeChange"
      >
        <a-option
          v-for="(option, index) in options"
          :key="index"
          :value="option.value"
          :label="option.label"
          :class="{ 'option-selected': option.value === value.time }"
        ></a-option>
      </a-select>
    </div>
    <div v-if="showSecondTime" class="b-timerange">
      <a-select
        v-model="value.secondTime"
        :disabled="disabled"
        placeholder="请选择"
        allow-clear
        @change="secondTimeChange"
      >
        <a-option
          v-for="(option, index) in secondOptions"
          :key="index"
          :value="option.value"
          :label="option.label"
          :class="{ 'option-selected': option.value === value.secondTime }"
        ></a-option>
      </a-select>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, ref, watch, nextTick } from 'vue';
  type Option = {
    label: string;
    value: any;
    [name: string]: any;
  };
  type DateTimeType = {
    date: any;
    time: string;
    secondTime?: string;
  };
  const props = withDefaults(
    defineProps<{
      modelValue: DateTimeType;
      options?: Option[];
      showSecondTime?: boolean;
      secondOptions?: Option[];
      disabled?: boolean;
      disabledDate?: (current?: Date) => boolean;
      onDateChange?: (e: any) => void;
      onTimeChange?: (e: any) => void;
      onSecondTimeChange?: (e: any) => void;
    }>(),
    {
      modelValue: () => {
        return {
          date: [],
          time: '',
          secondTime: '',
        };
      },
      options() {
        return [];
      },
      showSecondTime: false,
      secondOptions() {
        return [];
      },
      disabled: false,
      disabledDate(current?: Date) {
        return false;
      },
      onDateChange(e: any) {},
      onTimeChange(e: any) {},
      onSecondTimeChange(e: any) {},
    }
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', v: any): void;
  }>();

  const state = reactive({
    isRangeDate:
      Object.prototype.toString.call(props.modelValue.date) ===
      '[object Array]',
  });

  async function dateChange(e: any) {
    await nextTick();
    change(e);
    props.onDateChange(e);
  }
  async function timeChange(e: any) {
    await nextTick();
    change(e);
    props.onTimeChange(e);
  }
  async function secondTimeChange(e: any) {
    await nextTick();
    change(e);
    props.onSecondTimeChange(e);
  }

  function change(v: string) {
    value.value = {
      date: value.value.date || (state.isRangeDate ? [] : ''),
      time: value.value.time || '',
      secondTime: value.value.secondTime || '',
    };
  }

  const value = computed<DateTimeType>({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
      // console.log('update:modelValue', v);
    },
  });
</script>

<script lang="ts">
  export default {
    name: 'CustomDatePicker',
  };
</script>

<style lang="less" scoped>
  .b-custom-date-picker {
    width: 100%;
    .b-date {
      flex: 1;
    }
    .b-timerange {
      flex: 1;
      margin-left: 10px;
    }
    :deep(.arco-select-view-single) {
      &.arco-select-view-error:not(.arco-select-view-disabled) {
        background-color: transparent;
        border: 1px solid var(--color-neutral-3);
        &.arco-select-view-focus {
          background-color: transparent;
          border: 1px solid var(--color-neutral-3);
        }
        &:hover {
          background-color: transparent;
          border: 1px solid var(--color-neutral-3);
        }
      }
    }

    :deep(.arco-picker) {
      width: 100%;
      &.arco-picker-error:not(.arco-picker-disabled) {
        background-color: transparent;
        border: 1px solid var(--color-neutral-3);
        &:hover {
          background-color: transparent;
          border: 1px solid var(--color-neutral-3);
        }
      }
    }
  }
</style>
