<template>
  <!-- 水平方向布局 -->
  <a-row v-if="direction === 'horizontal'" class="form-wraper-horizontal">
    <a-col :flex="horizontalMainColFlex" :style="horizontalMainColStyle">
      <slot></slot>
    </a-col>
    <template v-if="showButtonBar">
      <a-divider
        :style="{ height: 40 * rowCount + 'px' }"
        direction="vertical"
      />
      <a-col
        :flex="(rowCount === 1 ? 160 : 80) + 'px'"
        style="text-align: right"
      >
        <a-space
          :size="18"
          :direction="rowCount > 1 ? 'vertical' : 'horizontal'"
        >
          <slot name="buttonBar"></slot>
        </a-space>
      </a-col>
    </template>
  </a-row>
  <!-- 垂直方向布局 -->
  <template v-if="direction === 'vertical'">
    <slot></slot>
    <a-row v-if="showButtonBar">
      <a-col :span="6"></a-col>
      <a-col :span="18" class="button-bar">
        <slot name="buttonBar"></slot>
      </a-col>
    </a-row>
  </template>
</template>

<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{
      // 布局方向 水平和垂直
      direction?: 'vertical' | 'horizontal';
      // 表单区域flex(水平布局时生效)
      horizontalMainColFlex?: any;
      // 表单区域样式(水平布局时生效)
      horizontalMainColStyle?: Record<string, any>;
      // 水平布局时设置
      rowCount?: number;
      showButtonBar?: boolean;
    }>(),
    {
      direction: 'horizontal',
      horizontalMainColFlex: 1,
      horizontalMainColStyle() {
        return {};
      },
      rowCount: 1,
      showButtonBar: true,
    }
  );
</script>

<style lang="less" scoped>
  .button-bar {
    :deep(button) {
      margin-left: 10px;

      &:first-child {
        margin-left: 0;
      }
    }
  }

  .form-wraper-horizontal {
    :deep(.arco-space) {
      button {
        width: 100%;
      }
    }
  }
</style>
