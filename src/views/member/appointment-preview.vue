<template>
  <div v-if="state.initData && state.appointmentInitData" class="container">
    <PatientInfo :data="state.initData"></PatientInfo>
    <AppointmentInfo
      :data="state.appointmentInitData"
      :title="`预约信息 ${state.appointmentNo} ${state.appointmentInitData.createTime}`"
    ></AppointmentInfo>
    <template v-if="state.appointmentInitData.processingStatus !== '0'">
      <a-card
        v-if="state.appointmentInitData.processingStatus === '3'"
        class="general-card"
        title="预约关闭"
      >
        <div style="width: 700px">
          <a-form-item
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label="关闭原因"
          >
            <template v-if="state.appointmentInitData.closeReason === '1'">
              信息错误</template
            >
            <template v-if="state.appointmentInitData.closeReason === '2'">
              重复订单</template
            >
            <template v-if="state.appointmentInitData.closeReason === '3'">
              其他</template
            >
          </a-form-item>
          <a-form-item
            :label-col-props="{ span: 6 }"
            :wrapper-col-props="{ span: 18 }"
            label="关闭描述"
          >
            {{ state.appointmentInitData.closeRemark }}
          </a-form-item>
        </div>
      </a-card>
      <template v-else>
        <AppointmentResultInfo
          :data="state.appointmentInitData"
        ></AppointmentResultInfo>
        <!--v-if="state.appointmentInitData.directPaymentMethod === '0'"-->
        <a-card class="general-card" title="后续任务">
          <CardPay :data="state.appointmentInitData" />
        </a-card>
        <AppointmentAdvancePayInfo
          v-if="state.appointmentInitData.directPaymentMethod === '1'"
          :data="(state.escortTaskInitData as Record<string, any>)"
        ></AppointmentAdvancePayInfo>
        <a-card
          v-if="state.appointmentInitData.directPaymentMethod === '2'"
          class="general-card"
          title="生成担保函"
        >
          <AssuranceLetter
            v-if="state.appointmentGuaranteeLetterInitData"
            :data="state.appointmentGuaranteeLetterInitData"
          />
        </a-card>

        <a-card
          v-if="state.appointmentInitData.processingStatus === '2'"
          class="general-card"
          title="预约取消原因"
        >
          {{ state.appointmentInitData.cancelRemark }}
        </a-card>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, nextTick, onActivated, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTabBarStore } from '@/store';
  import dayjs from 'dayjs';
  import {
    appointmentDetail,
    detail,
    appointmentEscortTaskDetail,
    appointmentGuaranteeLetterUrl,
  } from '@/api/member';
  import { Field } from '@/components/query-form/index.vue';
  import { Message } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import PatientInfo from './components/patient-info.vue';
  import AppointmentInfo from './components/appointment-handler-info.vue';
  import AppointmentResultInfo from './components/appointment-result-info.vue';
  import AppointmentAdvancePayInfo from './components/appointment-advance-pay-info.vue';
  import CardPay from './components/appointment-handler-card-pay.vue';
  import AssuranceLetter from './components/appointment-handler-assurance-letter.vue';

  const route = useRoute();
  const router = useRouter();
  const tabBarStore = useTabBarStore();

  const state = reactive({
    enableCardPay: false,

    advancePayData: [] as Field[],
    initData: null as Record<string, any> | null,
    appointmentInitData: null as Record<string, any> | null,
    escortTaskInitData: null as Record<string, any> | null,
    appointmentGuaranteeLetterInitData: null as Record<string, any> | null,
    // memberControlNo
    id: '',
    planCode: '',
    corporateCode: '',
    // 预约编号
    appointmentNo: '',
    cancelDialog: {
      state: false,
      form: {
        cancelReason: '',
      },
    },
    btnLoading: false,
  });

  async function getInitData() {
    const json: any = await detail({
      memberControlNo: state.id,
      planCode: state.planCode,
      corporateCode: state.corporateCode,
    }).catch(() => false);
    return json ? json.data : null;
  }
  async function getAppointmentInitData() {
    const json: any = await appointmentDetail({
      appointmentNo: state.appointmentNo,
    }).catch(() => false);
    return json ? json.data : null;
  }
  async function getAppointmentGuaranteeLetterInitData() {
    const data = state.initData as Record<string, any>;
    const json: any = await appointmentGuaranteeLetterUrl({
      cardno: data.cardNo,
      icno: data.nricNo,
      policyno: '',
    }).catch(() => false);
    return json
      ? {
          url: json.data,
        }
      : null;
  }
  async function getEscortTaskInitData() {
    const json: any = await appointmentEscortTaskDetail({
      appointmentNo: state.appointmentNo,
    }).catch(() => false);
    return json ? json.data : null;
  }
  function updateTabTitle() {
    tabBarStore.setCurrentTabTitle(`预约详情 - ${state.appointmentNo}`, route);
  }

  async function refreshData() {
    state.appointmentInitData = await getAppointmentInitData();
    state.escortTaskInitData = await getEscortTaskInitData();
    state.initData = await getInitData();
    state.appointmentGuaranteeLetterInitData =
      await getAppointmentGuaranteeLetterInitData();
  }
  onActivated(async () => {
    state.id = (route.query.id || '') as string;
    state.planCode = (route.query.planCode || '') as string;
    state.corporateCode = (route.query.corporateCode || '') as string;
    state.appointmentNo = (route.query.appointmentNo || '') as string;
    await refreshData();
    updateTabTitle();
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberAppoinmentPreview',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style lang="less" scoped>
  .general-card {
    margin-bottom: 10px;
  }

  .handler-btn {
    margin-right: 20px;
  }
</style>
