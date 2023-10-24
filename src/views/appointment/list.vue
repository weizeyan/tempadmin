<template>
  <div class="container">
    <a-card class="general-card" title="预约列表">
      <QueryForm
        ref="$queryForm"
        v-model="state.fields"
        @query="
          () => {
            submit();
          }
        "
      >
      </QueryForm>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <!-- <a-button type="primary" @click="() => { $router.push({ name: 'SystemRoleDetail' }) }">
              <template #icon>
                <icon-plus />
              </template>
              新建
            </a-button> -->
            <template v-if="selectedIds.length">
              <!-- <a-button type="primary" status="danger" @click="() => { setStatus<string>(selectedIds, '1') }">
                批量禁用
              </a-button> -->
            </template>
          </a-space>
        </a-col>
        <a-col
          :span="12"
          style="display: flex; align-items: center; justify-content: end"
        >
          <a-tooltip content="刷新">
            <div class="action-icon" @click="search()"
              ><icon-refresh size="18"
            /></div>
          </a-tooltip>
        </a-col>
      </a-row>
      <a-table
        ref="$table"
        row-key="appointmentNo"
        :loading="loading"
        :pagination="pagination"
        :columns="state.columns"
        :data="renderData"
        :bordered="false"
        size="medium"
        :scroll="{ x: 4100, y: 400 }"
        @sorter-change="sortChange"
        @page-size-change="(pageSize: number) => { pagination.current = 1; pagination.pageSize = pageSize; search(); }"
        @page-change="(current: number) => { pagination.current = current; search(); }"
        @selection-change="(rowKeys: any[]) => { selectedIds = rowKeys }"
      >
        <template #index="{ rowIndex }">
          {{ rowIndex + 1 + (pagination.current - 1) * pagination.pageSize }}
        </template>
        <template #activeFlag="{ record }">
          <span
            :class="{
              'b-status-green': record.activeFlag === 'Y',
              'b-status-red': record.activeFlag === 'pending',
            }"
          >
            {{ POLICY_STATUS_MAP[record.activeFlag] }}
          </span>
        </template>

        <template #directPaymentMethod="{ record }">
          {{ record.directPaymentMethodDesc }}
        </template>
        <template #processingStatus="{ record }">
          <div class="flex-center-start">
            <div
              class="b-dot"
              :class="{
                'b-dot-orange': record.processingStatus == '0',
                'b-dot-green': record.processingStatus == '1',
                'b-dot-gray': record.processingStatus == '2',
                'b-dot-red': record.processingStatus == '3',
              }"
            ></div>
            <div>
              {{ record.processingStatusDesc }}
            </div>
          </div>
        </template>
        <template #appointmentNo="{ record }">
          <a href="#" @click.prevent="viewDetail(record)">{{
            record.appointmentNo
          }}</a>
        </template>
        <template #name="{ record }">
          {{ record.name }}
        </template>
        <template #dob="{ record }">
          {{ smallDateFormat(record.dob) }}
        </template>
        <template #action="{ record }">
          <a-button type="primary" @click="viewDetail(record)">编辑</a-button>

          <a-button type="outline" @click="previewAppointment(record)"
            >详情</a-button
          >
        </template>

        <template #empty>
          <div v-if="state.btnClick" class="arco-empty">
            <icon-empty size="80" :style="{ color: 'rgba(0,0,0,0.5)' }" />
            <div class="text">暂无数据</div>
          </div>
          <div v-else style="height: 275px"> </div>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, watch, onMounted, onActivated } from 'vue';
  import useLoading from '@/hooks/loading';
  import { searchCorporateList } from '@/api/member';
  import { roleList } from '@/api/system-config/role';
  import { list, hospitalSelect } from '@/api/appointment';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { Field } from '@/components/query-form/index.vue';
  import { useRouter } from 'vue-router';
  import { smallDateFormat } from '@/utils';
  import {
    PAGE_SIZE_OPTIONS,
    ROLES_MAP,
    POLICY_STATUS_MAP,
  } from '@/utils/consts';
  import dayjs from 'dayjs';

  const router = useRouter();
  const cardNoPrepend = ref('8000');
  // const cardNoPrepend = ref('8000-1459');
  const state = reactive({
    btnClick: false,
    fields: [
      {
        name: 'cardNo',
        label: 'Card No',
        type: 'input',
        prepend: cardNoPrepend.value,
        value: '',
        maxLength: 14,
        // maxLength: 9,
        onKeyup(value, event, field) {
          const v = value.replace(/-/g, '');
          console.log('v', v);
          let result = '';
          for (let i = 0; i < v.length; i += 1) {
            if (i === 3 || i === 7) {
              result += v[i] + '-';
            } else {
              result += v[i];
            }
          }

          if (event.keyCode === 8) {
            console.log('2');
            result = result.replace(/-$/, '');
          }
          field.value = result.slice(0, 14);
          // field.value = result.slice(0, 9);
        },
      },

      {
        name: 'name',
        label: 'Name',
        type: 'input',
        value: '',
      },
      {
        name: 'mobile',
        label: 'Mobile',
        type: 'input',
        value: '',
      },
      {
        name: 'icNo',
        label: 'I/C No',
        type: 'input',
        value: '',
      },
      {
        name: 'dob',
        label: 'Date of Birth',
        type: 'input',
        value: '',
        maxLength: 10,
        onKeyup(value, event, field) {
          const v = value.replace(/-/g, '');
          // console.log('value', value, 'v', v, 'event', event);

          let result = '';
          for (let i = 0; i < v.length; i += 1) {
            if (i === 3 || i === 5) {
              result += v[i] + '-';
            } else {
              result += v[i];
            }
          }
          // console.log('result', result);
          if (value === result) {
            result = result.replace(/-$/, '');
          }
          if (event.keyCode === 8) {
            result = result.replace(/-$/, '');
          }

          field.value = result.slice(0, 10);
        },
        placeholder: 'eg. 1960-01-05',
      },
      {
        name: 'hospital',
        label: '就诊医院',
        type: 'input',
        value: '',
        allowClear: true,
      },
      /*
      {
        name: 'hospital',
        label: '就诊医院',
        type: 'select',
        value: '',
        allowClear: true,
        allowSearch: true,
        remote: async (keyword) => {
          const key = keyword.trim();
          if (!key) {
            return [];
          }
          const json: any = await hospitalSelect({ keyword: key }).catch(
            () => false
          );
          const list = json ? json.data || [] : [];
          return list.map((item: Record<string, any>) => {
            return {
              label: item.hospital,
              value: item.hospitalCode,
            };
            // return item.hospital;
          });
        },
      },
      */
      {
        name: 'processingStatus',
        label: '处理状态',
        type: 'select',
        value: [],

        options: [
          {
            label: '待确认',
            value: '0',
          },
          {
            label: '预约成功',
            value: '1',
          },
          {
            label: '预约取消',
            value: '2',
          },
          {
            label: '预约关闭',
            value: '3',
          },
        ],
        extraProps: {
          multiple: true,
        },
      },
      {
        name: 'appointmentNo',
        label: '预约编号',
        type: 'input',
        value: '',
      },
      {
        name: 'creatorRole',
        label: '创建人角色',
        type: 'select',
        value: [],
        options: Object.keys(ROLES_MAP).map((label) => {
          return {
            label,
            value: ROLES_MAP[label],
          };
        }),
        extraProps: {
          multiple: true,
          maxTagCount: 3,
        },
      },
      {
        name: 'corpCode',
        label: '投保公司',
        type: 'select',
        value: '',
        allowClear: true,
        allowSearch: true,
        remote: async (key) => {
          const json: any = await searchCorporateList({ keyword: key }).catch(
            () => false
          );
          const list = json ? json.data || [] : [];
          return list.map((item: any) => {
            return {
              label: `${item.longName} (${item.corporate})`,
              value: item.corporate,
            };
          });
        },
      },

      {
        name: 'visitDate',
        label: '就诊日期',
        type: 'range-picker',
        value: [],
        extraProps: {
          shortcutsPosition: 'left',
          shortcuts: [
            {
              label: '昨天',
              value: [dayjs().subtract(1, 'day'), dayjs().subtract(1, 'day')],
            },
            {
              label: '今天',
              value: [dayjs(), dayjs()],
            },
            {
              label: '最近一周',
              value: [dayjs().subtract(6, 'day'), dayjs()],
            },
            {
              label: '最近一个月',
              value: [dayjs().subtract(29, 'day'), dayjs()],
            },
            /*
            {
              label: '最近三个月',
              value: [dayjs().subtract(89, 'day'), dayjs()],
            },
            */
          ],
        },
      },
    ] as Field[],
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        slotName: 'index',
        width: 100,
        fixed: 'left',
      },
      {
        title: '预约编号',
        dataIndex: 'appointmentNo',
        slotName: 'appointmentNo',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        ellipsis: true,
        tooltip: true,
        width: 200,
        fixed: 'left',
      },
      {
        title: '处理状态',
        dataIndex: 'processingStatus',
        slotName: 'processingStatus',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
      },

      {
        title: '保单状态',
        dataIndex: 'activeFlag',
        slotName: 'activeFlag',

        width: 150,
      },

      {
        title: '投保公司',
        dataIndex: 'corpName',
        slotName: 'corpName',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 250,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: '计划',
        dataIndex: 'planCode',
        slotName: 'planCode',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 250,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: '保险卡号',
        dataIndex: 'cardNo',
        slotName: 'cardNo',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: '就诊人姓名',
        dataIndex: 'name',
        slotName: 'name',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: '出生年月',
        dataIndex: 'dob',
        slotName: 'dob',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
      },
      {
        title: '就诊人电话',
        dataIndex: 'mobile',
        slotName: 'mobile',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: '直付方式',
        dataIndex: 'directPaymentMethod',
        slotName: 'directPaymentMethod',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },

        width: 150,
      },

      {
        title: '就诊医院',
        dataIndex: 'hospital',
        slotName: 'hospital',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        ellipsis: true,
        tooltip: true,
        width: 250,
      },
      {
        title: '就诊科室',
        dataIndex: 'department',
        slotName: 'department',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
      },
      {
        title: '就诊医生',
        dataIndex: 'doctor',
        slotName: 'doctor',
        width: 150,
      },
      {
        title: '就诊日期',
        dataIndex: 'visitDate',
        slotName: 'visitDate',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
      },
      {
        title: '联系人姓名',
        dataIndex: 'contact',
        slotName: 'contact',
        width: 200,
      },
      {
        title: '联系人电话',
        dataIndex: 'contactMobile',
        slotName: 'contactMobile',
        width: 200,
      },
      {
        title: '创建人',
        dataIndex: 'creator',
        slotName: 'creator',
        width: 200,
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
        slotName: 'createTime',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
      },
      {
        title: '更新人',
        dataIndex: 'modifier',
        slotName: 'modifier',
        width: 200,
      },
      {
        title: '更新时间',
        dataIndex: 'modifyTime',
        slotName: 'modifyTime',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
      },

      {
        title: '操作',
        dataIndex: 'action',
        slotName: 'action',
        fixed: 'right',
        width: 200,
      },
    ] as TableColumnData[],

    onlyOneRecordState: false,
  });
  const { loading, setLoading } = useLoading(false);
  const renderData = ref<any[]>([]);
  const formCache = ref<Record<string, any>>({});
  const selectedIds = ref<any[]>([]);
  const $queryForm = ref();
  const $table = ref();

  // 分页参数
  const pagination = reactive({
    current: 1,
    pageSize: 50,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    total: 0,
    showTotal: true,
    showJumper: true,
    showPageSize: true,
  });

  // 排序参数
  const sort = reactive({
    sortField: '',
    sortType: '',
  });

  /**
   * 查询列表操作
   */
  async function search() {
    setLoading(true);
    const params: Record<string, any> = {
      pageSize: pagination.pageSize,
      pageNum: pagination.current,
      ...formCache.value,
      sorts: sort.sortField
        ? [
            {
              name: sort.sortField,
              sort: sort.sortType === 'descend' ? 'DESC' : 'ASC',
            },
          ]
        : [],
    };
    if (params.cardNo) {
      params.cardNo = `${cardNoPrepend.value.replace(
        /-/g,
        ''
      )}${formCache.value.cardNo.replace(/-/g, '')}`;
    } else {
      delete params.cardNo;
    }
    if (!params.name) {
      delete params.name;
    }
    if (!params.mobile) {
      delete params.mobile;
    }

    if (!params.icNo) {
      delete params.icNo;
    }
    if (!params.dob) {
      delete params.dob;
    }
    if (!params.hospital) {
      delete params.hospital;
    }
    if (!params.corpCode) {
      delete params.corpCode;
    }
    if (!params.processingStatus.length) {
      delete params.processingStatus;
    }
    if (!params.appointmentNo) {
      delete params.appointmentNo;
    }
    if (!params.creatorRole.length) {
      delete params.creatorRole;
    }

    if (params.visitDate.length) {
      [params.visitStartDate, params.visitEndDate] = params.visitDate;
    }
    delete params.visitDate;
    console.log('params', params);
    const json: any = await list(params).catch(() => false);
    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data.list;
    pagination.total = json.data.total;
    $table.value.selectAll(false);
    if (state.onlyOneRecordState) {
      return;
    }
    state.onlyOneRecordState = json.data.total === 1;
    if (state.onlyOneRecordState) {
      viewDetail(json.data.list[0]);
    }
  }
  function viewDetail(record: Record<string, any>) {
    const query = {
      id: record.memberControlNo || '',
      planCode: record.planCode || '',
      corporateCode: record.corpCode || '',
      appointmentNo: record.appointmentNo || '',
    };
    router.push({
      name: 'MemberView',
      query,
    });
  }
  function previewAppointment(record: Record<string, any>) {
    const query = {
      id: record.memberControlNo || '',
      appointmentNo: record.appointmentNo,
      planCode: record.planCode || '',
      corporateCode: record.corpCode || '',
    };
    router.push({
      name: 'MemberAppoinmentPreview',
      query,
    });
  }
  /**
   * 自定义排序
   * @param field {String} 排序字段名称
   * @param type {String} 排序方式，升序、降序、空
   */
  function sortChange(field: string, type: string) {
    state.btnClick = true;
    if (type) {
      sort.sortType = type;
      sort.sortField = field;
    } else {
      sort.sortType = '';
      sort.sortField = '';
    }
    search();
  }

  async function getRoleList() {
    /*
    const json: any = await roleList({}).catch(() => false);
    if (!json) {
      return [];
    }
    return (json.data || []).map((item: string[]) => {
      return {
        label: item,
        value: item,
      };
    });

    */
    return Object.keys(ROLES_MAP).map((label) => {
      return {
        label,
        value: ROLES_MAP[label],
      };
    });
  }
  function submit() {
    state.btnClick = true;
    console.log('submit');
    state.onlyOneRecordState = false;
    pagination.current = 1;
    formCache.value = $queryForm.value.form;
    search();
  }
  function getField(name: string) {
    return state.fields.find((field) => {
      return field.name === name;
    }) as Field;
  }
  onMounted(async () => {});

  onActivated(() => {
    if (!state.btnClick) {
      return;
    }
    search();
  });
</script>

<script lang="ts">
  export default {
    name: 'MemberList',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
