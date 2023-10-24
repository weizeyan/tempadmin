<template>
  <div>就诊时间</div>
</template>

<script setup lang="ts">
  import { onMounted, onActivated, reactive } from 'vue';
  const state = reactive({
    isFirst: false,
  });
  onActivated(() => {
    console.log('onActivated PatientDate');
    if (state.isFirst) {
      return;
    }

    state.isFirst = true;
  });
</script>

<script lang="ts">
  export default {
    name: 'PatientDate',
  };
</script>
