<template>
  <div>提交</div>
</template>

<script setup lang="ts">
  import { onMounted, onActivated, reactive } from 'vue';
  const state = reactive({
    isFirst: false,
  });
  onActivated(() => {
    console.log('onActivated Submit');
    if (state.isFirst) {
      return;
    }

    state.isFirst = true;
  });
</script>

<script lang="ts">
  export default {
    name: 'Submit',
  };
</script>
