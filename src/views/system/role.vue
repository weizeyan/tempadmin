<template>
  <div class="container">
    <a-card class="general-card" title="角色列表">
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
            <a-button
              type="primary"
              @click="
                () => {
                  $router.push({ name: 'SystemRoleDetail' });
                }
              "
            >
              <template #icon>
                <icon-plus />
              </template>
              新建
            </a-button>
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
        row-key="id"
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
        @sorter-change="sortChange"
        @page-size-change="(pageSize: number) => { pagination.current = 1; pagination.pageSize = pageSize; search(); }"
        @page-change="(current: number) => { pagination.current = current; search(); }"
        @selection-change="(rowKeys: any[]) => { selectedIds = rowKeys }"
      >
        <template #operations="{ record }">
          <a-button
            type="primary"
            size="small"
            @click="
              () => {
                $router.push({
                  name: 'SystemRoleDetail',
                  query: { id: record.id },
                });
              }
            "
            >编辑</a-button
          >
          <a-button
            v-if="record.deleteFlag === 'N'"
            type="primary"
            size="small"
            status="danger"
            @click="deleteRole([record.id])"
            >删除</a-button
          >
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, watch, onMounted, onActivated } from 'vue';
  import { confirm } from '@/utils/dialog';
  import useLoading from '@/hooks/loading';
  import { list, del } from '@/api/system-config/role';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { Field } from '@/components/query-form/index.vue';

  const state = reactive({
    fields: [
      {
        name: 'name',
        label: '角色名称',
        type: 'input',
        value: '',
      },
      {
        name: 'code',
        label: '角色编码',
        type: 'input',
        value: '',
      },
    ] as Field[],
    addDialog: {
      state: false,
      id: '' as string | number,
      fields: [] as Field[],
    },
  });

  const { loading, setLoading } = useLoading(true);
  const renderData = ref<any[]>([]);
  const formCache = ref<Record<string, any>>({});
  const selectedIds = ref<any[]>([]);
  const $queryForm = ref();
  const $table = ref();

  // 分页参数
  const pagination = reactive({
    current: 1,
    pageSize: 20,
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
      title: 'ID',
      dataIndex: 'id',
      slotName: 'id',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
      fixed: 'left',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
      slotName: 'name',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
    },
    {
      title: '角色编码',
      dataIndex: 'code',
      slotName: 'code',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 150,
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
      dataIndex: 'operations',
      slotName: 'operations',
      width: 250,
      fixed: 'right',
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

    console.log('params', params);
    const json: any = await list(params).catch(() => false);
    setLoading(false);
    if (!json) {
      return;
    }
    renderData.value = json.data.list;
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

  /**
   * 设置状态操作
   */
  async function deleteRole(ids: any[]) {
    // async confirm
    const rs = await confirm({
      content: '确认删除?',
      remote: async () => {
        return !!(await del({ id: ids[0] }).catch(() => {
          return false;
        }));
      },
    });
    if (!rs) {
      return;
    }
    // const isDeleteMode = formCache.value.status ? status !== formCache.value.status : false;
    const isDeleteMode = true;
    // 删除逻辑，重新计算分页
    if (isDeleteMode) {
      const page =
        ids.length === renderData.value.length
          ? pagination.current - 1 || 1
          : pagination.current;
      pagination.current = page;
    }
    // 刷新分页
    search();
  }

  function submit() {
    pagination.current = 1;
    formCache.value = $queryForm.value.form;
    search();
  }

  onActivated(() => {
    search();
  });
</script>

<script lang="ts">
  export default {
    name: 'SystemRoleList',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
