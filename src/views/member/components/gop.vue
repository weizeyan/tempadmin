<template>
  <AssuranceLetter v-if="state.initData" :data="state.initData" />
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, onActivated } from 'vue';
  import { useRoute } from 'vue-router';
  import { appointmentGuaranteeLetterUrl } from '@/api/member';
  import AssuranceLetter from './appointment-handler-assurance-letter.vue';
  const props = withDefaults(
    defineProps<{
      data: Record<string, any>;
    }>(),
    {
      data() {
        return {};
      },
    }
  );
  const route = useRoute();
  const state = reactive({
    initData: null as Record<string, any> | null,
  });
  async function getInitData() {
    const json: any = await appointmentGuaranteeLetterUrl({
      cardno: props.data.cardNo,
      icno: props.data.nricNo,
      policyno: '',
    }).catch(() => false);
    return json
      ? {
          url: json.data,
        }
      : null;
  }

  onMounted(async () => {
    state.initData = await getInitData();
  });
  onActivated(() => {});
</script>
