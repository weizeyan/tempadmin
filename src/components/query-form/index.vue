<template>
  <div class="b-query-form">
    <FormWraper
      :direction="direction"
      :row-count="rowCount"
      :show-button-bar="showButtonBar"
      :horizontal-main-col-flex="horizontalMainColFlex"
      :horizontal-main-col-style="horizontalMainColStyle"
    >
      <a-form
        ref="$form"
        :model="form"
        :label-align="labelAlign"
        class="query-form"
        :size="size"
      >
        <a-row :gutter="gutter">
          <a-col
            v-for="field in fields"
            :key="field.name"
            :span="direction === 'horizontal' ? field.colSpan || colSpan : 24"
          >
            <a-form-item
              :label-col-props="field.labelColProps || labelColProps"
              :wrapper-col-props="field.wrapperColProps || wrapperColProps"
              :disabled="
                typeof field.disabled === 'undefined' ? false : field.disabled
              "
              :field="field.name"
              :label="field.label"
              :rules="field.rules || []"
              :validate-trigger="field.validateTrigger || 'blur'"
            >
              <slot :name="'before-' + field.name" :field="field"></slot>
              <template
                v-if="
                  [
                    'input',
                    'input-tag',
                    'input-password',
                    'input-number',
                    'textarea',
                  ].indexOf(field.type) !== -1
                "
              >
                <component
                  :is="'a-' + field.type"
                  v-model="field.value"
                  v-model:input-value="state.inputValue[field.name]"
                  retain-input-value
                  :autocomplete="
                    field.type === 'input' ? 'off' : 'new-password'
                  "
                  :placeholder="field.placeholder || ''"
                  :hide-button="
                    field.type === 'input-number'
                      ? typeof field.hideButton === 'undefined'
                        ? true
                        : field.hideButton
                      : true
                  "
                  :max-length="
                    ['input', 'input-password', 'textarea'].indexOf(
                      field.type
                    ) !== -1
                      ? field.maxLength || 0
                      : 0
                  "
                  :show-word-limit="
                    ['input', 'input-password', 'textarea'].indexOf(
                      field.type
                    ) !== -1
                      ? typeof field.showWordLimit === 'undefined'
                        ? false
                        : field.showWordLimit
                      : false
                  "
                  :allow-clear="
                    typeof field.allowClear === 'undefined'
                      ? true
                      : field.allowClear
                  "
                  :auto-size="
                    field.type === 'textarea' ? field.autoSize : false
                  "
                  v-bind="field.extraProps"
                  @keyup.enter="
                    () => {
                      if (field.type !== 'input-tag') {
                        query();
                      }
                    }
                  "
                  @input-value-change="(value: string) => {inputValueChange(value, field)}"
                  @keyup="(event: any) => {field.onKeyup && field.onKeyup(event.target.value, event, field)}"
                  @keydown="(event: any) => {field.onKeydown && field.onKeydown(event.target.value, event, field)}"
                  @input="(value: string) => { field.onInput && field.onInput(value, field) }"
                  @blur="
                    () => {
                      onBlur(field);
                    }
                  "
                >
                  <template v-if="field.prepend" #prepend>
                    {{ field.prepend }}
                  </template>
                </component>
              </template>
              <a-auto-complete
                v-if="field.type === 'auto-complete'"
                v-model="field.value"
                :data="field.data || []"
                :allow-clear="
                  typeof field.allowClear === 'undefined'
                    ? true
                    : field.allowClear
                "
                :placeholder="field.placeholder || ''"
                v-bind="field.extraProps"
                @search="
                  ($event) => {
                    onRemoteSearch($event, field);
                  }
                "
                @change="
                  (value) => {
                    field.onAutoCompleteChange &&
                      field.onAutoCompleteChange(value, field);
                  }
                "
              ></a-auto-complete>
              <template v-if="field.type === 'select'">
                <a-select
                  :is="'a-' + field.type"
                  v-model="field.value"
                  :multiple="field.multiple"
                  :allow-clear="
                    typeof field.allowClear === 'undefined'
                      ? false
                      : field.allowClear
                  "
                  :options="field.options || []"
                  :filter-option="
                    typeof field.filterOption === 'undefined'
                      ? true
                      : field.filterOption
                  "
                  :allow-search="
                    typeof field.allowSearch === 'undefined'
                      ? false
                      : field.allowSearch
                  "
                  v-bind="field.extraProps"
                  @search="
                    ($event) => {
                      onRemoteSearch($event, field);
                    }
                  "
                  @change="
                    (value) => {
                      field.onSelectChange?.(value, field);
                    }
                  "
                >
                </a-select>
              </template>
              <template v-if="['radio', 'checkbox'].indexOf(field.type) !== -1">
                <component
                  :is="'a-' + field.type + '-group'"
                  v-model="field.value"
                  :direction="field.direction || 'horizontal'"
                  :options="field.options"
                >
                </component>
              </template>
              <template
                v-if="
                  [
                    'range-picker',
                    'year-picker',
                    'month-picker',
                    'quarter-picker',
                    'week-picker',
                    'date-picker',
                  ].indexOf(field.type) !== -1
                "
              >
                <component
                  :is="'a-' + field.type"
                  v-model="field.value"
                  :show-time="
                    typeof field.showTime === 'undefined'
                      ? false
                      : field.showTime
                  "
                  :format="
                    field.format
                      ? field.format
                      : field.showTime
                      ? 'YYYY-MM-DD HH:mm:ss'
                      : 'YYYY-MM-DD'
                  "
                  :time-picker-props="
                    field.timePickerProps ? field.timePickerProps : {}
                  "
                  :disabled-date="field.disabledDate || (() => {})"
                  :default-value="
                    field.defaultValue ||
                    (field.type.indexOf('range') !== -1 ? [] : '')
                  "
                  v-bind="field.extraProps"
                  style="width: 100%"
                ></component>
              </template>
              <template v-if="field.type === 'custom-date-picker'">
                <custom-date-picker
                  v-model="field.value"
                  v-bind="field.extraProps"
                  @update:model-value="
                    ($event) => {
                      $form.validateField(field.name);
                    }
                  "
                ></custom-date-picker>
              </template>
              <template v-if="field.type === 'date-time-range'">
                <date-time-range
                  v-model="field.value"
                  v-bind="field.extraProps"
                  @update:model-value="
                    ($event) => {
                      $form.validateField(field.name);
                    }
                  "
                ></date-time-range>
              </template>
              <!-- 飞书输入框 -->
              <template v-if="field.type === 'feishuInput'">
                <a-input-search
                  v-model="field.value"
                  :placeholder="field.placeholder || ''"
                  button-text="从飞书中选择"
                  search-button
                  readonly
                  v-bind="field.feishuInputProps || {}"
                  @search="onFeishuInputSearch(field)"
                >
                </a-input-search>
              </template>
              <slot :name="'after-' + field.name" :field="field"></slot>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
      <template #buttonBar>
        <a-button
          :size="size"
          type="primary"
          :loading="state.btnLoading"
          @click="query"
        >
          <!-- <template #icon>
          <component :is="okButtonIcon"></component>
        </template> -->
          {{ okButtonText }}
        </a-button>
        <a-button v-if="showResetButton" :size="size" @click="reset">
          <!-- <template #icon>
          <component :is="resetButtonIcon"></component>
        </template> -->
          {{ resetButtonText }}
        </a-button>
      </template>
    </FormWraper>

    <FeishuUserDialog
      v-model="state.feishuDialog.show"
      @on-ok="onFeishuDialogOK"
    />
  </div>
</template>

<script lang="ts" setup>
  import { reactive, computed, ref, nextTick } from 'vue';
  import { FieldRule } from '@arco-design/web-vue';

  import CustomDatePicker from '@/components/custom-date-picker/index.vue';
  import DateTimeRange from '@/components/date-time-range/index.vue';

  import FeishuUserDialog from '@/components/feishu-user-dialog/index.vue';

  import FormWraper from './form-wraper.vue';

  export type Option = {
    label: string;
    value: any;
    [name: string]: any;
  };
  export type Field = {
    name: string;
    label: string;
    type: string;
    value: any;
    onInput?: (value: any, field: Field) => void;
    onKeyup?: (value: any, event: any, field: Field) => void;
    onKeydown?: (value: any, event: any, field: Field) => void;
    onAutoCompleteChange?: (value: any, field: Field) => void;
    // type=input* 设置
    prepend?: string;
    // type=input* 设置
    placeholder?: string;
    // type=input input-password
    maxLength?: number;
    showWordLimit?: boolean;
    // type=input-number 设置
    hideButton?: boolean;
    // type=radio checkbox select 设置
    options?: Option[];
    // type-autocomplete 设置远程获取data数据
    data?: any[];
    // type=select 设置，过滤选项
    filterOption?: boolean;
    // type=radio checkbox  设置
    direction?: 'vertical' | 'horizontal';
    allowClear?: boolean;
    // type=auto-complete 设置，远程获取data
    // type=select 设置，远程获取options
    remote?: (key: string) => any[] | Promise<any[]>;
    allowSearch?: boolean;
    // type=select 设置多选
    multiple?: boolean;
    // 验证规则
    rules?: FieldRule[];
    // 触发验证时机
    validateTrigger?: 'change' | 'input' | 'focus' | 'blur';
    // 禁用状态
    disabled?: boolean;
    colSpan?: number;
    labelColProps?: Record<string, any>;
    wrapperColProps?: Record<string, any>;
    // 是否显示时间
    showTime?: boolean;
    // 日期格式
    format?: string;
    // 飞书id数组
    fsIds?: string[];
    // 飞书输入框相关配置
    feishuInputProps?: object;
    // 额外的属性
    extraProps?: Record<string, any>;
    // 禁用日期
    disabledDate?: (
      current?: Date
    ) => boolean | ((current: Date, type: 'start' | 'end') => boolean);
    // 默认值
    defaultValue?: any;
    [name: string]: any;
  };

  const props = withDefaults(
    defineProps<{
      modelValue: Field[];
      direction?: 'vertical' | 'horizontal';
      labelAlign?: 'left' | 'right';
      // 表单类型 1-筛选查询类表单 2-保存类表单
      formType?: 1 | 2;
      // 栅格布局， 默认为8
      colSpan?: number;
      labelColProps?: Record<string, any>;
      wrapperColProps?: Record<string, any>;
      showButtonBar?: boolean;
      okButtonText?: string;
      okButtonIcon?: string;
      resetButtonText?: string;
      resetButtonIcon?: string;
      // 异步保存接口，保存类表单使用
      save?: (form: Record<string, any>) => boolean | Promise<boolean>;
      size?: 'small' | 'mini' | 'medium' | 'large';
      gutter?: number;
      // 表单区域flex(水平布局时生效)
      horizontalMainColFlex?: any;
      // 表单区域样式(水平布局时生效)
      horizontalMainColStyle?: Record<string, any>;
      rowCount?: number;
      showResetButton?: boolean;
    }>(),
    {
      modelValue: () => {
        return [];
      },
      direction: 'horizontal',
      labelAlign: 'left',
      formType: 1,
      colSpan: 8,
      labelColProps() {
        return {
          span: 6,
        };
      },
      wrapperColProps() {
        return {
          span: 18,
        };
      },
      showButtonBar: true,
      okButtonText: '查询',
      okButtonIcon: 'icon-search',
      resetButtonText: '重置',
      resetButtonIcon: 'icon-close',
      save: (form: Record<string, any>) => {
        console.log('save', form);
        return true;
      },
      size: 'small',
      gutter: 16,
      horizontalMainColFlex: 1,
      horizontalMainColStyle() {
        return {};
      },
      rowCount: 0,
      showResetButton: true,
    }
  );

  const emit = defineEmits<{
    (e: 'update:modelValue', v: any): void;
    (e: 'query', v: any): void;
    (e: 'reset'): void;
  }>();

  const state = reactive({
    remoteState: {} as Record<string, { loading: boolean }>,
    btnLoading: false,
    currentField: {} as Field,
    feishuDialog: {
      show: false,
    },
    inputValue: {} as Record<string, any>,
  });

  const $form = ref();

  const fields = computed({
    get() {
      return props.modelValue;
    },
    set(v) {
      emit('update:modelValue', v);
    },
  });
  const form = computed(() => {
    const o = {} as Record<string, any>;
    fields.value.forEach((field: Field) => {
      o[field.name] = typeof field.value === 'undefined' ? '' : field.value;
      state.remoteState[field.name] = {
        loading: false,
      };
      state.inputValue[field.name] = '';
    });
    return o;
  });

  const rowCount = computed(() => {
    return (
      props.rowCount ||
      Math.ceil(props.modelValue.length / (24 / props.colSpan))
    );
  });

  async function onRemoteSearch(key: string, field: Field) {
    if (field.type === 'auto-complete') {
      if (!field.remote) {
        return;
      }
      field.data = await field.remote(key);
      return;
    }
    if (!field.allowSearch || !field.remote) {
      return;
    }
    state.remoteState[field.name].loading = true;
    field.options = await field.remote(key);
    state.remoteState[field.name].loading = false;
  }

  function cloneForm() {
    return JSON.parse(JSON.stringify(form.value));
  }
  async function query() {
    const q = cloneForm();
    state.btnLoading = true;
    const check = await checkForm();
    console.log('check ', check);

    if (!check) {
      state.btnLoading = false;
      return false;
    }
    const rs = await props.save(q);
    state.btnLoading = false;
    emit('query', q);
    return rs;
  }
  function reset() {
    emit('reset');
    fields.value.forEach((field) => {
      if (typeof field.value === 'undefined') {
        field.value = '';
        return;
      }
      const type = Object.prototype.toString.call(field.value);
      let v: any = '';
      if (type === '[object Array]') {
        v = [];
      }
      if (type === '[object Number]') {
        v = 0;
      }

      field.value = v;
    });
    // 保存类表单重置操作后不调用query方法
    if (props.formType === 2) {
      return;
    }
    query();
  }
  async function checkForm(): Promise<boolean> {
    const rs = await $form.value.validate();
    return !rs;
  }

  const onFeishuInputSearch = (field: Field) => {
    state.currentField = field;
    state.feishuDialog.show = true;
  };

  const onFeishuDialogOK = (res: any) => {
    state.currentField.value = res.currentNode.userName;
    state.currentField.fsIds = res.fsIds;
    $form.value.setFields({
      [state.currentField.name]: {
        status: 'primary',
      },
    });
  };

  function inputValueChange(value: string, field: Field) {
    if (field.type !== 'input-tag') {
      return;
    }
    // console.log('inputValueChange', value);
    state.inputValue[field.name] = value;
  }

  function onBlur(field: Field) {
    if (field.type !== 'input-tag') {
      return;
    }
    if (!state.inputValue[field.name]) {
      return;
    }
    // console.log('blur', state.inputValue[field.name]);
    field.value.push(state.inputValue[field.name]);
    state.inputValue[field.name] = '';
  }

  defineExpose({
    form,
    cloneForm,
    reset,
    query,
  });
</script>

<script lang="ts">
  export default {
    name: 'QueryForm',
  };
</script>

<style lang="less" scoped>
  .query-form :deep(.arco-input-prepend) {
    border: 1px solid var(--color-neutral-3);
    border-right: 0;
    background: var(--color-neutral-2);
  }
</style>
