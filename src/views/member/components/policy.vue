<template>
  <a-card class="general-card" title="Related Plans">
    <a-table
      v-if="state.relatedInitData"
      ref="$table"
      :loading="loading"
      row-key="id"
      :bordered="false"
      :columns="columns"
      :data="state.relatedInitData.list"
      size="medium"
      :pagination="false"
      @sorter-change="sortChange"
    >
      <template #tr="{ record }">
        <tr
          :class="{
            'status-red': record.status === 'N' || record.status === 'T',
          }"
        ></tr>
      </template>
      <template #isCurrent="{ record }">
        {{ record.isCurrent === '1' ? 'Y' : 'N' }}
      </template>
      <template #cardNo="{ record }">
        <template v-if="record.isCurrent === '1'">
          {{ record.cardNo }}
        </template>
        <template v-else>
          <router-link
            :to="{
              name: 'MemberView',
              query: {
                id: record.memberControlNo,
                planCode: record.planCode || '',
                corporateCode: record.corporateCode || '',
              },
            }"
          >
            {{ record.cardNo }}
          </router-link>
        </template>
      </template>
      <template #dueDate="{ record }">
        <div
          v-if="record.dueDate"
          :class="{
            'b-status-orange': record.dueDateFlag === 'orange',
            'b-status-red': record.dueDateFlag === 'red',
          }"
        >
          {{ record.dueDate }}
          <template v-if="record.dueDateFlag === 'red'">
            <a-tooltip
              v-if="record.graceFlag === 'Y'"
              :content="record.notifyMsg"
              ><icon-question-circle />(宽限期内)</a-tooltip
            >
            <template v-if="record.graceFlag === 'N'"> (已过宽限期) </template>
          </template>
        </div>
      </template>
      <template #enrollmentType="{ record }">
        <template v-if="record.enrollmentType === '1'">新保</template>
        <template v-if="record.enrollmentType === '2'">转保</template>
        <template v-if="record.enrollmentType === '3'">续保</template>
      </template>
      <template #status="{ record }">
        <span :class="{ 'b-status-red': record.status === 'pending' }">
          {{ record.statusDesc }}
        </span>
      </template>
    </a-table>
  </a-card>
  <a-row :gutter="20">
    <a-col :span="12">
      <a-card class="general-card" title="Special Terms">
        <template v-if="state.policyRemarkInitData">
          <h4>Member Remarks</h4>
          <div
            class="text"
            v-html="state.policyRemarkInitData.memberRemark"
          ></div>
          <h4>Plan Remarks</h4>
          <div
            class="text"
            v-html="state.policyRemarkInitData.planRemark"
          ></div>
          <h4>Endorsement</h4>
          <div
            class="text"
            v-html="state.policyRemarkInitData.endorsementRemark"
          ></div>
        </template>
      </a-card>
      <a-card class="general-card" title="Policy information">
        <a-descriptions
          :data="policyFields"
          bordered
          layout="vertical"
        ></a-descriptions>
      </a-card>
    </a-col>
    <a-col :span="12">
      <template v-if="state.policyDocInitData">
        <a-card class="general-card" title="Plan Documents">
          <a-table
            ref="$documentTable"
            row-key="id"
            :bordered="false"
            :columns="docColumns"
            :data="state.policyDocInitData.list.filter((item: Record<string, any>) => {return item.planDocType !== '-1'})"
            size="medium"
            :pagination="false"
          >
            <template #fileName="{ record }">
              <a href="#" @click.prevent="preview(record)">
                {{ record.fileName }}
              </a>
            </template>
          </a-table>
        </a-card>

        <a-card class="general-card" title="Product Documents">
          <a-table
            ref="$documentTable"
            row-key="id"
            :bordered="false"
            :columns="docColumns"
            :data="state.policyDocInitData.list.filter((item: Record<string, any>) => {return item.planDocType === '-1'})"
            size="medium"
            :pagination="false"
          >
            <template #fileName="{ record }">
              <a href="#" @click.prevent="preview(record)">
                {{ record.fileName }}
              </a>
            </template>
          </a-table>
        </a-card>
      </template>
    </a-col>
  </a-row>
</template>

<script lang="ts" setup>
  import { DescData, TableColumnData } from '@arco-design/web-vue';
  import { onMounted, ref, reactive, computed } from 'vue';
  import {
    policyInfo,
    relatedList,
    policyDoc,
    policyRemark,
    downloadDocument,
  } from '@/api/member';
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

  const state = reactive({
    policyInfoInitData: null as Record<string, any> | null,
    policyDocInitData: null as Record<string, any> | null,
    policyRemarkInitData: null as Record<string, any> | null,
    relatedInitData: null as Record<string, any> | null,
  });
  const { loading, setLoading } = useLoading(false);
  // 排序参数
  const sort = reactive({
    sortField: '',
    sortType: '',
  });

  const $table = ref();
  const $documentTable = ref();
  const columns: TableColumnData[] = [
    {
      title: 'Selected',
      dataIndex: 'isCurrent',
      slotName: 'isCurrent',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 100,
      fixed: 'left',
    },
    {
      title: 'Enrollment Type ',
      dataIndex: 'enrollmentType',
      slotName: 'enrollmentType',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 130,
      fixed: 'left',
    },
    {
      title: 'Corporate',
      dataIndex: 'corporateName',
      slotName: 'corporateName',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      fixed: 'left',
      width: 200,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Plan code',
      dataIndex: 'planCode',
      slotName: 'planCode',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      fixed: 'left',
      width: 250,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: 'Card No',
      dataIndex: 'cardNo',
      slotName: 'cardNo',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      fixed: 'left',
      width: 180,
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      slotName: 'startDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      slotName: 'endDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'Termination Date',
      dataIndex: 'terminationDate',
      slotName: 'terminationDate',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: 'Payment Effective Date',
      dataIndex: 'dueDate',
      slotName: 'dueDate',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      slotName: 'status',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 100,
    },
  ];

  const policyFields = computed<DescData[]>(() => {
    const data = state.policyInfoInitData;
    return data
      ? [
          {
            label: 'Plan',
            value: data.plan,
          },
          {
            label: 'Payor Name',
            value: data.payorName,
          },
          {
            label: 'Corporate',
            value: data.corporate,
          },
          {
            label: 'Corporate Active',
            value: data.corporateActive,
          },
          {
            label: 'Corporate Termination Date',
            value: data.corporateTerminationDate,
          },
        ]
      : [];
  });
  const docColumns: TableColumnData[] = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      slotName: 'fileName',
      fixed: 'left',
      width: 250,
    },
    {
      title: 'Plan Doc Type',
      dataIndex: 'planDocTypeDesc',
      slotName: 'planDocTypeDesc',
      width: 200,
    },
    {
      title: 'Update Date',
      dataIndex: 'updateDate',
      slotName: 'updateDate',
      width: 150,
    },
    {
      title: 'Remark',
      dataIndex: 'remark',
      slotName: 'remark',
      width: 150,
    },
  ];

  function getCurrentPlan() {
    return state.relatedInitData
      ? state.relatedInitData.list.find((item: Record<string, any>) => {
          return (
            item.corporateCode === props.data.corporateCode &&
            item.planCode === props.data.plan
          );
        })
      : null;
  }

  async function getPolicyInfoInitData() {
    if (!state.relatedInitData) {
      return null;
    }
    const plan = getCurrentPlan();
    if (!plan) {
      return null;
    }
    const json: any = await policyInfo({
      corpCode: plan.corporateCode,
      planCode: plan.planCode,
      memberControlNo: props.data.memberControlNo,
    }).catch(() => false);
    return json ? json.data : null;
  }
  async function getPolicyDocInitData() {
    if (!state.relatedInitData) {
      return null;
    }
    const plan = getCurrentPlan();
    if (!plan) {
      return null;
    }
    const json: any = await policyDoc({
      corpCode: plan.corporateCode,
      planCode: plan.planCode,
      memberControlNo: props.data.memberControlNo,
    }).catch(() => false);
    return json ? json.data : null;
  }

  async function getPolicyRemarkInitData() {
    if (!state.relatedInitData) {
      return null;
    }
    const plan = getCurrentPlan();
    if (!plan) {
      return null;
    }
    const json: any = await policyRemark({
      corpCode: plan.corporateCode,
      planCode: plan.planCode,
      memberControlNo: props.data.memberControlNo,
    }).catch(() => false);
    return json ? json.data : null;
  }

  async function getRelatedInitData() {
    setLoading(true);
    const json: any = await relatedList({
      ...props.data,
      sorts: sort.sortField
        ? [
            {
              name: sort.sortField,
              sort: sort.sortType === 'descend' ? 'DESC' : 'ASC',
            },
          ]
        : [],
      pageNum: 1,
      pageSize: 9999,
    }).catch(() => false);
    setLoading(false);
    return json ? json.data : null;
  }

  async function sortChange(field: string, type: string) {
    if (type) {
      sort.sortType = type;
      sort.sortField = field;
    } else {
      sort.sortType = '';
      sort.sortField = '';
    }

    state.relatedInitData = await getRelatedInitData();
  }

  function preview(item: Record<string, any>) {
    const params = getDownloadParams(item);
    const fileUrl = `${
      import.meta.env.VITE_API_BASE_URL
    }/document/file/getDocument?cardNo=${params.cardNo}&planCode=${
      params.planCode
    }&corporateCode=${params.corporateCode}&claimsType=${
      params.claimsType
    }&fileName=${params.fileName}`;
    const pdfViewUrl = `${
      import.meta.env.VITE_PDF_SERVER
    }/web/viewer.html?file=${encodeURIComponent(fileUrl)}`;
    const openUrl =
      item.fileName.toLowerCase().indexOf('.pdf') === -1 ? fileUrl : pdfViewUrl;
    window.open(openUrl);
  }
  function getDownloadParams(item: Record<string, any>): Record<string, any> {
    return {
      cardNo: props.data.cardNo,
      claimsType: item.planDocTypeDesc === 'PRODUCT' ? 'Product' : 'Policy',
      corporateCode: state.policyInfoInitData?.corporateCode,
      planCode: state.policyInfoInitData?.plan,
      fileName: encodeURIComponent(item.fileName),
    };
  }
  onMounted(async () => {
    state.relatedInitData = await getRelatedInitData();
    const [policyInfoInitData, policyDocInitData, policyRemarkInitData] =
      await Promise.all([
        getPolicyInfoInitData(),
        getPolicyDocInitData(),
        getPolicyRemarkInitData(),
      ]);
    state.policyInfoInitData = policyInfoInitData;
    state.policyDocInitData = policyDocInitData;
    state.policyRemarkInitData = policyRemarkInitData;
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
</style>
