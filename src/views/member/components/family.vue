<template>
  <a-card class="general-card">
    <a-table
      v-if="state.familyMemberInitData"
      ref="$memberTable"
      row-key="idx"
      :row-selection="{
        onlyCurrent: true,
        showCheckedAll: true,
        type: 'checkbox',
      }"
      :pagination="false"
      :columns="memberColumns"
      :data="state.familyMemberInitData.list"
      :scroll="{ x: 2000 }"
      :bordered="false"
      size="medium"
      @selection-change="(rowKeys: any[]) => { selectedMemberIds = rowKeys; onMemberSelectionChange(); }"
    >
      <template #tr="{ record }">
        <tr
          :class="{ 'status-red': record.policyStatus.toLowerCase() !== 'y' }"
        ></tr>
      </template>
      <template #name="{ record }">
        <template v-if="record.memberControlNo !== data.memberControlNo">
          <router-link
            :to="{
              name: 'MemberView',
              query: {
                id: record.memberControlNo,
                planCode: record.plan || '',
                corporateCode: record.corporateCode || '',
              },
            }"
            >{{ record.name }}</router-link
          >
        </template>
        <template v-else>
          {{ record.name }}
        </template>
      </template>
      <template #dateOfBirth="{ record }">
        {{ smallDateFormat(record.dateOfBirth) }}
      </template>
      <template #planStartDate="{ record }">
        {{ smallDateFormat(record.planStartDate) }}
      </template>
      <template #planEndDate="{ record }">
        {{ smallDateFormat(record.planEndDate) }}
      </template>
      <template #terminationDate="{ record }">
        {{ smallDateFormat(record.terminationDate) }}
      </template>
      <template #sex="{ record }">
        {{ record.sex }}
      </template>
    </a-table>
    <a-divider />
    <QueryForm
      ref="$queryForm"
      v-model="state.fields"
      :row-count="1"
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
          <template v-if="selectedIds.length">
            <a-button
              type="primary"
              @click="
                () => {
                  exportResult(selectedIds);
                }
              "
            >
              导出选中项
            </a-button>
          </template>
          <a-button
            type="primary"
            @click="
              () => {
                exportResult();
              }
            "
          >
            全部导出
          </a-button>
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
      row-key="claimId"
      :row-selection="{
        onlyCurrent: true,
        showCheckedAll: true,
        type: 'checkbox',
      }"
      :loading="loading"
      :pagination="pagination"
      :columns="columns"
      :data="renderData"
      :bordered="false"
      size="medium"
      :scroll="{ x: 3000, y: 400 }"
      @sorter-change="sortChange"
      @page-size-change="(pageSize: number) => { pagination.current = 1; pagination.pageSize = pageSize; search(); }"
      @page-change="(current: number) => { pagination.current = current; search(); }"
      @selection-change="(rowKeys: any[]) => { selectedIds = rowKeys }"
    >
      <template #claimId="{ record }">
        <router-link
          :to="{ name: 'MemberClaim', query: { id: record.claimId } }"
          >{{ record.claimId }}</router-link
        >
      </template>
      <template #registeredDate="{ record }">
        {{ smallDateFormat(record.registeredDate) }}
      </template>
      <template #eventStartDate="{ record }">
        {{ smallDateFormat(record.eventStartDate) }}
      </template>
      <template #eventEndDate="{ record }">
        {{ smallDateFormat(record.eventEndDate) }}
      </template>
    </a-table>
  </a-card>
</template>

<script lang="ts" setup>
  import { DescData, TableColumnData } from '@arco-design/web-vue';
  import { onMounted, ref, reactive, computed } from 'vue';
  import {
    familyMemberList,
    familyClaimList,
    familySelectList,
    exportAllClaim,
    exportSelectClaim,
  } from '@/api/member';
  import { Field } from '@/components/query-form/index.vue';
  import useLoading from '@/hooks/loading';
  import { useRoute } from 'vue-router';
  import { downloadFile, smallDateFormat } from '@/utils';
  import { PAGE_SIZE_OPTIONS } from '@/utils/consts';
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

  // 分页列表
  const { loading, setLoading } = useLoading(true);
  const renderData = ref<any[]>([]);
  const formCache = ref<Record<string, any>>({});
  const selectedIds = ref<any[]>([]);

  // 家庭成员列表
  const selectedMemberIds = ref<any[]>([]);
  const $table = ref();
  const $memberTable = ref();

  // 表单筛选器
  const $queryForm = ref();

  const state = reactive({
    employeeId: props.data.employeeId,

    fields: [
      {
        label: 'Type',
        name: 'type',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
        colSpan: 4,
        labelColProps: { span: 10 },
        wrapperColProps: { span: 14 },
      },
      {
        label: 'Coverage',
        name: 'coverage',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
        colSpan: 6,
        labelColProps: { span: 10 },
        wrapperColProps: { span: 14 },
      },
      {
        label: 'Provider Name',
        name: 'providerId',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
        colSpan: 8,
        labelColProps: { span: 10 },
        wrapperColProps: { span: 14 },
      },
      {
        label: 'Claim Status',
        name: 'claimStatus',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
        colSpan: 6,
        labelColProps: { span: 11 },
        wrapperColProps: { span: 13 },
      },
    ] as Field[],
    familyMemberInitData: null as Record<string, any> | null,
  });

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

  // 列表展示字段
  const columns: TableColumnData[] = [
    {
      title: 'ClaimID',
      dataIndex: 'claimId',
      slotName: 'claimId',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Case NO ',
      dataIndex: 'caseNo',
      slotName: 'caseNo',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Patient Name ',
      dataIndex: 'patientName',
      slotName: 'patientName',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 200,
      ellipsis: true,
      tooltip: true,
      fixed: 'left',
    },
    {
      title: 'Patient IC ',
      dataIndex: 'patientIc',
      slotName: 'patientIc',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Type ',
      dataIndex: 'type',
      slotName: 'type',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 100,
    },
    {
      title: 'Relation',
      dataIndex: 'relation',
      slotName: 'relation',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Coverage',
      dataIndex: 'coverage',
      slotName: 'coverage',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 110,
    },
    {
      title: 'Admission Type',
      dataIndex: 'admissionType',
      slotName: 'admissionType',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'Provider Name',
      dataIndex: 'providerName',
      slotName: 'providerName',

      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Registered Date',
      dataIndex: 'registeredDate',
      slotName: 'registeredDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'Event Start Date',
      dataIndex: 'eventStartDate',
      slotName: 'eventStartDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'Event End Date',
      dataIndex: 'eventEndDate',
      slotName: 'eventEndDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'Incurred Amt',
      dataIndex: 'incurredAmt',
      slotName: 'incurredAmt',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 100,
    },
    {
      title: 'Approved',
      dataIndex: 'approved',
      slotName: 'approved',

      width: 100,
    },
    {
      title: 'Claims Status',
      dataIndex: 'claimsStatus',
      slotName: 'claimsStatus',
      width: 100,
    },
    {
      title: 'Claims Status Description',
      dataIndex: 'claimsStatusDescription',
      slotName: 'claimsStatusDescription',
      width: 300,
      tooltip: true,
      ellipsis: true,
    },
    {
      title: 'Deductible',
      dataIndex: 'deductible',
      slotName: 'deductible',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 120,
    },
    {
      title: 'Claim Last Transaction Status',
      dataIndex: 'claimsLastStatus',
      slotName: 'claimsLastStatus',
      width: 100,
    },
    {
      title: 'Primary Diagnosis',
      dataIndex: 'primaryDiagnosis',
      slotName: 'primaryDiagnosis',
      // width: 300,
      tooltip: true,
      ellipsis: true,
    },
  ];

  /**
   * 查询列表操作
   */
  async function search() {
    setLoading(true);
    const params: Record<string, any> = {
      pageSize: pagination.pageSize,
      pageNum: pagination.current,
      sorts: sort.sortField
        ? [
            {
              name: sort.sortField === 'userId' ? 'id' : sort.sortField,
              sort: sort.sortType === 'descend' ? 'DESC' : 'ASC',
            },
          ]
        : [],
      ...getCommonQueryParams(),
    };

    console.log('params', params);
    const json = await familyClaimList(params);
    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data.list;
    pagination.total = json.data.total;
    $table.value.selectAll(false);
  }

  function getCommonQueryParams(): Record<string, any> {
    const params: Record<string, any> = {
      employeeId: state.employeeId,
      ...formCache.value,
      ...commonMemberParams(),
    };
    params.type = formCache.value.type ? [formCache.value.type] : [];
    params.coverage = formCache.value.coverage
      ? [formCache.value.coverage]
      : [];
    params.providerId = formCache.value.providerId
      ? [formCache.value.providerId]
      : [];
    params.claimStatus = formCache.value.claimStatus
      ? [formCache.value.claimStatus]
      : [];

    return params;
  }
  /**
   * 自定义排序
   * @param field {String} 排序字段名称
   * @param type {String} 排序方式，升序、降序、空
   */
  function sortChange(field: string, type: string) {
    if (type) {
      sort.sortType = type;
      sort.sortField = field;
    } else {
      sort.sortType = '';
      sort.sortField = '';
    }
    search();
  }

  function submit() {
    pagination.current = 1;
    formCache.value = $queryForm.value.form;
    search();
  }

  const memberColumns: TableColumnData[] = [
    {
      title: 'Name',
      dataIndex: 'name',
      slotName: 'name',
      ellipsis: true,
      tooltip: true,
      width: 200,
      fixed: 'left',
    },
    {
      title: 'P/D',
      dataIndex: 'pd',
      slotName: 'pd',
      width: 50,
    },
    {
      title: 'Sex',
      dataIndex: 'sex',
      slotName: 'sex',
      width: 80,
    },

    {
      title: 'Card No',
      dataIndex: 'cardNo',
      slotName: 'cardNo',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },

    {
      title: 'Plan',
      dataIndex: 'plan',
      slotName: 'plan',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },

    {
      title: 'Plan Start Date',
      dataIndex: 'planStartDate',
      slotName: 'planStartDate',
      width: 150,
    },
    {
      title: 'Plan End Date',
      dataIndex: 'planEndDate',
      slotName: 'planEndDate',
      width: 150,
    },
    {
      title: 'Termination Date',
      dataIndex: 'terminationDate',
      slotName: 'terminationDate',
      width: 150,
    },
    {
      title: 'Date Of Birth',
      dataIndex: 'dateOfBirth',
      slotName: 'dateOfBirth',
      width: 150,
    },

    {
      title: 'NRIC No',
      dataIndex: 'nricNo',
      slotName: 'nricNo',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Mobile',
      dataIndex: 'mobile',
      slotName: 'mobile',
      width: 150,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      slotName: 'email',
      width: 150,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Policy Status',
      dataIndex: 'policyStatus',
      slotName: 'policyStatus',
      width: 150,
    },
  ];
  function commonMemberParams() {
    const params: Record<string, any> = {
      employeeId: state.employeeId,
      members: selectedMemberIds.value.map((idx) => {
        return state.familyMemberInitData?.list[idx];
      }),
    };
    return params;
  }
  /**
   * 批量加载下拉选项
   */
  async function refreshOptions() {
    const params = commonMemberParams();
    const json: any = await familySelectList(params).catch(() => false);
    if (!json) {
      return;
    }
    const { data } = json;
    Object.keys(data).forEach((key) => {
      data[key] = data[key].map((item: Record<string, any>) => {
        return {
          label: item.name,
          value: item.value,
        };
      });
    });
    state.fields[0].options = data.type;
    if (
      data.type.findIndex((option: Record<string, any>) => {
        return option.value === state.fields[0].value;
      }) === -1
    ) {
      state.fields[0].value = '';
    }

    state.fields[1].options = data.coverage;
    if (
      data.coverage.findIndex((option: Record<string, any>) => {
        return option.value === state.fields[1].value;
      }) === -1
    ) {
      state.fields[1].value = '';
    }

    state.fields[2].options = data.providerName;
    if (
      data.providerName.findIndex((option: Record<string, any>) => {
        return option.value === state.fields[2].value;
      }) === -1
    ) {
      state.fields[2].value = '';
    }

    state.fields[3].options = data.claimStatus;
    if (
      data.claimStatus.findIndex((option: Record<string, any>) => {
        return option.value === state.fields[3].value;
      }) === -1
    ) {
      state.fields[3].value = '';
    }
  }

  async function onMemberSelectionChange() {
    refreshOptions();
    submit();
  }

  async function exportResult(ids: any[] = []) {
    const params = getCommonQueryParams();
    const p = ids.length
      ? exportSelectClaim({
          claimsId: ids,
        })
      : exportAllClaim(params);
    const res: any = await p.catch(() => false);
    if (!res) {
      return;
    }
    const fileName = res.headers['content-disposition']
      ? decodeURIComponent(
          res.headers['content-disposition'].replace(/\w+;filename=(.*)/, '$1')
        )
      : 'download.xlsx';
    downloadFile(res.data, fileName);
    /*
  const url = window.URL.createObjectURL(new Blob([res.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'
  }))
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.setAttribute('download', fileName);
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
  */
  }

  async function getFamilyMemberInitData() {
    const json: any = await familyMemberList({
      employeeId: state.employeeId,
      pageNum: 1,
      pageSize: 9999,
    }).catch(() => false);
    if (json && json.data.list) {
      json.data.list.forEach((item: Record<string, any>, index: number) => {
        item.idx = index;
      });
    }
    return json ? json.data : null;
  }

  onMounted(async () => {
    state.familyMemberInitData = await getFamilyMemberInitData();

    refreshOptions();
    submit();
  });
</script>
