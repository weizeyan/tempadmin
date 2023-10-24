<template>
  <div>
    <a-card class="general-card" title="Assessment">
      <a-table
        v-if="state.initData"
        ref="$table"
        row-key="cd"
        :loading="loading"
        :row-selection="{
          onlyCurrent: true,
          showCheckedAll: true,
          type: 'checkbox',
        }"
        :bordered="{ cell: true }"
        :data="state.initData.pageInfo.list"
        size="medium"
        :pagination="false"
        :summary="summary"
        :scroll="{ y: 500 }"
        @selection-change="(rowKeys: any[]) => { selectedIds = rowKeys }"
        @sorter-change="sortChange"
      >
        <template #columns>
          <a-table-column
            :title="`Provider Currency (${state.initData.providerCny})`"
          >
            <a-table-column
              title="CD"
              :width="100"
              data-index="cd"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Description"
              :width="100"
              data-index="description"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Reg.Exp."
              :width="100"
              data-index="regExp"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Amt.Incurred"
              :width="120"
              data-index="amtIncurred"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Disc On Amt.Inc"
              :width="160"
              data-index="discOnAmtInc"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Amt After Disc"
              :width="150"
              data-index="amtAfterDisc"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Over Charged"
              :width="100"
              data-index="overCharged"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Amt Approved"
              :width="100"
              data-index="pcAmtApproved"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Amt Not Approved"
              :width="100"
              data-index="pcAmtNotApproved"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
          </a-table-column>
          <a-table-column
            :title="`System Currency (${state.initData.systemCny})`"
          >
            <a-table-column
              title="Amount Incurred"
              :width="100"
              data-index="scAmountIncurred"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Amount Approved"
              :width="100"
              data-index="scAmountApproved"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
            <a-table-column
              title="Amount Not Approved"
              :width="100"
              data-index="scAmountNotApproved"
              :sortable="{
                sorter: true,
                sortDirections: ['descend', 'ascend'],
              }"
            ></a-table-column>
          </a-table-column>
        </template>
        <template #summary-cell="{ column, record }">
          {{ record[column.dataIndex] }}
        </template>
      </a-table>
    </a-card>

    <a-card class="general-card">
      <h4>Assessment Public Remark</h4>
      <div class="text" v-html="state.initData?.publicRemark"> </div>
      <h4>Assessment Private Remark</h4>
      <div class="text" v-html="state.initData?.privateRemark"> </div>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { DescData, TableColumnData } from '@arco-design/web-vue';
  import { onMounted, ref, reactive, computed } from 'vue';
  import { claimAssessment } from '@/api/member';
  import { useRoute } from 'vue-router';
  import Decimal from 'decimal.js';
  import { numberCurrency } from '@/utils';
  import useLoading from '@/hooks/loading';

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
  const $table = ref();
  const state = reactive({
    id: '',
    initData: null as Record<string, any> | null,
  });
  const selectedIds = ref<any[]>([]);
  const { loading, setLoading } = useLoading(false);
  const globalSummaryData = ref<Record<string, any>>({});

  // 排序参数
  const sort = reactive({
    sortField: '',
    sortType: '',
  });

  async function getInitData() {
    setLoading(true);
    const json: any = await claimAssessment({
      claimId: state.id,
      pageNum: 1,
      pageSize: 9999,
      sorts: sort.sortField
        ? [
            {
              name: sort.sortField,
              sort: sort.sortType === 'descend' ? 'DESC' : 'ASC',
            },
          ]
        : [],
    }).catch(() => false);
    setLoading(false);
    if (!json) {
      return null;
    }
    if (!json.data.pageInfo.list) {
      json.data.pageInfo.list = [];
    }
    json.data.pageInfo.list.forEach((item: Record<string, any>) => {
      item.disabled = item.calFlag === 'N';
    });
    globalSummaryData.value = json.data.pageInfo.statistics || {};
    return json.data;
  }

  const summaryData = computed(() => {
    let amtIncurred = new Decimal(0);
    let discOnAmtInc = new Decimal(0);
    let overCharged = new Decimal(0);
    let amtAfterDisc = new Decimal(0);
    let pcAmtApproved = new Decimal(0);
    let pcAmtNotApproved = new Decimal(0);
    let scAmountIncurred = new Decimal(0);
    let scAmountApproved = new Decimal(0);
    let scAmountNotApproved = new Decimal(0);

    const countData: Record<string, any> = {
      amtIncurred: 0,
      amtAfterDisc: 0,
      discOnAmtInc: 0,
      overCharged: 0,
      pcAmtApproved: 0,
      pcAmtNotApproved: 0,
      scAmountIncurred: 0,
      scAmountApproved: 0,
      scAmountNotApproved: 0,
    };
    if (selectedIds.value.length) {
      const list = state.initData?.pageInfo.list.filter(
        (record: Record<string, any>) => {
          return selectedIds.value.indexOf(record.cd) !== -1;
        }
      );
      list.forEach((record: Record<string, any>) => {
        amtIncurred = amtIncurred.plus(record.amtIncurred);
        discOnAmtInc = discOnAmtInc.plus(record.discOnAmtInc);
        overCharged = overCharged.plus(record.overCharged);
        amtAfterDisc = amtAfterDisc.plus(record.amtAfterDisc);
        pcAmtApproved = pcAmtApproved.plus(record.pcAmtApproved);
        pcAmtNotApproved = pcAmtNotApproved.plus(record.pcAmtNotApproved);
        scAmountIncurred = scAmountIncurred.plus(record.scAmountIncurred);
        scAmountApproved = scAmountApproved.plus(record.scAmountApproved);
        scAmountNotApproved = scAmountNotApproved.plus(
          record.scAmountNotApproved
        );
      });
      countData.amtIncurred = amtIncurred.toNumber();
      countData.discOnAmtInc = discOnAmtInc.toNumber();
      countData.overCharged = overCharged.toNumber();
      countData.amtAfterDisc = amtAfterDisc.toNumber();
      countData.pcAmtApproved = pcAmtApproved.toNumber();
      countData.pcAmtNotApproved = pcAmtNotApproved.toNumber();
      countData.scAmountIncurred = scAmountIncurred.toNumber();
      countData.scAmountApproved = scAmountApproved.toNumber();
      countData.scAmountNotApproved = scAmountNotApproved.toNumber();
    } else {
      countData.amtAfterDisc = +(globalSummaryData.value.amtAfterDisc || 0);
      countData.amtIncurred = +(globalSummaryData.value.amtIncurred || 0);
      countData.discOnAmtInc = +(globalSummaryData.value.discOnAmtInc || 0);
      countData.overCharged = +(globalSummaryData.value.overCharged || 0);
      countData.pcAmtApproved = +(globalSummaryData.value.pcAmtApproved || 0);
      countData.pcAmtNotApproved = +(
        globalSummaryData.value.pcAmtNotApproved || 0
      );
      countData.scAmountIncurred = +(
        globalSummaryData.value.scAmountIncurred || 0
      );
      countData.scAmountApproved = +(
        globalSummaryData.value.scAmountApproved || 0
      );
      countData.scAmountNotApproved = +(
        globalSummaryData.value.scAmountNotApproved || 0
      );
    }

    return countData;
  });

  function summary({ data }: Record<string, any>) {
    return [
      {
        amtIncurred: numberCurrency(summaryData.value.amtIncurred),
        discOnAmtInc: numberCurrency(summaryData.value.discOnAmtInc),
        amtAfterDisc: numberCurrency(summaryData.value.amtAfterDisc),
        overCharged: numberCurrency(summaryData.value.overCharged),
        pcAmtApproved: numberCurrency(summaryData.value.pcAmtApproved),
        pcAmtNotApproved: numberCurrency(summaryData.value.pcAmtNotApproved),
        scAmountIncurred: numberCurrency(summaryData.value.scAmountIncurred),
        scAmountApproved: numberCurrency(summaryData.value.scAmountApproved),
        scAmountNotApproved: numberCurrency(
          summaryData.value.scAmountNotApproved
        ),
      },
    ];
  }

  async function sortChange(field: string, type: string) {
    if (type) {
      sort.sortType = type;
      sort.sortField = field;
    } else {
      sort.sortType = '';
      sort.sortField = '';
    }

    state.initData = await getInitData();
  }
  onMounted(async () => {
    state.id = (route.query.id || '') as string;
    state.initData = await getInitData();
  });
</script>

<style lang="less" scoped>
  .general-card {
    margin-bottom: 20px;

    h4 {
      font-size: 12px;
      padding: 10px 0;
      margin: 0;
    }

    .text {
      border: 1px solid #e9e9e9;
      padding: 10px;
      word-break: break-word;
      white-space: pre-wrap;
      background: #fcfcfc;
    }
  }

  :deep(.arco-table-tr-summary) {
    font-weight: bold;
  }
</style>
