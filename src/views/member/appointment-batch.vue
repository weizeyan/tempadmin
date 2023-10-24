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
    <a-card
      v-for="(item, index) in state.appointmentBaseList"
      :key="index"
      :title="
        '预约信息' + (state.appointmentBaseList.length == 1 ? '' : index + 1)
      "
      class="general-card appointment-base-item"
    >
      <template v-if="index > 0" #extra>
        <a-button
          type="primary"
          status="danger"
          @click="removeAppointmentBaseItem(index)"
        >
          <template #icon>
            <icon-delete />
          </template>
          <template #default>删除</template>
        </a-button>
      </template>
      <div :style="{ width: '700px' }">
        <QueryForm
          ref="batchFormRefs"
          v-model="item.fields"
          direction="vertical"
          :show-button-bar="false"
        ></QueryForm>
      </div>
    </a-card>
    <div v-if="state.appointmentBaseList.length < 10" class="b-add-bar">
      <a-button long type="primary" @click="addAppointmentBaseItem">
        <template #icon>
          <icon-plus />
        </template>
        <template #default>新增</template>
      </a-button>
    </div>

    <a-card class="general-card" title="联系人信息">
      <div :style="{ width: '700px' }">
        <QueryForm
          ref="$contactForm"
          v-model="state.contactFields"
          direction="vertical"
          :show-button-bar="false"
        ></QueryForm>
      </div>
    </a-card>
    <a-card class="general-card">
      <div :style="{ width: '700px' }">
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
        </a-row></div
      >
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
  import { confirm } from '@/utils/dialog';
  import { Field } from '@/components/query-form/index.vue';
  import useLoading from '@/hooks/loading';
  import PatientInfo from './components/patient-info.vue';

  const tabBarStore = useTabBarStore();
  const memberViewStore = useMemberViewStore();
  const route = useRoute();
  const router = useRouter();
  const $contactForm = ref();
  const batchFormRefs = ref<any[]>([]);

  const state = reactive({
    id: '',
    planCode: '',
    corporateCode: '',
    ref: '',
    appointmentNo: '',
    appointmentInitData: null as Record<string, any> | null,
    initData: null as Record<string, any> | null,
    timeRangeData: null as Record<string, any> | null,
    otherTimeRangeData: null as Record<string, any> | null,
    appointmentBaseList: [] as Record<string, any>[],

    contactFields: [
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
      },
    });
  }

  async function getInitData() {
    const json: any = await detail({
      memberControlNo: state.id,
      planCode: state.planCode,
      corporateCode: state.corporateCode,
    }).catch(() => false);
    return json ? json.data : null;
  }

  function updateTabTitle() {
    tabBarStore.setCurrentTabTitle(
      `${state.appointmentNo ? '预约修改' : '批量预约'} - ${
        state.initData?.name
      }`,
      route
    );
  }

  async function save() {
    const batchCheck = await Promise.all(
      batchFormRefs.value.map(($form) => {
        return $form.query();
      })
    );
    console.log('batchCheck', batchCheck);
    const check = batchCheck.every((check) => check);
    if (!check) {
      return;
    }
    const contactCheck = await $contactForm.value.query();
    if (!contactCheck) {
      return;
    }
    // if (!$form.value.form.symptoms.length && !$form.value.form.symptomsRemark) {
    //   Message.error('请填写就诊症状');
    //   return;
    // }
    const appointments: Record<string, any> = batchFormRefs.value.map(
      ($form) => {
        const { patientDate, otherPatientDate } = $form.form;
        const visitDate = patientDate.date;
        // const visitTime = patientDate.timeRange.length
        //   ? patientDate.timeRange.join('-')
        //   : '';
        const visitTime = `${patientDate.startHour}:${patientDate.startMinute}-${patientDate.endHour}:${patientDate.endMinute}`;

        const [otherDate = '', otherEndDate = ''] = otherPatientDate.date;
        const otherTime = otherPatientDate.time;
        const post = {
          ...$form.form,
          visitDate,
          visitTime,
          otherDate,
          otherEndDate,
          otherTime,
        };
        // delete post.otherPatientDate;
        // delete post.patientDate;
        return post;
      }
    );
    const post = {
      name: state.initData?.name,
      cardNo: state.initData?.cardNo,
      hospitalCode: selectedId.value === '-1' ? '' : selectedId.value,
      appointments,
      ...$contactForm.value.form,
      planCode: state.planCode,
      corpCode: state.corporateCode,
      memberControlNo: state.id,
    };
    // console.log('post', post);

    state.submitLoading = true;
    const json: any = await addAppointment(post).catch(() => false);
    if (!json || !json.success) {
      state.submitLoading = false;
      return;
    }
    Message.success(state.appointmentNo ? '预约修改成功' : '新建预约成功');
    back();
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

  function addAppointmentBaseItem() {
    console.log('addAppointmentBaseItem');
    const item = reactive({
      fields: [
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
          value: '',
        },
        {
          name: 'patientDate',
          label: '就诊时间',
          type: 'date-time-range',
          value: {
            date: dayjs().format('YYYY-MM-DD'),
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
            disabledDate(current: Date) {
              return dayjs(current).isBefore(dayjs(), 'day');
            },
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
            disabledDate(current: Date) {
              return dayjs(current).isBefore(dayjs(), 'day');
            },
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

          disabled: true,
          rules: [
            {
              required: true,
              validator(value, callback) {
                const acceptOtherTimeField = getField(
                  'acceptOtherTime',
                  item.fields
                );

                if (acceptOtherTimeField.value === 'N') {
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
      ] as Field[],
    });

    watch(
      () => {
        return item;
      },
      (v) => {
        const acceptOtherTimeField = getField('acceptOtherTime', v.fields);
        const otherPatientDateField = getField('otherPatientDate', v.fields);
        otherPatientDateField.disabled = acceptOtherTimeField.value === 'N';
      },
      {
        deep: true,
      }
    );

    state.appointmentBaseList.push(item);
  }
  function getField(name: string, fields: Field[]) {
    return fields.find((field) => {
      return field.name === name;
    }) as Field;
  }
  async function removeAppointmentBaseItem(index: number) {
    const rs = await confirm({
      content: `确认删除预约信息${index + 1}？`,
    });
    if (!rs) {
      return;
    }
    state.appointmentBaseList.splice(index, 1);
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
    if (state.appointmentNo) {
      state.appointmentInitData = await getAppointmentInitData();
    }
    addAppointmentBaseItem();
    getField('contact', state.contactFields).value = state.initData?.name || '';
    getField('contactMobile', state.contactFields).value =
      state.initData?.mobile || '';
    updateTabTitle();
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberAppoinmentBatch',
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
  .appointment-base-item {
    margin-bottom: 10px;
  }
  .b-add-bar {
    margin-bottom: 10px;
  }
</style>
