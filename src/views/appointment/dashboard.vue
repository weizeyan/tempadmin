<template>
  <div class="container">
    <a-card class="general-card b-total-view">
      <a-row class="counts">
        <a-col :span="6">
          <div class="count">{{ state.dashBoardData?.newToday }}</div>
          <div class="desc">今日新增预约</div>
        </a-col>
        <a-col :span="6">
          <div class="count">{{ state.dashBoardData?.completedToday }}</div>
          <div class="desc">今日完结预约</div>
        </a-col>
        <a-col :span="6">
          <div class="count">{{ state.dashBoardData?.todoCount.count }}</div>
          <div class="desc">当前待处理</div>
        </a-col>
        <a-col :span="6">
          <div class="count">{{ state.dashBoardData?.total }}</div>
          <div class="desc">累计预约数量</div>
        </a-col>
      </a-row>
      <div class="tip">
        <div class="title">取数口径</div>
        <a-row>
          <a-col :span="12"
            >1、今日新增预约：「创建日期」为当前日期的就医预约；</a-col
          >
          <a-col :span="12"
            >2、今日完结预约：「预约成功、预约取消、预约关闭」为当前日期内；</a-col
          >
          <a-col :span="12"
            >3、当前待处理： 「待确认」状态的就医预约数量；</a-col
          >
          <a-col :span="12"
            >4、累计预约数量： CS Portal中YTD的所有状态的就医预约数量；</a-col
          >
        </a-row>
      </div>
    </a-card>
    <a-card class="general-card b-processing" title="待处理预约">
      <template #extra>
        <router-link :to="{ name: 'AppointmentList' }" class="more flex-center">
          <icon-right-circle />
          <span>全部</span>
        </router-link>
      </template>
      <a-tabs v-model="state.currentTab" class="tabs">
        <a-tab-pane key="1" title="CS">
          <template #title>
            <div class="tab-title">
              <span v-if="state.csData && state.csData.total" class="count">
                {{ state.csData.total }}
              </span>
              <span class="text">CS</span>
            </div>
          </template>
          <AppointmentList
            v-if="state.csData"
            :data="state.csData.list"
            :pagination="paginationCs"
            @page-change="
              (page) => {
                paginationCs.current = page;
                searchCs();
              }
            "
            @page-size-change="
              (pageSize) => {
                paginationCs.pageSize = pageSize;
                paginationCs.current = 1;
                searchCs();
              }
            "
          ></AppointmentList>
        </a-tab-pane>
        <a-tab-pane key="2">
          <template #title>
            <div class="tab-title">
              <span v-if="state.pcmData && state.pcmData.total" class="count">
                {{ state.pcmData.total }}
              </span>
              <span class="text">PCM</span>
            </div>
          </template>
          <AppointmentList
            v-if="state.pcmData"
            :data="state.pcmData.list"
            :pagination="paginationPcm"
            @page-change="
              (page) => {
                paginationCs.current = page;
                searchPcm();
              }
            "
            @page-size-change="
              (pageSize) => {
                paginationPcm.pageSize = pageSize;
                paginationPcm.current = 1;
                searchPcm();
              }
            "
          ></AppointmentList>
        </a-tab-pane>
        <a-tab-pane key="3">
          <template #title>
            <div class="tab-title">
              <span
                v-if="state.selfData && state.selfData.total"
                class="count"
                >{{ state.selfData.total }}</span
              >
              <span class="text">我创建的</span>
            </div>
          </template>
          <AppointmentList
            v-if="state.selfData"
            :data="state.selfData.list"
            :pagination="paginationSelf"
            @page-change="
              (page) => {
                paginationSelf.current = page;
                searchSelf();
              }
            "
            @page-size-change="
              (pageSize) => {
                paginationSelf.pageSize = pageSize;
                paginationSelf.current = 1;
                searchSelf();
              }
            "
          ></AppointmentList>
        </a-tab-pane>
      </a-tabs>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, onMounted, onActivated } from 'vue';
  import { todoPage, dataBoard } from '@/api/appointment';
  import { useRouter } from 'vue-router';
  import { ROLES_MAP, PAGE_SIZE_OPTIONS } from '@/utils/consts';
  import AppointmentList from './components/AppointmentList.vue';

  const router = useRouter();
  const state = reactive({
    currentTab: '1',
    csData: null as null | Record<string, any>,
    pcmData: null as null | Record<string, any>,
    selfData: null as null | Record<string, any>,
    dashBoardData: null as null | Record<string, any>,
    csCount: 0,
    pcmCount: 0,
    selfCount: 0,
  });
  const paginationCs = reactive({
    current: 1,
    pageSize: 20,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  });
  const paginationPcm = reactive({
    current: 1,
    pageSize: 20,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  });
  const paginationSelf = reactive({
    current: 1,
    pageSize: 20,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  });

  async function searchCs() {
    const params: Record<string, any> = {
      pageSize: paginationCs.pageSize,
      pageNum: paginationCs.current,
      flag: '0',
      role: ROLES_MAP.CS,
    };
    const data = await getPageData(params);
    if (!data) {
      return;
    }
    state.csData = data;
    paginationCs.total = data.total || 0;
  }
  async function searchPcm() {
    const params: Record<string, any> = {
      pageSize: paginationPcm.pageSize,
      pageNum: paginationPcm.current,
      flag: '0',
      role: ROLES_MAP.PCM,
    };
    const data = await getPageData(params);
    if (!data) {
      return;
    }
    state.pcmData = data;
    paginationPcm.total = data.total || 0;
  }
  async function searchSelf() {
    const params: Record<string, any> = {
      pageSize: paginationSelf.pageSize,
      pageNum: paginationSelf.current,
      flag: '1',
    };
    const data = await getPageData(params);
    if (!data) {
      return;
    }
    state.selfData = data;
    paginationSelf.total = data.total || 0;
  }

  async function getPageData(params: Record<string, any>) {
    const json: any = await todoPage(params).catch(() => false);
    if (!json) {
      return null;
    }
    return json.data;
  }

  async function getToDoData(role: string) {
    const params: Record<string, any> = {};
    if (role === 'self') {
      params.flag = '1';
    } else {
      params.flag = '0';
      params.role = role;
    }
    const json: any = await todoPage(params).catch(() => false);
    if (!json) {
      return null;
    }
    return json.data;
  }
  async function getDashBoardData() {
    const json: any = await dataBoard({}).catch(() => false);
    if (!json) {
      return null;
    }
    return json.data;
  }

  async function init() {
    searchCs();
    searchPcm();
    searchSelf();
    state.dashBoardData = await getDashBoardData();
  }

  onMounted(async () => {});

  onActivated(() => {
    init();
  });
</script>

<script lang="ts">
  export default {
    name: 'AppointmentDashboard',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style scoped lang="less">
  .b-total-view {
    padding-top: 20px;
    margin-bottom: 20px;
    .counts {
      margin-bottom: 20px;
      .count {
        font-size: 28px;
        font-weight: bold;
      }
      .desc {
        line-height: 32px;
        color: #999;
      }
    }
    .tip {
      .title {
        margin-bottom: 10px;
      }
      .arco-row {
        line-height: 28px;
      }
    }
  }
  .b-processing {
    .arco-card-header-extra {
      .more {
        text-decoration: none;
        color: rgb(var(--primary-6));
        font-size: 16px;

        .arco-icon {
          font-size: 18px;
          margin-right: 5px;
        }
      }
    }
    .tabs {
      .tab-title {
        position: relative;
        height: 40px;
        .count {
          position: absolute;
          right: 0;
          top: 0;
          background: rgb(var(--primary-6));
          color: #fff;
          width: 25px;
          height: 25px;
          border-radius: 25px;
          font-size: 10px;
          text-align: center;
          line-height: 25px;
        }
        .text {
          display: block;
          padding: 0 50px;
          text-align: center;
          line-height: 40px;
        }
      }
    }
  }
</style>
