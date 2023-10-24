<template>
  <div v-if="state.initData && state.appointmentInitData" class="container">
    <PatientInfo :data="state.initData"></PatientInfo>
    <AppointmentInfo
      :data="state.appointmentInitData"
      :title="`预约信息 ${state.appointmentNo} ${state.appointmentInitData.createTime}`"
    ></AppointmentInfo>
    <template
      v-if="
        currentAppointStatus === 'success' || currentAppointStatus === 'edit'
      "
    >
      <template v-if="!state.enableSmsNext">
        <a-card class="general-card" title="预约结果">
          <QueryForm
            ref="$form"
            v-model="state.saveFields"
            :show-button-bar="false"
            :label-col-props="{ flex: '100px' }"
            :wrapper-col-props="{ flex: '1' }"
          >
            <!-- <template #after-appointmentStatus></template> -->
          </QueryForm>
        </a-card>

        <a-card
          v-if="currentPayWay === '1'"
          class="general-card"
          title="陪诊垫付任务"
        >
          <AdvancePay ref="$advancePay" v-model="state.advancePayData" />
        </a-card>

        <a-card
          v-if="currentPayWay === '2'"
          class="general-card"
          title="生成担保函"
        >
          <AssuranceLetter
            v-if="state.appointmentGuaranteeLetterInitData"
            :data="state.appointmentGuaranteeLetterInitData"
          />
        </a-card>
      </template>
      <template v-else>
        <AppointmentResultInfo
          :data="state.appointmentInitData"
        ></AppointmentResultInfo>
        <!-- v-if="state.appointmentInitData.directPaymentMethod === '0'" -->
        <a-card class="general-card" title="后续任务">
          <CardPay :data="state.appointmentInitData" />
        </a-card>
      </template>
    </template>
    <template v-else-if="currentAppointStatus === 'cancel'">
      <a-card
        v-if="!state.enableSmsNext"
        title="填写取消原因"
        class="general-card"
      >
        <QueryForm
          ref="$cancelForm"
          v-model="state.cancelFields"
          :show-button-bar="false"
        >
        </QueryForm>
      </a-card>
      <template v-else>
        <AppointmentResultInfo
          :data="state.appointmentInitData"
        ></AppointmentResultInfo>
        <!--v-if="state.appointmentInitData.directPaymentMethod === '0'"-->
        <a-card class="general-card" title="后续任务">
          <CardPay :data="state.appointmentInitData" />
        </a-card>
      </template>
    </template>

    <template v-else-if="currentAppointStatus === 'close'">
      <a-card title="预约关闭" class="general-card">
        <div :style="{ width: '700px' }">
          <QueryForm
            ref="$closeForm"
            v-model="state.closeFields"
            direction="vertical"
            :show-button-bar="false"
          >
          </QueryForm>
        </div>
      </a-card>
    </template>

    <div v-if="currentAppointStatus === ''" class="flex-center">
      <a-button
        v-if="
          state.appointmentInitData.processingStatus === '0' ||
          state.appointmentInitData.processingStatus === '2'
        "
        class="handler-btn"
        type="primary"
        @click="onChangeCurrentAppointStatus('success')"
        >预约成功</a-button
      >
      <a-button
        v-if="state.appointmentInitData.processingStatus === '1'"
        class="handler-btn"
        type="primary"
        @click="onChangeCurrentAppointStatus('edit')"
        >预约修改</a-button
      >
      <a-button
        v-if="
          state.appointmentInitData.processingStatus === '0' ||
          state.appointmentInitData.processingStatus === '1'
        "
        class="handler-btn"
        type="primary"
        @click="onChangeCurrentAppointStatus('cancel')"
        >预约取消</a-button
      >

      <a-button
        v-if="state.appointmentInitData.processingStatus === '0'"
        class="handler-btn"
        type="primary"
        @click="onChangeCurrentAppointStatus('editBase')"
        >预约修改</a-button
      >
      <a-button
        v-if="state.appointmentInitData.processingStatus === '0'"
        class="handler-btn"
        type="primary"
        @click="onChangeCurrentAppointStatus('close')"
        >预约关闭</a-button
      >
    </div>

    <div v-else class="flex-center">
      <template v-if="!state.enableSmsNext">
        <a-button
          class="handler-btn"
          type="primary"
          :loading="state.btnLoading"
          @click="onConfirm"
        >
          {{ currentAppointStatus === 'close' ? '确定' : '确认并生成短信任务' }}
          <!-- {{ currentPayWay === '0' ? '确认并生成短信任务' : '确认' }} -->
        </a-button>
        <a-button class="handler-btn" type="primary" @click="onCancel"
          >取消</a-button
        >
      </template>
      <template v-else>
        <a-button type="primary" @click="back">关闭</a-button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { reactive, ref, nextTick, onActivated, watch, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { useTabBarStore, useMemberViewStore } from '@/store';
  import dayjs from 'dayjs';
  import {
    appointmentDetail,
    detail,
    submitResult,
    editResult,
    cancelResult,
    closeAppointment,
    appointmentEscortTaskDetail,
    appointmentGuaranteeLetterUrl,
    getProviderList,
  } from '@/api/member';
  import { Field } from '@/components/query-form/index.vue';
  import { Message } from '@arco-design/web-vue';
  import useLoading from '@/hooks/loading';
  import PatientInfo from './components/patient-info.vue';
  import AppointmentInfo from './components/appointment-handler-info.vue';
  import AppointmentResultInfo from './components/appointment-result-info.vue';
  import AppointmentAdvancePayInfo from './components/appointment-advance-pay-info.vue';
  import CardPay from './components/appointment-handler-card-pay.vue';
  import AdvancePay from './components/appointment-handler-advance-pay.vue';
  import AssuranceLetter from './components/appointment-handler-assurance-letter.vue';

  const route = useRoute();
  const router = useRouter();
  const tabBarStore = useTabBarStore();
  const memberViewStore = useMemberViewStore();

  const currentAppointStatus = ref('');
  const currentPayWay = ref('');

  const $form = ref();
  const $advancePay = ref();
  const $cancelForm = ref();
  const $closeForm = ref();

  const state = reactive({
    allProviderList: [] as any[],
    enableSmsNext: false,
    cancelFields: [
      {
        name: 'reason',
        label: '取消原因',
        type: 'textarea',
        value: '',
        maxLength: 300,
        showWordLimit: true,
        allowClear: true,
        rules: [
          {
            message: '请填写取消原因',
            required: true,
          },
        ],
      },
    ] as Field[],
    closeFields: [
      {
        name: 'closeReason',
        label: '关闭原因',
        type: 'select',
        allowClear: true,
        value: '',
        options: [
          {
            label: '信息错误',
            value: '1',
          },
          {
            label: '重复订单',
            value: '2',
          },
          {
            label: '其他',
            value: '3',
          },
        ],
        rules: [
          {
            required: true,
            message: '请选择关闭原因',
          },
        ],
      },
      {
        name: 'closeRemark',
        label: '关闭说明',
        type: 'textarea',
        value: '',
        maxLength: 300,
        showWordLimit: true,
        allowClear: true,
      },
    ] as Field[],
    saveFields: [
      {
        name: 'directPaymentMethod',
        label: '直付方式',
        type: 'select',
        colSpan: 6,
        value: '',
        allowClear: true,
        options: [
          {
            label: '见卡直付',
            value: '0',
          },
          {
            label: '陪诊垫付',
            value: '1',
          },
          {
            label: '担保函',
            value: '2',
          },
        ],
        rules: [
          {
            message: '请选择直付方式',
            required: true,
          },
        ],
        onSelectChange: async (value: string) => {
          currentPayWay.value = value;
          await nextTick();
          onPayWayChange();
        },
      },

      {
        name: 'hospital',
        label: '就诊医院',
        type: 'auto-complete',
        colSpan: 6,
        remote(key) {
          console.log('key', key);
          return state.allProviderList.map((item: any) => item.hospital);
        },
        value: '',
        rules: [
          {
            required: true,
            message: '请输入就诊医院',
          },
        ],
        onAutoCompleteChange(value) {
          console.log('value', value);
          const find = state.allProviderList.find((item: any) => {
            return item.hospital === value;
          });
          if (!find) {
            return;
          }
          const address = find.hospitalAddress || '';
          if (!address) {
            return;
          }
          getSaveField('hospitalAddress').value = address;
        },
        extraProps: {},
      },
      {
        name: 'hospitalAddress',
        label: '医院地址',
        type: 'input',
        colSpan: 12,

        value: '',
        rules: [
          {
            required: true,
            message: '请输入医院地址',
          },
        ],
      },
      {
        name: 'department',
        label: '就诊科室',
        type: 'input',
        colSpan: 6,
        value: '',
        rules: [
          {
            required: true,
            message: '请输入就诊科室',
          },
        ],
      },
      {
        name: 'doctor',
        label: '就诊医生',
        type: 'input',
        colSpan: 6,
        value: '',
        rules: [
          {
            required: true,
            message: '请输入就诊医生',
          },
        ],
      },
      {
        name: 'date',
        label: '就诊时间',
        type: 'date-time-range',
        colSpan: 12,
        value: {
          date: '',
          // timeRange: [],
          startHour: '',
          startMinute: '',
          endHour: '',
          endMinute: '',
        },
        validateTrigger: 'change',
        rules: [
          {
            required: true,
            async validator(value, callback) {
              await nextTick();
              console.log('value', value);
              // const msg =
              //   !value.date || !value.timeRange || !value.timeRange.length
              //     ? '就诊时间填写不完整'
              //     : '';
              let msg =
                !value.date ||
                !value.startHour ||
                !value.startMinute ||
                !value.endHour ||
                !value.endMinute
                  ? '就诊时间填写不完整'
                  : '';
              if (!msg) {
                const minute1 = +value.startHour * 60 + +value.startMinute;
                const minute2 = +value.endHour * 60 + +value.endMinute;
                msg = minute2 >= minute1 ? '' : '结束时间必须大于开始时间';
              }
              callback(msg);
            },
          },
        ],
        extraProps: {
					/*
          disabledDate(current: Date) {
            return dayjs(current).isBefore(dayjs(), 'day');
          },
					*/
          disableConfirm: false,
        },
      },

      {
        name: 'contact',
        label: '联系人姓名',
        type: 'input',
        colSpan: 6,
        value: '',
        rules: [
          {
            required: true,
            message: '请输入联系人姓名',
          },
        ],
      },
      {
        name: 'contactMobile',
        label: '联系人电话',
        type: 'input',
        colSpan: 6,
        value: '',
        rules: [
          {
            required: true,
            message: '请输入联系人电话',
          },
        ],
      },
    ] as Field[],

    advancePayData: [] as Field[],
    initData: null as Record<string, any> | null,
    appointmentInitData: null as Record<string, any> | null,
    escortTaskInitData: null as Record<string, any> | null,
    appointmentGuaranteeLetterInitData: null as Record<string, any> | null,
    // memberControlNo
    id: '',
    planCode: '',
    corporateCode: '',
    ref: '',
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

  const onChangeCurrentAppointStatus = async (status: string) => {
    if (status === 'editBase') {
      tabBarStore.deleteTagByFullPath(route.fullPath);
      router.push({
        name: 'MemberAppoinmentCreate',
        query: {
          appointmentNo: state.appointmentNo,
          id: state.id,
          ref: state.ref,
          planCode: state.planCode,
          corporateCode: state.corporateCode,
        },
      });
      return;
    }
    currentAppointStatus.value = status;
    if (status === 'close' || status === 'cancel') {
      return;
    }
    const data = await getAppointmentInitData();
    if (!data) {
      return;
    }
    state.appointmentInitData = data;
    const field = getSaveField('date');
    /*
    const props = field.extraProps as Record<string, any>;
    if (data.finalVisitDate && data.finalVisitTime) {
      props.options = genTimeRange('00:00');
      const timeRange = genTimeRange(data.finalVisitTime.split('-')[0]);
      props.secondOptions = timeRange.length === 1 ? [] : timeRange;
    }
    await nextTick();
    field.value = data.finalVisitDate
      ? data.finalVisitDate +
        (data.finalVisitTime ? ' ' + data.finalVisitTime : '')
      : '';
    */

    field.value.date = data.finalVisitDate || '';
    // field.value.timeRange = data.finalVisitTime
    //   ? data.finalVisitTime.split('-')
    //   : [];
    if (data.finalVisitTime) {
      const range = data.finalVisitTime.split('-');
      const start = range[0];
      const end = range[1];
      [field.value.startHour, field.value.startMinute] = start.split(':');
      [field.value.endHour, field.value.endMinute] = end.split(':');
    }

    getSaveField('directPaymentMethod').value = data.directPaymentMethod;
    // getSaveField('appointmentStatus').value = data.processingStatus;
    getSaveField('hospital').value = data.finalHospital || data.hospital;
    getSaveField('hospitalAddress').value =
      data.finalHospitalAddress || data.hospitalAddress || '';
    getSaveField('department').value =
      data.finalDepartment || data.department || '';
    getSaveField('doctor').value = data.finalDoctor || data.doctor || '';
    getSaveField('contact').value = data.finalContact || data.contact || '';
    getSaveField('contactMobile').value =
      data.finalContactMobile || data.contactMobile || '';

    await nextTick();
    if (status === 'success' || status === 'edit') {
      currentPayWay.value = $form.value.form.directPaymentMethod;
      await nextTick();

      onPayWayChange();
    }
  };

  const onCancel = () => {
    currentPayWay.value = '';
    currentAppointStatus.value = '';
  };

  function getSaveField(name: string) {
    return state.saveFields.find((field: Field) => {
      return field.name === name;
    }) as Field;
  }

  const onConfirm = async () => {
    const isCloseMode = currentAppointStatus.value === 'close';
    const isCancelMode = currentAppointStatus.value === 'cancel';
    if (isCloseMode) {
      const check = await $closeForm.value.query();
      if (!check) {
        return;
      }
      state.btnLoading = true;
      const post = {
        appointmentNo: state.appointmentNo,
        ...$closeForm.value.form,
      };
      const json: any = await closeAppointment(post).catch(() => false);
      state.btnLoading = false;
      if (!json) {
        return;
      }
      Message.success('预约关闭成功');
      back();
      return;
    }
    if (isCancelMode) {
      const check = await $cancelForm.value.query();
      if (!check) {
        return;
      }
      state.btnLoading = true;
      const post = {
        appointmentNo: state.appointmentNo,
        ...$cancelForm.value.form,
      };
      const json: any = await cancelResult(post).catch(() => false);
      state.btnLoading = false;
      if (!json) {
        return;
      }
      Message.success('取消预约成功');
      // if (state.appointmentInitData?.directPaymentMethod === '0') {
      state.appointmentInitData = await getAppointmentInitData();
      state.enableSmsNext = true;
      return;
      // }
      // back();
      // return;
    }
    const check = await $form.value.query();
    if (!check) {
      return;
    }
    if (currentPayWay.value === '1') {
      const check2 = await $advancePay.value.$form.query();
      if (!check2) {
        return;
      }
    }
    // const form2 = $advancePay.value.$form.form;
    console.log(`output->check`, check);
    console.log(`output->form`, $form.value.form);
    // console.log(`output->form2`, form2);
    const post: Record<string, any> = {
      ...$form.value.form,
      appointmentNo: state.appointmentNo,
      staff: '',
      staffId: '',
      remark: '',
    };
    post.visitDate = post.date.date;
    const visitTime = `${post.date.startHour}:${post.date.startMinute}-${post.date.endHour}:${post.date.endMinute}`;
    post.visitTime = visitTime;

    // [post.visitDate, post.visitTime] = post.date.split(' ');
    console.log(`output->advancePayData`, state.advancePayData);
    if (post.directPaymentMethod === '1') {
      post.staff = state.advancePayData[0].value;
      [post.staffId] = state.advancePayData[0].fsIds as (string | number)[];

      post.remark = state.advancePayData[1].value;
    }
    console.log('post', post);
    state.btnLoading = true;
    let json: any = false;
    if (currentAppointStatus.value === 'success') {
      json = await submitResult(post).catch(() => false);
    } else {
      json = await editResult(post).catch(() => false);
    }
    state.btnLoading = false;
    if (!json) {
      return;
    }
    Message.success('保存成功');
    // if (post.directPaymentMethod === '0') {
    state.appointmentInitData = await getAppointmentInitData();
    state.enableSmsNext = true;

    // }
    // back();
  };
  function back() {
    tabBarStore.deleteTagByFullPath(route.fullPath);
    memberViewStore.setTab('appointment');
    if (route.query.ref) {
      router.push(route.query.ref as string);
      return;
    }
    router.push(
      route.query.ref || {
        name: 'MemberView',
        query: {
          id: state.id,
          planCode: state.planCode,
          corporateCode: state.corporateCode,
        },
      }
    );
  }

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
    tabBarStore.setCurrentTabTitle(`预约编辑 - ${state.appointmentNo}`, route);
  }
  function genTimeRange(from = '00:00', slot = 30) {
    const list = timeSlot(slot);
    const index = list.indexOf(from);
    const data = list.slice(index).map((v) => {
      return {
        label: v,
        value: v,
      };
    });
    return data;
  }
  function timeSlot(step: number) {
    //  step = 间隔的分钟
    const date = new Date();
    date.setHours(0); // 时分秒设置从零点开始
    date.setSeconds(0);
    date.setUTCMinutes(0);

    const arr = [];
    const timeArr = [];
    const slotNum = (24 * 60) / step; // 算出多少个间隔
    for (let f = 0; f < slotNum; f += 1) {
      const time = new Date(
        Number(date.getTime()) + Number(step * 60 * 1000 * f)
      );
      let hour = '';
      let sec = '';
      const h = time.getHours();
      if (h < 10) {
        hour = '0' + h;
      } else {
        hour = h + '';
      }
      const m = time.getMinutes();
      if (m < 10) {
        sec = '0' + m;
      } else {
        sec = m + '';
      }
      timeArr.push(hour + ':' + sec);
    }
    return timeArr;
  }

  async function onPayWayChange() {
    console.log('onPayWayChange', currentPayWay.value);
    if (currentPayWay.value === '1') {
      state.escortTaskInitData = await getEscortTaskInitData();
      if (!state.escortTaskInitData) {
        return;
      }

      console.log('advancePayData', state.advancePayData);
      state.advancePayData[0].value = state.escortTaskInitData.staff || '';
      state.advancePayData[0].fsIds = state.escortTaskInitData.staffId
        ? [state.escortTaskInitData.staffId]
        : [];
      state.advancePayData[1].value = state.escortTaskInitData.remark || '';
    }
  }
  async function refreshData() {
    state.appointmentInitData = await getAppointmentInitData();
    state.escortTaskInitData = await getEscortTaskInitData();
    state.initData = await getInitData();
    state.allProviderList = await queryAllProviderList();
    state.appointmentGuaranteeLetterInitData =
      await getAppointmentGuaranteeLetterInitData();
  }
  async function queryAllProviderList() {
    const params = {
      cardNo: state.initData?.cardNo,
    };
    const json: any = await getProviderList(params);
    if (!json) {
      return [];
    }
    return json.data || [];
  }
  onActivated(async () => {
    console.log(genTimeRange('23:30'));
    if (state.initData) {
      updateTabTitle();
      return;
    }

    state.id = (route.query.id || '') as string;
    state.planCode = (route.query.planCode || '') as string;
    state.corporateCode = (route.query.corporateCode || '') as string;
    state.ref = (route.query.ref || '') as string;
    state.appointmentNo = (route.query.appointmentNo || '') as string;
    await refreshData();
    updateTabTitle();
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberAppoinmentHandler',
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
