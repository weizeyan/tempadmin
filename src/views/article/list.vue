<template>
  <div class="container">
    <a-card class="general-card" title="文章列表">
      <QueryForm ref="$queryForm" v-model="state.fields" @query="() => { submit(); }">
      </QueryForm>
      <a-divider style="margin-top: 0" />
      <a-row style="margin-bottom: 16px">
        <a-col :span="12">
          <a-space>
            <a-button type="primary">
              <template #icon>
                <icon-plus />
              </template>
              新建
            </a-button>
            <template v-if="selectedIds.length">
              <a-button type="primary" @click="() => { setStatus(selectedIds, 'online') }">
                批量上线
              </a-button>
              <a-button type="primary" @click="() => { setStatus(selectedIds, 'offline') }">
                批量下线
              </a-button>
            </template>

          </a-space>
        </a-col>
        <a-col :span="12" style="display: flex; align-items: center; justify-content: end">
          <a-tooltip content="刷新">
            <div class="action-icon" @click="search()"><icon-refresh size="18" /></div>
          </a-tooltip>
        </a-col>
      </a-row>
      <a-table row-key="id" :row-selection="{ onlyCurrent: true, showCheckedAll: true, type: 'checkbox' }"
        :loading="loading" :pagination="pagination" :columns="(cloneColumns as TableColumnData[])" :data="renderData"
        :bordered="false" size="medium" @sorter-change="sortChange"
        @page-size-change="(pageSize: number) => { pagination.current = 1; pagination.pageSize = pageSize; search(); }"
        @page-change="(current: number) => { pagination.current = current; search(); }"
        @selection-change="(rowKeys: any[]) => { selectedIds = rowKeys }">

        <template #status="{ record }">
          <span v-if="record.status === 'offline'" class="circle"></span>
          <span v-else class="circle pass"></span>
          {{ record.status == 'online' ? '已上线' : '已下线' }}
        </template>
        <template #operations="{ record }">
          <a-button v-permission="['admin']" type="text" size="small">
            查看
          </a-button>
          <a-button v-if="record.status === 'offline'" v-permission="['admin']" type="text" size="small"
            @click="() => { setStatus([record.id], 'online') }">
            上线
          </a-button>
          <a-button v-if="record.status == 'online'" v-permission="['admin']" type="text" size="small"
            @click="() => { setStatus([record.id], 'offline') }">
            下线
          </a-button>

        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, watch, onMounted } from 'vue';
import useLoading from '@/hooks/loading';
import { queryPolicyList, PolicyRecord } from '@/api/list';
import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
import cloneDeep from 'lodash/cloneDeep';
import { Field } from '@/components/query-form/index.vue';

const state = reactive({
  fields: [
    {
      name: 'name',
      label: 'input',
      type: 'input',
      value: ''
    },
    {
      name: 'userId',
      label: 'remote-select',
      type: 'select',
      value: '',
      options: [
      ],
      remote: (key: string) => {
        return new Promise((resolve) => {
          const list = key && key !== 'no' ? ['1', '2'].map((item, index) => {
            const label = `${key}-${item}`;
            const value = `${index + 1}`;
            return {
              label,
              value
            };
          }) : [];
          setTimeout(() => {
            resolve(list)
          }, 500);
        })
      },

    },

    {
      name: 'date',
      label: 'date-picker',
      type: 'date-picker',
      value: ''
    },
    {
      name: 'createTime',
      label: 'range-picker',
      type: 'range-picker',
      value: []
    },
    {
      name: 'sex',
      label: 'radio',
      type: 'radio',
      value: '1',
      options: [

        {
          label: '男',
          value: '1',
        },
        {
          label: '女',
          value: '2',
        },
      ]
    },
    {
      name: 'sports',
      label: 'checkbox',
      type: 'checkbox',
      value: ['2', '3'],
      options: [

        {
          label: '足球',
          value: '1',
        },
        {
          label: '篮球',
          value: '2',
        },
        {
          label: '排球',
          value: '3',
        },
      ]
    },
    {
      name: 'status',
      label: 'select',
      type: 'select',
      value: '',
      options: [

        {
          label: '已上线',
          value: 'online',
        },
        {
          label: '已下线',
          value: 'offline',
        },
      ]
    }
  ] as Field[]
});

type Column = TableColumnData & { checked?: true };
const { loading, setLoading } = useLoading(true);
const renderData = ref<PolicyRecord[]>([]);
const formCache = ref();
const cloneColumns = ref<Column[]>([]);
const showColumns = ref<Column[]>([]);
const selectedIds = ref<any[]>([]);
const $queryForm = ref();

// 分页参数
const pagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showTotal: true,
  showJumper: true,
  showPageSize: true
});

// 排序参数
const sort = reactive({
  sortField: '',
  sortType: ''
});
const columns = computed<TableColumnData[]>(() => [
  {
    title: '集合编号',
    dataIndex: 'number',
    slotName: 'number',
    sortable: {
      sorter: true,
      sortDirections: ['descend', 'ascend']
    }
  },
  {
    title: '集合名称',
    dataIndex: 'name',
    slotName: 'name',
    sortable: {
      sorter: true,
      sortDirections: ['descend', 'ascend']
    }
  },
  {
    title: '状态',
    dataIndex: 'status',
    slotName: 'status',
  },
  {
    title: '操作',
    dataIndex: 'operations',
    slotName: 'operations',
  },
]);



/**
 * 查询列表操作
*/
async function search() {
  setLoading(true);
  const params = {
    pageSize: pagination.pageSize,
    current: pagination.current,
    ...formCache.value,
    sort: sort.sortField ? [
      {
        name: sort.sortField,
        sort: sort.sortType
      }
    ] : []
  };
  console.log('params', params);
  const json = await queryPolicyList(params);
  setLoading(false);
  if (!json) {
    return;
  }
  const { list, total } = json.data;
  renderData.value = list;
  pagination.total = total;
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
    sort.sortField = ''
  }
  search();

}
/**
 * 设置状态操作
*/
function setStatus(ids: any[], status: string) {
  const isDeleteMode = formCache.value.status ? status !== formCache.value.status : false;
  // console.log('isDeleteMode', isDeleteMode, 'ids', ids);
  // 删除逻辑，重新计算分页
  if (isDeleteMode) {
    const page = ids.length === renderData.value.length ? pagination.current - 1 || 1 : pagination.current;
    // console.log('page', page);
    pagination.current = page;
  }
  // 刷新分页
  search();
}


function submit() {
  formCache.value = $queryForm.value.form;
  search();
}

onMounted(() => {
  submit();
});

watch(
  () => columns.value,
  (val) => {
    cloneColumns.value = cloneDeep(val);
    cloneColumns.value.forEach((item, index) => {
      item.checked = true;
    });
    showColumns.value = cloneDeep(cloneColumns.value);
  },
  { deep: true, immediate: true }
);
</script>

<script lang="ts">
export default {
  name: 'ArticleList'
}
</script>

<style scoped lang="less">
.container {
  padding: 0 20px 20px 20px;
}

:deep(.arco-table-th) {
  &:last-child {
    .arco-table-th-item-title {
      margin-left: 16px;
    }
  }
}

.action-icon {
  cursor: pointer;
}
</style>
