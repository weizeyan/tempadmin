<template>
  <div v-if="state.initData" class="container">
    <a-card class="general-card" :title="state.initData.memberName">
      <a-descriptions :data="fields" bordered></a-descriptions>
    </a-card>
    <a-tabs default-active-key="1" class="b-tab">
      <a-tab-pane key="1" title="Assessment">
        <ClaimAssessment :data="state.initData"></ClaimAssessment>
      </a-tab-pane>
      <a-tab-pane key="2" title="EOB&Documents">
        <ClaimEboDocuments :data="state.initData"></ClaimEboDocuments>
      </a-tab-pane>
      <a-tab-pane key="3" title="Tracking">
        <ClaimTracking :data="state.initData"></ClaimTracking>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onActivated, reactive, computed } from 'vue';
  import { useTabBarStore } from '@/store';
  import { claimDetail, claimAssessment } from '@/api/member';
  import { DescData } from '@arco-design/web-vue';
  import { useRoute, useRouter } from 'vue-router';
  import ClaimAssessment from './components/claim-assessment.vue';
  import ClaimEboDocuments from './components/claim-eob-documents.vue';
  import ClaimTracking from './components/claim-tracking.vue';

  const tabBarStore = useTabBarStore();
  const route = useRoute();
  const router = useRouter();
  const state = reactive({
    id: '',
    initData: null as Record<string, any> | null,
  });
  const fields = computed<DescData[]>(() => {
    const data = state.initData;
    console.log('data', data);
    return data
      ? [
          {
            label: 'Claim ID',
            value: data.claimId,
          },
          {
            label: 'Claim Type',
            value: data.claimType,
          },
          {
            label: 'Coverage Code',
            value: data.coverageCode,
          },

          {
            label: 'Claim Status',
            value: data.claimsStatus + ',' + data.claimsStatusDescription,
          },
          {
            label: 'Admission Type',
            value: data.admissionType,
          },
          {
            label: 'Last Process Status',
            value:
              data.lastProcessStatus + ',' + data.lastProcessStatusDescription,
          },
          {
            label: 'Financial Process Status',
            value: data.financialProcessStatus,
          },
          {
            label: 'Last Transaction Status',
            value:
              data.lastTransactionStatus +
              ',' +
              data.lastTransactionStatusDescription,
          },
          {
            label: 'Last Transaction Reason',
            value: data.lastTransactionReason,
          },
        ]
      : [];
  });
  async function getInitData() {
    const json: any = await claimDetail({
      claimId: state.id,
    }).catch(() => false);
    return json ? json.data : null;
  }

  function updateTabTitle() {
    tabBarStore.setCurrentTabTitle(`${route.meta.locale} - ${state.id}`, route);
  }
  onActivated(async () => {
    if (state.initData) {
      updateTabTitle();
      return;
    }
    state.id = (route.query.id || '') as string;
    state.initData = await getInitData();
    updateTabTitle();
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberClaim',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style scoped lang="less">
  .b-tab {
    margin-top: 20px;
    background: #fff;
  }
</style>
