<template>
  <div class="container">
    <a-card class="general-card" title="Corporate">
      <QueryForm
        ref="$queryForm"
        v-model="state.fields"
        ok-button-text="Search"
        reset-button-text="Reset"
        :col-span="24"
        :horizontal-main-col-style="{ width: '400px' }"
        horizontal-main-col-flex="none"
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
              <a-button type="outline" @click="exportResult(selectedIds)">
                <template #icon>
                  <icon-cloud-download />
                </template>
                导出选中项
              </a-button>
            </template>
            <a-button type="primary" @click="exportResult()">
              <template #icon>
                <icon-cloud-download />
              </template>
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
        v-model:selected-keys="selectedIds"
        row-key="id"
        :loading="loading"
        :pagination="pagination"
        :columns="state.columns"
        :data="renderData"
        :bordered="false"
        size="medium"
        :scroll="{ x: 2500, y: 400 }"
        :row-selection="{
          type: 'checkbox',
          showCheckedAll: true,
        }"
        @sorter-change="sortChange"
        @page-size-change="(pageSize: number) => { pagination.current = 1; pagination.pageSize = pageSize; search(); }"
        @page-change="(current: number) => { pagination.current = current; search(); }"
      >
        <template #tr="{ record }">
          <tr
            :class="{ 'status-red': record.policyStatus.toLowerCase() !== 'y' }"
          ></tr>
        </template>

        <template #dob="{ record }">
          {{ smallDateFormat(record.dob) }}
        </template>
        <template #policyStatus="{ record }">
          <span
            :class="{
              'b-status-green': record.policyStatus === 'Y',
            }"
            >{{ record.policyStatus }}</span
          >
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
        <template #nricType="{ record }">
          {{ record.nricTypeDesc }}
        </template>

        <template #sex="{ record }">
          {{ record.sex }}
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
  import { list, searchCorporateList } from '@/api/member';
  import { exportWithCorporate } from '@/api/reports';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { Field } from '@/components/query-form/index.vue';
  import { useRouter } from 'vue-router';
  import { downloadFile, smallDateFormat, uuid } from '@/utils';
  import { PAGE_SIZE_OPTIONS } from '@/utils/consts';

  const router = useRouter();
  const cardNoPrepend = ref('8000-1459');
  const state = reactive({
    btnClick: false,
    fields: [
      {
        name: 'corporate',
        label: 'Corporate',
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
    ] as Field[],
    columns: [
      {
        title: 'Name',
        dataIndex: 'name',
        slotName: 'name',
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
        title: 'Policy Status',
        dataIndex: 'policyStatus',
        slotName: 'policyStatus',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
        fixed: 'left',
      },

      {
        title: 'Card No',
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
        title: 'Corporate Name',
        dataIndex: 'corporateName',
        slotName: 'corporateName',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: 'Plan',
        dataIndex: 'plan',
        slotName: 'plan',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
        ellipsis: true,
        tooltip: true,
      },

      {
        title: 'Plan Start Date',
        dataIndex: 'planStartDate',
        slotName: 'planStartDate',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 180,
      },
      {
        title: 'Plan End Date',
        dataIndex: 'planEndDate',
        slotName: 'planEndDate',
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
        width: 180,
      },

      {
        title: 'P/D',
        dataIndex: 'pd',
        slotName: 'pd',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 80,
      },
      {
        title: 'Sex',
        dataIndex: 'sex',
        slotName: 'sex',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 80,
      },
      {
        title: 'Date Of Birth',
        dataIndex: 'dob',
        slotName: 'dob',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
      },
      {
        title: 'NRIC No',
        dataIndex: 'nricNo',
        slotName: 'nricNo',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: 'NRIC Type',
        dataIndex: 'nricType',
        slotName: 'nricType',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 150,
        ellipsis: true,
        tooltip: true,
      },
      {
        title: 'Mobile',
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
        title: 'Email',
        dataIndex: 'email',
        slotName: 'email',
        sortable: {
          sorter: true,
          sortDirections: ['descend', 'ascend'],
        },
        width: 200,
        ellipsis: true,
        tooltip: true,
      },
    ] as TableColumnData[],
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
    if (!params.icNo) {
      delete params.icNo;
    }
    if (!params.dob) {
      delete params.dob;
    }
    if (!params.claimId) {
      delete params.claimId;
    }
    if (!params.iclaimId) {
      delete params.iclaimId;
    }
    if (!params.mobile) {
      delete params.mobile;
    }
    if (!params.corporate) {
      delete params.corporate;
    }

    console.log('params', params);
    const json: any = await list(params).catch(() => false);
    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data.list.map((item: Record<string, any>) => {
      return {
        ...item,
        id: uuid(),
      };
    });
    pagination.total = json.data.total;
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

  function submit() {
    state.btnClick = true;
    console.log('submit');
    pagination.current = 1;
    formCache.value = $queryForm.value.form;
    search();
  }

  async function exportResult(ids: any[] = []) {
    const params: Record<string, any> = {
      ...formCache.value,
      members: [],
    };
    if (ids.length) {
      params.members = ids.map((id: string) => {
        return renderData.value.find((item) => {
          return item.id === id;
        }) as Record<string, any>;
      });
    }

    console.log('exportResult', ids, params);
    const res: any = await exportWithCorporate(params).catch(() => false);
    if (!res) {
      return;
    }
    const fileName = res.headers['content-disposition']
      ? decodeURIComponent(
          res.headers['content-disposition'].replace(/\w+;filename=(.*)/, '$1')
        )
      : 'download.xlsx';
    downloadFile(res.data, fileName);
  }
  onMounted(() => {});

  onActivated(() => {
    if (!state.btnClick) {
      return;
    }
    search();
  });
</script>

<script lang="ts">
  export default {
    name: 'ReportsCorporate',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
