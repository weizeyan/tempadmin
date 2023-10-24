<template>
  <div v-if="state.initData" class="container">
    <MemberInfo :data="state.initData"></MemberInfo>
    <a-tabs
      v-model:active-key="state.defaultActiveKey"
      class="b-tab"
      @change="onTabChange"
    >
      <a-tab-pane key="policy" title="Policy">
        <Policy :data="state.initData"></Policy>
      </a-tab-pane>
      <a-tab-pane key="entitlement" title="Entitlement / Consumption">
        <Entitlement :data="state.initData"></Entitlement>
      </a-tab-pane>
      <a-tab-pane key="family" title="Family">
        <Family :data="state.initData"></Family>
      </a-tab-pane>
      <a-tab-pane key="claim" title="Claim">
        <Claim :data="state.initData"></Claim>
      </a-tab-pane>
      <a-tab-pane key="appointment" title="Appointment">
        <Appointment :data="state.initData"></Appointment>
      </a-tab-pane>
      <a-tab-pane key="gop" title="GOP">
        <Gop :data="state.initData"></Gop>
      </a-tab-pane>

      <!--  <a-tab-pane key="6" title="Providers">
        <Providers :data="state.initData"></Providers>
      </a-tab-pane> -->
    </a-tabs>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onActivated, reactive, computed } from 'vue';
  import { Message } from '@arco-design/web-vue';
  import { detail } from '@/api/member';
  import { useRoute, useRouter } from 'vue-router';
  import { useMemberViewStore, useTabBarStore } from '@/store';
  import Family from './components/family.vue';
  import Policy from './components/policy.vue';
  import Entitlement from './components/entitlement.vue';
  import Claim from './components/claim.vue';
  import Appointment from './components/appointment.vue';
  import Gop from './components/gop.vue';
  // import Providers from './components/providers.vue';
  import MemberInfo from './components/member-info.vue';

  const tabBarStore = useTabBarStore();
  const memberViewStore = useMemberViewStore();
  const route = useRoute();
  const router = useRouter();
  const state = reactive({
    id: '',
    claimId: '',
    planCode: '',
    corporateCode: '',
    appointmentNo: '',
    initData: null as Record<string, any> | null,
    defaultActiveKey: '',
    gopTip: false,
  });
  const tab = computed<string>(() => {
    return memberViewStore.tab;
  });

  async function getInitData() {
    const json: any = await detail({
      memberControlNo: state.id,
      planCode: state.planCode,
      corporateCode: state.corporateCode,
    }).catch(() => false);
    if (json.data) {
      json.data.claimId = state.claimId;
    }
    return json ? json.data : null;
  }

  function updateTabTitle() {
    tabBarStore.setCurrentTabTitle(
      `${route.meta.locale} - ${state.initData?.name}`,
      route
    );
  }
  function onTabChange(key: any) {
    if (
      key === 'gop' &&
      state.initData?.suspendStatus === 'S' &&
      !state.gopTip
    ) {
      Message.warning({
        content: '当前客户处于直付暂停状态',
        duration: 3 * 1000,
      });
      state.gopTip = true;
    }
  }

  onActivated(async () => {
    const currentTabCache = tab.value;
    state.id = (route.query.id || '') as string;
    state.planCode = (route.query.planCode || '') as string;
    state.corporateCode = (route.query.corporateCode || '') as string;
    // 传入claimId  定位到 claim tab
    state.claimId = (route.query.claimId || '') as string;
    // 传入appointmentNo 定位到 预约 tab
    state.appointmentNo = (route.query.appointmentNo || '') as string;

    // 设置默认tab
    if (!state.defaultActiveKey) {
      state.defaultActiveKey = state.appointmentNo
        ? 'appointment'
        : state.claimId
        ? 'claim'
        : 'policy';
    }
    // 同步缓存设置的tab
    if (currentTabCache) {
      state.defaultActiveKey = currentTabCache;
      memberViewStore.setTab('');
    }
    if (state.initData) {
      updateTabTitle();
      return;
    }
    state.initData = await getInitData();
    updateTabTitle();
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberView',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style scoped lang="less">
  .b-tab {
    margin-top: 20px;
    background: #fff;
  }
</style>
