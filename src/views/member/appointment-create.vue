<template>
  <div v-if="state.initData" class="container">
    <PatientInfo :data="state.initData"></PatientInfo>
    <a-card class="general-card" title="预约医院">
      <form @submit.prevent="submit">
        <div class="search-bar flex-center">
          <div class="name">医院名称</div>
          <div class="input">
            <a-input v-model="searchForm.hospital" allow-clear
          /></div>
          <a-button
            type="primary"
            html-type="submit"
            :disabled="!searchForm.hospital.trim()"
          >
            <template #icon>
              <icon-search />
            </template>
            搜索</a-button
          >
        </div>
      </form>
      <a-table
        ref="$table"
        row-key="hospitalCode"
        :pagination="false"
        :loading="loading"
        :columns="columns"
        :data="renderData"
        :bordered="false"
        size="medium"
        :scroll="{ x: 2500, y: 400 }"
      >
        <template #radioArea="{ record }">
          <a-radio v-model="selectedId" :value="record.hospitalCode"></a-radio>
        </template>
        <template #natureOfBusiness="{ record }">
          {{ record.natureOfBusiness === '0' ? '公立' : '私立' }}
        </template>
        <template #point="{ record }">
          <a target="_blank" :href="genMapUrl(record)">
            <icon-location :size="16" />
          </a>
        </template>
        <template #empty>
          <div v-if="state.btnClick" class="arco-empty">
            <icon-empty size="80" :style="{ color: 'rgba(0,0,0,0.5)' }" />
            <div class="text">暂无数据</div>
          </div>
          <div v-else style="height: 100px"> </div>
        </template>
        <template #footer>
          <div>
            <a-radio v-model="selectedId" value="-1">
              <div style="padding-left: 12px">无指定医院</div>
            </a-radio>
          </div>
        </template>
      </a-table>
    </a-card>
    <a-card class="general-card" title="预约信息">
      <div :style="{ width: '700px' }">
        <QueryForm
          ref="$form"
          v-model="state.saveFields"
          direction="vertical"
          :show-button-bar="false"
        ></QueryForm>
        <a-row>
          <a-col :span="6"></a-col>
          <a-col :span="18" class="button-bar">
            <a-button
              type="primary"
              :loading="state.submitLoading"
              @click="save"
              >确认提交</a-button
            >
            &nbsp; &nbsp; &nbsp; &nbsp;
            <a-button @click="back">放弃提交</a-button>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import {
    onMounted,
    onActivated,
    reactive,
    ref,
    computed,
    watch,
    nextTick,
  } from 'vue';
  import { Message, TableColumnData } from '@arco-design/web-vue';

  import {
    detail,
    getProviderList,
    getTimeRangeData,
    addAppointment,
    editAppointment,
    appointmentDetail,
  } from '@/api/member';
  import { useRoute, useRouter } from 'vue-router';
  import { useTabBarStore, useMemberViewStore } from '@/store';
  import { Field } from '@/components/query-form/index.vue';
  import useLoading from '@/hooks/loading';
  import PatientInfo from './components/patient-info.vue';
  const tabBarStore = useTabBarStore();
  const memberViewStore = useMemberViewStore();
  const route = useRoute();
  const router = useRouter();
  const $form = ref();
  const dateDisabled = ref(false);
  const value1 = ref<string[]>([]);

  const state = reactive({
    id: '',
    ref: '',
    appointmentNo: '',
    appointmentInitData: null as Record<string, any> | null,
    initData: null as Record<string, any> | null,
    timeRangeData: null as Record<string, any> | null,
    otherTimeRangeData: null as Record<string, any> | null,
    saveFields: [
      {
        name: 'appointmentType',
        label: '初/复诊',
        type: 'radio',
        value: '0',
        rules: [
          {
            message: '请选择初/复诊',
            required: true,
          },
        ],
        options: [
          {
            label: '初诊',
            value: '0',
          },
          {
            label: '复诊',
            value: '1',
          },
        ],
      },
      {
        name: 'department',
        label: '期望就诊科室',
        type: 'auto-complete',
        value: '',
        async remote(key) {
          console.log('key', key);
          return [
            /*
            '皮肤科',
            '神经内科',
            '神经外科',
            '泌尿外科',
            '普外科',
            '消化内科',
            '感染科',
            */
          ];
        },
      },
      {
        name: 'doctor',
        label: '期望就诊医生',
        type: 'input',
      },
      {
        name: 'patientDate',
        label: '就诊时间',
        type: 'date-time-range',
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
        name: 'acceptOtherTime',
        label: '其他时间段',
        type: 'radio',
        value: 'N',
        rules: [
          {
            message: '请选择',
            required: true,
          },
        ],
        options: [
          {
            label: '是',
            value: 'Y',
          },
          {
            label: '否',
            value: 'N',
          },
        ],
      },
      {
        name: 'otherPatientDate',
        label: '备选时间',
        type: 'custom-date-picker',
        value: {
          date: [],
          time: '',
        },
        validateTrigger: 'change',
        extraProps: {
          /*
					disabledDate(current: Date) {
            return dayjs(current).isBefore(dayjs(), 'day');
          },
					*/
          options: [
            {
              label: '全天',
              value: '0',
            },
            {
              label: '上午',
              value: '1',
            },
            {
              label: '下午',
              value: '2',
            },
          ],
        },

        disabled: dateDisabled,
        rules: [
          {
            required: true,
            async validator(value, callback) {
              await nextTick();
              console.log('value', value);

              if (dateDisabled.value) {
                callback();
                return;
              }
              callback(
                !value.date || !value.date.length || !value.time
                  ? '备选时间填写不完整'
                  : ''
              );
            },
          },
        ],
      },
      {
        name: 'symptoms',
        label: '症状',
        type: 'input',
        value: '',
      },
      {
        name: 'symptomsRemark',
        label: '症状补充说明',
        type: 'textarea',
        value: '',
        maxLength: 400,
        showWordLimit: true,
      },
      {
        name: 'contact',
        label: '联系人姓名',
        type: 'input',
        value: '',
        rules: [
          {
            message: '请填写联系人姓名',
            required: true,
          },
        ],
      },
      {
        name: 'contactMobile',
        label: '联系人电话',
        type: 'input',
        value: '',
        rules: [
          {
            message: '请填写联系人电话',
            required: true,
          },
        ],
      },
      {
        name: 'internalRemarks',
        label: '内部备注',
        type: 'textarea',
        value: '',
        maxLength: 300,
        showWordLimit: true,
      },
    ] as Field[],
    submitLoading: false,
    btnClick: false,
    planCode: '',
    corporateCode: '',
  });

  // 分页列表
  const { loading, setLoading } = useLoading(false);
  const renderData = ref<any[]>([]);
  // 表单筛选器
  const searchForm = ref({
    hospital: '',
  });
  const searchFormCache = ref<Record<string, any>>({});
  const selectedId = ref<string | number>('-1');
  const $table = ref();

  // 列表展示字段
  const columns: TableColumnData[] = [
    {
      title: '',
      dataIndex: 'radioArea',
      slotName: 'radioArea',
      fixed: 'left',
      width: 40,
    },
    {
      title: '医院名称',
      dataIndex: 'hospital',
      slotName: 'hospital',
      width: 250,
      fixed: 'left',
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '营业性质',
      dataIndex: 'natureOfBusiness',
      slotName: 'natureOfBusiness',
      width: 100,
    },

    {
      title: '国家',
      dataIndex: 'country',
      slotName: 'country',
      width: 100,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '省',
      dataIndex: 'province',
      slotName: 'province',
      width: 100,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '市',
      dataIndex: 'city',
      slotName: 'city',
      width: 100,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '医院地址',
      dataIndex: 'hospitalAddress',
      slotName: 'hospitalAddress',
      width: 300,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '地图定位',
      dataIndex: 'point',
      slotName: 'point',
      width: 150,
    },
    {
      title: '联系电话',
      dataIndex: 'contactMobile',
      slotName: 'contactMobile',
      width: 150,
    },
    {
      title: '联系邮箱',
      dataIndex: 'contactEmail',
      slotName: 'contactEmail',
      width: 150,
    },
    {
      title: '预约方式',
      dataIndex: 'appointmentMethod',
      slotName: 'appointmentMethod',
      width: 150,
    },
    {
      title: 'GOP联系邮箱',
      dataIndex: 'gopEmail',
      slotName: 'gopEmail',
      width: 150,
    },
  ];

  /**
   * 查询列表操作
   */
  async function search() {
    setLoading(true);
    const params: Record<string, any> = {
      cardNo: state.initData?.cardNo,
      ...searchFormCache.value,
    };

    console.log('params', params);
    const json: any = await getProviderList(params);
    console.log('json', json);
    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data || [];
    $table.value.selectAll(false);
  }

  function submit() {
    state.btnClick = true;
    selectedId.value = '-1';
    searchFormCache.value = JSON.parse(JSON.stringify(searchForm.value));
    search();
  }

  function back() {
    tabBarStore.deleteTagByFullPath(route.fullPath);
    if (!state.appointmentNo) {
      memberViewStore.setTab('appointment');
      router.push(route.query.ref as string);
      return;
    }

    router.push({
      name: 'MemberAppoinmentHandler',
      query: {
        id: state.id,
        appointmentNo: state.appointmentNo,
        ref: state.ref,
        planCode: state.planCode,
        corporateCode: state.corporateCode,
      },
    });
  }

  watch(
    () => {
      return $form.value?.form;
    },
    (v) => {
      dateDisabled.value = v.acceptOtherTime === 'N';
    }
  );

  async function getInitData() {
    const json: any = await detail({
      memberControlNo: state.id,
      planCode: state.planCode,
      corporateCode: state.corporateCode,
    }).catch(() => false);
    return json ? json.data : null;
  }

  async function getTimeRangeInitData(date?: string) {
    const timeList: string[] = [];
    let start = 0;
    for (; start <= 23; start += 1) {
      const h = start < 10 ? `0${start}` : start;
      timeList.push(`${h}:00-${h}:59`);
    }
    return {
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: '',
      timeList,
    };
    /*
    console.log('getTimeRangeInitData', date);
    const today = dayjs().format('YYYY-MM-DD');
    if (!date) {
      date = today;
    }
    if (selectedId.value === '-1') {
      const timeList: string[] = [];
      let h = 8;
      const max = 17;
      if (date === today) {
        h = dayjs().hour() + 1;
      }
      console.log('h', h);
      if (h < max) {
        for (; h < max; h += 1) {
          timeList.push(`${h}:00-${h + 1}:00`);
        }
      }
      console.log('timeList', timeList);
      return {
        startDate: today,
        endDate: '',
        timeList,
      };
    }
    const selectHospitalItem = renderData.value.find((item) => {
      return item.hospitalCode === selectedId.value;
    });
    const json: any = await getTimeRangeData({
      memberControlNo: state.id,
      hospitalCode: selectedId.value,
      publicFlag: selectHospitalItem.natureOfBusiness,
      date,
    }).catch(() => false);
    return json ? json.data : null;
    */
  }
  function updateTabTitle() {
    tabBarStore.setCurrentTabTitle(
      `${state.appointmentNo ? '预约修改' : '新建预约'} - ${
        state.initData?.name
      }`,
      route
    );
  }

  async function save() {
    const check = await $form.value.query();
    if (!check) {
      return;
    }
    // if (!$form.value.form.symptoms.length && !$form.value.form.symptomsRemark) {
    //   Message.error('请填写就诊症状');
    //   return;
    // }
    const { patientDate, otherPatientDate } = $form.value.form;
    const visitDate = patientDate.date;
    const visitTime = `${patientDate.startHour}:${patientDate.startMinute}-${patientDate.endHour}:${patientDate.endMinute}`;

    const [otherDate, otherEndDate] = otherPatientDate.date;
    const otherTime = otherPatientDate.time;
    const post = {
      ...$form.value.form,

      visitDate,
      visitTime,
      otherDate,
      otherEndDate,
      otherTime,
      name: state.initData?.name,
      cardNo: state.initData?.cardNo,
      hospitalCode: selectedId.value === '-1' ? '' : selectedId.value,
      appointmentNo: state.appointmentNo,
    };
    console.log('post', post);

    state.submitLoading = true;
    const saveApi = state.appointmentNo ? editAppointment : addAppointment;
    const json: any = await saveApi(post).catch(() => false);
    if (!json || !json.success) {
      state.submitLoading = false;
      return;
    }
    Message.success(state.appointmentNo ? '预约修改成功' : '新建预约成功');
    back();
  }

  function getPatientDateField() {
    const patientDateField: any = state.saveFields.find(
      (field) => field.name === 'patientDate'
    );
    return patientDateField;
  }

  function getOtherPatientDateField() {
    const patientDateField: any = state.saveFields.find(
      (field) => field.name === 'otherPatientDate'
    );
    return patientDateField;
  }

  async function refreshAppointment() {
    console.log('refreshAppointment', selectedId.value);
    await updateTimeRangeOptions();
    // await updateOtherTimeRangeOptions();
    const patientDateField = getPatientDateField();
    const otherPatientDateField = getOtherPatientDateField();
    if (state.timeRangeData) {
      console.log('state.timeRangeData', state.timeRangeData);
      // patientDateField.value = state.timeRangeData.startDate;
      patientDateField.value = {
        date: state.timeRangeData.startDate,
        // timeRange: [],
        startHour: '',
        startMinute: '',
        endHour: '',
        endMinute: '',
      };
    }
    otherPatientDateField.value = {
      date: [],
      time: '',
    };
    if (!state.appointmentInitData) {
      return;
    }
    // 展示预约信息相关字段
    if (state.appointmentInitData.appointmentType) {
      getSaveField('appointmentType').value =
        state.appointmentInitData.appointmentType;
    }
    if (state.appointmentInitData.department) {
      getSaveField('department').value = state.appointmentInitData.department;
    }
    if (state.appointmentInitData.doctor) {
      getSaveField('doctor').value = state.appointmentInitData.doctor;
    }
    if (state.appointmentInitData.visitDate) {
      getSaveField('patientDate').value.date =
        state.appointmentInitData.visitDate;
    }
    if (state.appointmentInitData.visitTime) {
      const range = state.appointmentInitData.visitTime.split('-');
      const start = range[0];
      const end = range[1];
      [
        getSaveField('patientDate').value.startHour,
        getSaveField('patientDate').value.startMinute,
      ] = start.split(':');
      [
        getSaveField('patientDate').value.endHour,
        getSaveField('patientDate').value.endMinute,
      ] = end.split(':');

      // getSaveField('patientDate').value.timeRange = state.appointmentInitData.visitTime.split('-');
    }
    if (state.appointmentInitData.acceptOtherTime) {
      getSaveField('acceptOtherTime').value =
        state.appointmentInitData.acceptOtherTime;
    }
    if (state.appointmentInitData.otherDate) {
      getSaveField('otherPatientDate').value.date = [
        state.appointmentInitData.otherDate,
        state.appointmentInitData.otherEndDate,
      ];
      let timeValue = '';
      if (state.appointmentInitData.otherTime === '全天') {
        timeValue = '0';
      } else if (state.appointmentInitData.otherTime === '上午') {
        timeValue = '1';
      } else if (state.appointmentInitData.otherTime === '下午') {
        timeValue = '2';
      }
      getSaveField('otherPatientDate').value.time = timeValue;
    }
    if (state.appointmentInitData.symptoms) {
      getSaveField('symptoms').value = state.appointmentInitData.symptoms;
    }
    if (state.appointmentInitData.symptomsRemark) {
      getSaveField('symptomsRemark').value =
        state.appointmentInitData.symptomsRemark;
    }
    if (state.appointmentInitData.contact) {
      getSaveField('contact').value = state.appointmentInitData.contact;
    }
    if (state.appointmentInitData.contactMobile) {
      getSaveField('contactMobile').value =
        state.appointmentInitData.contactMobile;
    }
    if (state.appointmentInitData.internalRemarks) {
      getSaveField('internalRemarks').value =
        state.appointmentInitData.internalRemarks;
    }
    // 展示默认医院列表
    if (state.appointmentInitData.hospitalCode) {
      searchForm.value.hospital = state.appointmentInitData.hospital;
      submit();
      selectedId.value = state.appointmentInitData.hospitalCode;
    }
  }

  async function updateTimeRangeOptions(date?: string) {
    state.timeRangeData = await getTimeRangeInitData(date);
    /*
    console.log('state.timeRangeData', state.timeRangeData);
    if (!state.timeRangeData) {
      return;
    }
    const patientDateField = getPatientDateField();
    patientDateField.extraProps.options = state.timeRangeData.timeList.map(
      (time: string) => {
        return {
          label: time,
          value: time,
        };
      }
    );
    */
  }

  async function updateOtherTimeRangeOptions(date?: string) {
    state.otherTimeRangeData = await getTimeRangeInitData(date);
    console.log('state.otherTimeRangeData', state.timeRangeData);
    if (!state.timeRangeData) {
      return;
    }
    const otherPatientDateField = getOtherPatientDateField();
    otherPatientDateField.extraProps.options =
      state.otherTimeRangeData.timeList.map((time: string) => {
        return {
          label: time,
          value: time,
        };
      });
  }
  /**
   * 营业时间校验
   */
  function checkDateInOperating(date: string, operating: string) {
    // console.log('checkDateInOperating', date, operating);
    const day = dayjs(date).day() || 7;
    const operatingData = operating.split(' ');
    const dayMap: Record<string, number> = {
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
      SUN: 7,
    };
    const min = dayMap[operatingData[0].toUpperCase()];
    const max = dayMap[operatingData[1].toUpperCase()];
    // console.log('day', day, min, max);
    return day >= min && day <= max;
  }

  function genMapUrl(record: Record<string, any>) {
    // return `https://apis.map.qq.com/uri/v1/marker?marker=coord:${
    //   record.latitude
    // },${record.longitude};title:${record.hospital};addr:${
    //   record.hospitalAddress
    // }&referer=${import.meta.env.VITE_MAP_API_KEY}`;
    return `https://uri.amap.com/marker?position=${record.longitude},${
      record.latitude
    }&address=${encodeURIComponent(
      record.hospitalAddress
    )}&name=${encodeURIComponent(
      record.hospital
    )}&src=mypage&coordinate=gaode&callnative=0`;
  }
  async function getAppointmentInitData() {
    const json: any = await appointmentDetail({
      appointmentNo: state.appointmentNo,
    }).catch(() => false);
    return json ? json.data : null;
  }
  function getSaveField(name: string) {
    return state.saveFields.find((field) => {
      return field.name === name;
    }) as Field;
  }

  onActivated(async () => {
    console.log('onActivated');
    if (state.initData) {
      updateTabTitle();
      return;
    }
    state.id = (route.query.id || '') as string;
    state.planCode = (route.query.planCode || '') as string;
    state.corporateCode = (route.query.corporateCode || '') as string;
    state.appointmentNo = (route.query.appointmentNo || '') as string;
    state.ref = (route.query.ref || '') as string;

    state.initData = await getInitData();
    state.appointmentInitData = await getAppointmentInitData();
    refreshAppointment();
    updateTabTitle();
    console.log(checkDateInOperating('2023-06-04', 'SUN SUN 9:00AM 4:00PM'));
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberAppoinmentCreate',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>

<style scoped lang="less">
  .search-bar {
    .input {
      width: 400px;
      margin: 0 10px;
    }
    margin-bottom: 20px;
  }
</style>
