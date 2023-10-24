<template>
  <div class="b-date-time-range flex-center-start">
    <div class="b-date">
      <a-date-picker
        v-model="value.date"
        :disabled-date="disabledDate"
        @change="dateChange"
      >
      </a-date-picker>
    </div>
    <div class="b-time-range flex-center">
      <!-- <el-time-picker
        v-model="value.timeRange"
        :default-value="['2000-01-01 06:00', '2000-01-01 19:00']"
        is-range
        format="HH:mm"
        value-format="HH:mm"
        start-placeholder="开始时间"
        end-placeholder="结束时间"
        @change="timeRangeChange"
      /> -->
      <a-input
        ref="$startHour"
        v-model.trim="value.startHour"
        :max-length="2"
        class="range-item"
        allow-clear
        @input="
          (e) => {
            value.startHour = formatHourValue(e);
            timeRangeChange(e);
            if (value.startHour.length === 2) {
              $startMinute.focus();
            }
          }
        "
        @blur="
          (e: any) => {
            value.startHour = formatOnBlur(e.target.value);
          }
        "
      />
      <span class="split1">:</span>
      <a-input
        ref="$startMinute"
        v-model.trim="value.startMinute"
        :max-length="2"
        class="range-item"
        allow-clear
        @input="
          (e) => {
            value.startMinute = formatMinuteValue(e);
            timeRangeChange(e);
            if (value.startMinute.length === 2) {
              $endHour.focus();
            }
          }
        "
        @blur="
          (e: any) => {
            value.startMinute = formatOnBlur(e.target.value);
          }
        "
      />
      <span class="split2"> - </span>
      <a-input
        ref="$endHour"
        v-model.trim="value.endHour"
        :max-length="2"
        class="range-item"
        allow-clear
        @input="
          (e) => {
            value.endHour = formatHourValue(e);
            timeRangeChange(e);
            if (value.endHour.length === 2) {
              $endMinute.focus();
            }
          }
        "
        @blur="
          (e: any) => {
            value.endHour = formatOnBlur(e.target.value);
          }
        "
      />
      <span class="split1">:</span>
      <a-input
        ref="$endMinute"
        v-model.trim="value.endMinute"
        :max-length="2"
        class="range-item"
        allow-clear
        @input="
          (e) => {
            value.endMinute = formatMinuteValue(e);
            timeRangeChange(e);
            if (value.endMinute.length === 2) {
              $endMinute.blur();
            }
          }
        "
        @blur="
          (e: any) => {
            value.endMinute = formatOnBlur(e.target.value);
          }
        "
      />
      <!--
      <a-time-picker
        v-model="value.timeRange"
        type="time-range"
        :position="position"
        :format="format"
        :disable-confirm="disableConfirm"
        :popup-container="$popContainer"
        @change="timeRangeChange"
      ></a-time-picker>
      <div ref="$popContainer" class="pop-container"></div>
      -->
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
  type DateTimeRangeType = {
    date: string;
    timeRange?: string[];
    startHour?: string;
    startMinute?: string;
    endHour?: string;
    endMinute?: string;
  };

  const props = withDefaults(
    defineProps<{
      modelValue: DateTimeRangeType;
      disabledDate?: (current?: Date) => boolean;
      position?: 'bl' | 'br' | 'tr' | 'top' | 'tl' | 'bottom';
      format?: string;
      disableConfirm?: boolean;
    }>(),
    {
      modelValue: () => {
        return {
          date: '',
          timeRange: [],
        };
      },
      disabledDate(current?: Date) {
        return false;
      },
      position: 'bl',
      format: 'HH:mm',
      disableConfirm: true,
    }
  );
  const $popContainer = ref();
  const $startHour = ref();
  const $startMinute = ref();
  const $endHour = ref();
  const $endMinute = ref();
  async function dateChange(e: any) {
    await nextTick();
    change(e);
  }
  async function timeRangeChange(e: any) {
    await nextTick();
    change(e);
  }
  function change(v: string) {
    // value.value = {
    //   date: value.value.date || '',
    //   timeRange: value.value.timeRange || [],
    // };
    console.log('change', JSON.stringify(value.value));
    value.value.date = value.value.date || '';
  }

  function formateRangeValue(v: string) {
    const value = v.replace(/\D/g, '');
    // return value.length === 1 ? '0' + value : value;
    return value;
  }
  function formatOnBlur(v: string) {
    // console.log('vvv', v);
    const value = v.replace(/\D/g, '');
    return value.length === 1 ? '0' + value : value;
  }
  function formatHourValue(v: string) {
    const value = formateRangeValue(v);
    if (!value) {
      return '';
    }
    return +value > 23 ? '' : value;
  }
  function formatMinuteValue(v: string) {
    const value = formateRangeValue(v);
    console.log('formatMinuteValue', value);
    if (!value) {
      return '';
    }
    return +value > 59 ? '' : value;
  }

  const emit = defineEmits<{
    (e: 'update:modelValue', v: any): void;
  }>();

  const value = computed<DateTimeRangeType>({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
      console.log('update:modelValue', v);
    },
  });
</script>

<script lang="ts">
  export default {
    name: 'DateTimeRange',
  };
</script>

<style lang="less" scoped>
  .b-date-time-range {
    .b-date {
      margin-right: 10px;
      flex: 1;
    }
    .b-time-range {
      flex: 1.8;
      :deep(.el-date-editor) {
        width: 100%;
        height: 28px;
        border-radius: 2px;
      }
      .split1 {
        padding: 0 5px;
      }
      .split2 {
        padding: 0 5px;
      }
      .range-item {
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
    .pop-container {
      position: relative;
      :deep(.arco-trigger-popup) {
        width: 100%;
        .arco-timepicker-column {
          flex: 1;
          overflow-y: auto;
          .arco-timepicker-cell {
          }
          .arco-timepicker-cell-inner {
            padding-left: 0;
            text-align: center;
          }
        }
      }
    }
  }
</style>
