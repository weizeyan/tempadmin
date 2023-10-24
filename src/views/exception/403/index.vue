<template>
  <div class="container">
    <div class="content">
      <a-result class="result" status="403" subtitle="无权限访问" />
      <a-button key="back" type="primary" @click="back"> 返回 </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const router = useRouter();
const back = () => {
  router.push({ name: 'DashboardIndex' });
};
</script>

<script lang="ts">
export default {
  name: '403',
};
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
  height: calc(100% - 40px);

  :deep(.content) {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
    background-color: var(--color-bg-1);
    border-radius: 4px;
  }
}
</style>
