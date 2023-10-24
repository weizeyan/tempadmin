<template>
  <iframe class="iframe-wrap" :src="data.url" frameborder="0"></iframe>
</template>

<script setup lang="ts">
  import { reactive } from 'vue';
  const props = withDefaults(
    defineProps<{
      data: Record<string, any>;
    }>(),
    {
      data() {
        return {
          url: '',
        };
      },
    }
  );
</script>

<style lang="less" scoped>
  .iframe-wrap {
    width: 100%;
    height: 500px;
  }
</style>
