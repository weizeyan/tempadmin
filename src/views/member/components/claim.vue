<template>
  <a-card class="general-card">
    <QueryForm
      ref="$queryForm"
      v-model="state.fields"
      :label-col-props="{ span: 9 }"
      :wrapper-col-props="{ span: 15 }"
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
          <a-button type="primary" @click="regClaim"
            >Register Cashless Claim</a-button
          >
          <template v-if="selectedIds.length"> </template>
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
      :summary="summary"
      :bordered="false"
      size="medium"
      :scroll="{ x: 3500, y: 400 }"
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
      <!-- <template #diagnosis="{ record }">
        <a href="#" @click.prevent="sendQuestion(record)">
          {{ record.diagnosis }}
        </a>
      </template> -->
      <template #eventStartDate="{ record }">
        {{ smallDateFormat(record.eventStartDate) }}
      </template>
      <template #registeredDate="{ record }">
        {{ smallDateFormat(record.registeredDate) }}
      </template>
    </a-table>
  </a-card>
</template>

<script lang="ts" setup>
  import { DescData, TableColumnData } from '@arco-design/web-vue';
  import { onMounted, ref, reactive, computed } from 'vue';
  import { claimList, claimSelectList } from '@/api/member';
  import { Field } from '@/components/query-form/index.vue';
  import useLoading from '@/hooks/loading';
  import { useRoute } from 'vue-router';
  import Decimal from 'decimal.js';
  import {
    numberCurrency,
    smallDateFormat,
    openWindow,
    openWin,
  } from '@/utils';
  import { PAGE_SIZE_OPTIONS } from '@/utils/consts';
  import { chatGptEmitter } from '@/components/chat-gpt/event';
  import { confirm } from '@/utils/dialog';
  import { on } from 'events';
  import { onBeforeUnmount } from 'vue';

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
  const globalSummaryData = ref<Record<string, any>>({});
  const formCache = ref<Record<string, any>>({});
  const selectedIds = ref<any[]>([]);

  const summaryData = computed(() => {
    let incurredAmt = new Decimal(0);
    let approved = new Decimal(0);
    const countData: Record<string, any> = {
      incurredAmt: 0,
      approved: 0,
    };
    console.log('selectedIds.value', selectedIds.value);
    if (selectedIds.value.length) {
      renderData.value
        .filter((record: Record<string, any>) => {
          return selectedIds.value.indexOf(record.claimId) !== -1;
        })
        .forEach((record: Record<string, any>) => {
          incurredAmt = incurredAmt.plus(record.incurredAmt || 0);
          approved = approved.plus(record.approved || 0);
        });
      countData.incurredAmt = incurredAmt.toNumber();
      countData.approved = approved.toNumber();
    } else {
      countData.incurredAmt = +globalSummaryData.value.incurredAmt;
      countData.approved = +globalSummaryData.value.approved;
    }
    return countData;
  });

  const $table = ref();

  // 表单筛选器
  const $queryForm = ref();

  const state = reactive({
    memberControlNo: props.data.memberControlNo,
    claimId: props.data.claimId,
    fields: [
      {
        label: 'Type',
        name: 'type',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
      },
      {
        label: 'Coverage',
        name: 'coverage',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
      },
      {
        label: 'Provider Name',
        name: 'providerId',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
      },
      {
        label: 'Claim Status',
        name: 'claimStatus',
        type: 'select',
        value: '',
        options: [],
        allowClear: true,
        allowSearch: true,
      },
      {
        label: 'ClaimId',
        name: 'claimId',
        type: 'input',
        value: props.data.claimId,
      },
    ] as Field[],
    regClaimUrl: `${
      import.meta.env.VITE_ECCS_URL
    }/CSPortal/Forms/MSWA0210_Register_CS?claimtyp=M&empid=${
      props.data.employeeId
    }&depid=${props.data.dependentId || ''}`,
  });

  let winInterval: any = null;

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
      title: 'IClaim Id',
      dataIndex: 'iclaimId',
      slotName: 'iclaimId',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },

    {
      title: 'Registered Date',
      dataIndex: 'registeredDate',
      slotName: 'registeredDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 180,
    },

    {
      title: 'Event Start Date',
      dataIndex: 'eventStartDate',
      slotName: 'eventStartDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 180,
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
      title: 'Coverage',
      dataIndex: 'coverage',
      slotName: 'coverage',
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
      tooltip: true,
      ellipsis: true,
    },

    {
      title: 'Claims Status',
      dataIndex: 'claimsStatus',
      slotName: 'claimsStatus',
      width: 100,
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
    },
    {
      title: 'Claim Status Description',
      dataIndex: 'claimsStatusDescription',
      slotName: 'claimsStatusDescription',
      width: 200,
      tooltip: true,
      ellipsis: true,
    },
    {
      title: 'Claim Last Transaction Status',
      dataIndex: 'claimsLastStatus',
      slotName: 'claimsLastStatus',
      width: 150,
    },
    {
      title: 'Incurred Currency',
      dataIndex: 'incurredCurrency',
      slotName: 'incurredCurrency',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Incurred Amt',
      dataIndex: 'incurredCurrencyAmt',
      slotName: 'incurredCurrencyAmt',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Incurred Amt（CNY）',
      dataIndex: 'incurredAmt',
      slotName: 'incurredAmt',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Approved Amt',
      dataIndex: 'approvedCurrencyAmt',
      slotName: 'approvedCurrencyAmt',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Approved Amt（CNY)',
      dataIndex: 'approved',
      slotName: 'approved',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Paid Currency',
      dataIndex: 'paidCurrency',
      slotName: 'paidCurrency',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
    },
    {
      title: 'Paid Amt',
      dataIndex: 'paidAmt',
      slotName: 'paidAmt',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
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
      title: 'Diagnosis',
      dataIndex: 'diagnosis',
      slotName: 'diagnosis',
      width: 400,
      ellipsis: true,
      tooltip: true,
    },

    {
      title: 'Assessment Public Remarks',
      dataIndex: 'assessmentPublicRemarks',
      slotName: 'assessmentPublicRemarks',
      // width: 300,
      ellipsis: true,
      tooltip: true,
    },
  ];

  /**
   * 查询列表操作
   */
  async function search() {
    setLoading(true);
    const params: Record<string, any> = {
      memberControlNo: state.memberControlNo,
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

    const json = await claimList(params);

    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data.list || [];
    globalSummaryData.value = json.data.statistics || {
      approved: '0.00',
      incurredAmt: '0.00',
    };
    pagination.total = json.data.total;
    $table.value.selectAll(false);
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

  /**
   * 批量加载下拉选项
   */
  async function refreshOptions() {
    const params = {
      // claimId: state.claimId,
      memberControlNo: state.memberControlNo,
    };
    const json: any = await claimSelectList(params).catch(() => false);
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

  function summary() {
    return [
      {
        claimStatusDescription: '合计：',
        incurredAmt: `${numberCurrency(summaryData.value.incurredAmt)}`,
        approved: `${numberCurrency(summaryData.value.approved)}`,
      },
    ];
  }

  function sendQuestion(data: Record<string, any>) {
    const question = data.diagnosis;
    console.log('question', question);

    chatGptEmitter.emit('send', {
      message: question,
    });
  }

  async function regClaim() {
    const win = openWin(state.regClaimUrl, 'regiserClaim', 800, 600);
    destroyWinInterval();
    winInterval = setInterval(() => {
      if (win && win.closed) {
        destroyWinInterval();
        search();
      }
    }, 500);
  }

  function destroyWinInterval() {
    if (!winInterval) {
      return;
    }
    clearInterval(winInterval);
    winInterval = null;
  }

  onMounted(async () => {
    state.claimId = (route.query.claimId || '') as string;
    refreshOptions();
    submit();
  });
  onBeforeUnmount(() => {
    destroyWinInterval();
  });
</script>
