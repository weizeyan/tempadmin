<template>
  <div class="container">
    <a-card class="general-card" title="用户列表">
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
                  initAddDialog();
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
        row-key="userId"
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
        <template #bindFsFlag="{ record }">
          {{ record.bindFsFlag ? '已绑定' : '未绑定' }}
        </template>
        <template #status="{ record }">
          {{ record.status === '0' ? '正常' : '禁用' }}
        </template>
        <template #isAdmin="{ record }">
          {{ record.isAdmin ? '是' : '否' }}
        </template>
        <template #operations="{ record }">
          <a-button
            type="primary"
            size="small"
            @click="
              () => {
                initAddDialog(record.userId);
              }
            "
            >编辑</a-button
          >
          <a-button
            type="primary"
            size="small"
            @click="
              () => {
                initRoleDialog(record.userId);
              }
            "
            >设置角色</a-button
          >
          <template v-if="user.isAdmin">
            <a-button
              v-if="!record.isAdmin"
              type="primary"
              size="small"
              @click="
                () => {
                  setAdminStatus([record.userId], 'Y');
                }
              "
              >设为管理员</a-button
            >
            <a-button
              v-if="record.isAdmin"
              type="primary"
              size="small"
              status="danger"
              @click="
                () => {
                  setAdminStatus([record.userId], 'N');
                }
              "
              >取消管理员</a-button
            >
          </template>

          <a-button
            v-if="record.status === '0'"
            type="primary"
            size="small"
            status="danger"
            @click="setStatus([record.userId], '1')"
            >禁用</a-button
          >
          <a-button
            v-if="record.status === '1'"
            type="primary"
            size="small"
            @click="setStatus([record.userId], '0')"
            >启用</a-button
          >
          <a-button
            v-if="!record.bindFsFlag"
            type="primary"
            size="small"
            @click="setBindFeishuStatus([record.userId], '2')"
            >绑定飞书</a-button
          >
          <a-button
            v-if="record.bindFsFlag"
            type="primary"
            size="small"
            status="danger"
            @click="setBindFeishuStatus([record.userId], '0')"
            >解绑飞书</a-button
          >
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:visible="state.addDialog.state"
      :title="state.addDialog.id ? '编辑' : '新增'"
      :mask-closable="false"
      :esc-to-close="false"
      :on-before-ok="
        () => {
          return $addForm.query();
        }
      "
    >
      <div>
        <QueryForm
          v-if="state.addDialog.state"
          ref="$addForm"
          v-model="state.addDialog.fields"
          :form-type="2"
          :col-span="24"
          label-align="right"
          direction="vertical"
          :show-button-bar="false"
          :save="saveData"
        >
        </QueryForm>
      </div>
    </a-modal>

    <a-modal
      v-model:visible="state.roleDialog.state"
      title="设置用户角色"
      :mask-closable="false"
      :esc-to-close="false"
      :on-before-ok="
        () => {
          return $roleForm.query();
        }
      "
    >
      <div>
        <QueryForm
          v-if="state.roleDialog.state"
          ref="$roleForm"
          v-model="state.roleDialog.fields"
          :form-type="2"
          label-align="right"
          direction="vertical"
          :show-button-bar="false"
          :save="saveUserRole"
        >
        </QueryForm>
      </div>
    </a-modal>

    <FeishuUserDialog
      v-model="state.feishuDialog.state"
      @on-ok="onFeishuDialogOK"
    />
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, reactive, onMounted, onActivated } from 'vue';
  import { confirm } from '@/utils/dialog';
  import useLoading from '@/hooks/loading';
  import {
    list,
    detail,
    save,
    bindFeiShu,
    editRole,
    getRoleList,
    setAdmin,
  } from '@/api/system-config/user';
  import { all, list as queryRoleList } from '@/api/system-config/role';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { Field } from '@/components/query-form/index.vue';
  import { useUserStore } from '@/store';
  import FeishuUserDialog from '@/components/feishu-user-dialog/index.vue';

  const state = reactive({
    fields: [] as Field[],
    addDialog: {
      state: false,
      id: '' as string | number,
      fields: [] as Field[],
    },
    roleDialog: {
      state: false,
      id: '' as string | number,
      fields: [] as Field[],
    },
    allRoleListPromise: null as Promise<Record<string, any>[]> | null,
    feishuDialog: {
      state: false,
      fsIds: [] as string[],
      userIds: [] as number[],
    },
  });
  const userStore = useUserStore();
  const user = computed(() => {
    return userStore.user;
  });

  const { loading, setLoading } = useLoading(true);
  const renderData = ref<any[]>([]);
  const formCache = ref<Record<string, any>>({});
  const selectedIds = ref<any[]>([]);
  const $queryForm = ref();
  const $addForm = ref();
  const $roleForm = ref();
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
      dataIndex: 'userId',
      slotName: 'userId',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 60,
      fixed: 'left',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      slotName: 'username',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 120,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '手机号',
      dataIndex: 'mobile',
      slotName: 'mobile',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 140,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      slotName: 'email',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 240,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      slotName: 'name',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 140,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '角色',
      dataIndex: 'roleNames',
      slotName: 'roleNames',
      width: 150,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '是否管理员',
      dataIndex: 'isAdmin',
      slotName: 'isAdmin',
      width: 120,
      ellipsis: true,
      tooltip: true,
    },
    {
      title: '区号',
      dataIndex: 'areaCode',
      slotName: 'areaCode',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 100,
    },
    {
      title: '飞书绑定状态',
      dataIndex: 'bindFsFlag',
      slotName: 'bindFsFlag',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      slotName: 'status',
      sortable: {
        sorter: true,
        sortDirections: ['descend', 'ascend'],
      },
      width: 100,
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
      width: 550,
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
      status: formCache.value.status ? [formCache.value.status] : [],
      sorts: sort.sortField
        ? [
            {
              name: sort.sortField === 'userId' ? 'id' : sort.sortField,
              sort: sort.sortType === 'descend' ? 'DESC' : 'ASC',
            },
          ]
        : [],
    };
    params.bindFsFlag = formCache.value.bindFsFlag
      ? formCache.value.bindFsFlag === '1'
      : '';

    const json = await list(params);
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
  async function setStatus(ids: any[], status: string) {
    // async confirm
    const rs = await confirm({
      content: status === '1' ? '确认禁用?' : '确认启用?',
      remote: async () => {
        return !!(await save({ id: ids[0], status }).catch(() => {
          return false;
        }));
      },
    });

    if (!rs) {
      return;
    }

    const isDeleteMode = formCache.value.status
      ? status !== formCache.value.status
      : false;

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

  /**
   * 设置状态操作
   */
  async function setAdminStatus(ids: any[], status: string) {
    // async confirm
    const rs = await confirm({
      content: status === 'Y' ? '确认设置管理员?' : '确认取消管理员?',
      remote: async () => {
        return !!(await setAdmin({ userId: ids[0], adminFlag: status }).catch(
          () => {
            return false;
          }
        ));
      },
    });
    if (!rs) {
      return;
    }
    const isDeleteMode = formCache.value.status
      ? status !== formCache.value.status
      : false;
    // 删除逻辑，重新计算分页
    if (isDeleteMode) {
      const page =
        ids.length === renderData.value.length
          ? pagination.current - 1 || 1
          : pagination.current;
      // console.log('page', page);
      pagination.current = page;
    }
    // 刷新分页
    search();
  }

  const onFeishuDialogOK = (res: any) => {
    state.feishuDialog.fsIds = res.fsIds;
    setBindFeishuStatus(state.feishuDialog.userIds, '1');
  };

  async function setBindFeishuStatus(ids: any[], status: string) {
    let rs = false;

    if (status === '0') {
      rs = await confirm({
        content: '确认解绑飞书?',
        remote: async () => {
          return !!(await bindFeiShu({
            userId: ids[0],
            bindFlag: 'N',
          }).catch(() => {
            return false;
          }));
        },
      });
    }

    if (status === '1') {
      rs = !!(await bindFeiShu({
        userId: ids[0],
        bindFlag: 'Y',
        fsUserId: state.feishuDialog.fsIds[0],
      }).catch(() => {
        return false;
      }));
    }

    if (status === '2') {
      state.feishuDialog.state = true;
      state.feishuDialog.userIds = ids;
    }

    if (!rs) {
      return;
    }

    const isDeleteMode =
      formCache.value.bindFsFlag !== ''
        ? status !== formCache.value.status
        : false;
    // 删除逻辑，重新计算分页
    if (isDeleteMode) {
      const page =
        ids.length === renderData.value.length
          ? pagination.current - 1 || 1
          : pagination.current;
      // console.log('page', page);
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

  async function initAddDialog(id?: string | number) {
    state.addDialog.id = id || '';
    state.addDialog.state = true;
    state.addDialog.fields = await genFields(id);
  }

  /**
   * 表单保存
   */
  async function saveData(form: Record<string, any>): Promise<boolean> {
    console.log('save', form);
    if (state.addDialog.id) {
      form.id = state.addDialog.id;
    }
    const json = await save(form).catch(() => {
      return false;
    });
    if (!json) {
      return false;
    }
    search();
    return true;
  }

  /**
   * 创建动态表单字段
   */
  async function genFields(id?: string | number) {
    const data = id
      ? await detail({ id })
          .then((json) => {
            return json.data || null;
          })
          .catch(() => {
            return false;
          })
      : {
          username: '',
          name: '',
          mobile: '',
          email: '',
          areaCode: '',
        };
    if (!data) {
      return [];
    }
    const fields: Field[] = [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        rules: [
          {
            required: true,
            message: '请输入用户名',
          },
        ],
        value: data.username,
      },

      {
        name: 'password',
        label: '密码',
        type: 'input-password',
        value: '',
        rules: id
          ? []
          : [
              {
                required: true,
                message: '请输入密码',
              },
            ],
      },
      {
        name: 'mobile',
        label: '手机号',
        type: 'input',
        value: data.mobile,
      },
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        value: data.name,
      },
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        value: data.email,
      },

      {
        name: 'areaCode',
        label: '区号',
        type: 'input',
        value: data.areaCode,
      },
    ];
    return fields;
  }

  async function initRoleDialog(id?: string | number) {
    state.roleDialog.id = id || '';
    state.roleDialog.state = true;
    state.roleDialog.fields = await genRoleFields(id);
  }

  async function saveUserRole(form: Record<string, any>): Promise<boolean> {
    console.log('save', form);
    if (state.roleDialog.id) {
      form.userId = state.roleDialog.id;
    }
    const json = await editRole(form).catch(() => {
      return false;
    });
    if (!json) {
      return false;
    }
    search();
    return true;
  }
  async function getAllRoleList(): Promise<Record<string, any>[]> {
    const json: any = await all().catch(() => {
      return false;
    });
    if (!json) {
      return [];
    }
    return json.data || [];
  }

  async function genRoleFields(id?: string | number): Promise<Field[]> {
    const list = await state.allRoleListPromise;
    if (!list) {
      return [];
    }
    const options = list.map((item) => {
      return {
        label: item.name,
        value: item.code,
        origin: item,
      };
    });

    const data = id
      ? await getRoleList({ id })
          .then((json) => {
            return json.data || null;
          })
          .catch(() => {
            return false;
          })
      : {
          roles: [],
        };
    if (!data) {
      return [];
    }
    const fields: Field[] = [
      {
        name: 'roles',
        label: '用户角色',
        type: 'select',
        options,
        multiple: true,
        rules: [
          {
            required: true,
            message: '请选择角色',
          },
        ],
        value: data.roles || [],
      },
    ];
    return fields;
  }

  async function genQueryFormFields(): Promise<Field[]> {
    // const allRoleList: any[] = state.allRoleListPromise ? await state.allRoleListPromise : [];
    // const defaultRoleOptions = allRoleList.map((item: any) => {
    //   return {
    //     label: item.name,
    //     value: item.code
    //   }
    // });

    const list: Field[] = [
      {
        name: 'username',
        label: '用户名',
        type: 'input',
        value: '',
      },
      // {
      //   name: 'role',
      //   label: '角色',
      //   type: 'select',
      //   value: [],
      //   multiple: true,
      //   options: defaultRoleOptions,
      //   async remote(key: string) {
      //     const json: any = await queryRoleList({
      //       name: key,
      //       pageSize: 1000,
      //     }).catch(() => false);
      //     const list = (json ? json.data.list : []).map((item: any) => {
      //       return {
      //         label: item.name,
      //         value: item.code
      //       }
      //     });
      //     return list;
      //   }
      // },
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        value: '',
      },
      {
        name: 'mobile',
        label: '手机号',
        type: 'input',
        value: '',
      },
      /*
      {
        name: 'areaCode',
        label: '区号',
        type: 'input',
        value: '',
      },
      */
      {
        name: 'email',
        label: '邮箱',
        type: 'input',
        value: '',
      },
      {
        name: 'bindFsFlag',
        label: '飞书绑定状态',
        type: 'select',
        value: '',

        options: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '已绑定',
            value: '1',
          },
          {
            label: '未绑定',
            value: '0',
          },
        ],
      },
      {
        name: 'adminFlag',
        label: '是否管理员',
        type: 'select',
        value: '',

        options: [
          {
            label: '全部',
            value: '',
          },
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
        name: 'status',
        label: '状态',
        type: 'select',
        value: '',

        options: [
          {
            label: '全部',
            value: '',
          },
          {
            label: '正常',
            value: '0',
          },
          {
            label: '禁用',
            value: '1',
          },
        ],
      },
    ];
    return list;
  }

  onMounted(async () => {
    // 预加载所有角色列表
    state.allRoleListPromise = getAllRoleList();
    state.fields = await genQueryFormFields();
  });

  onActivated(async () => {
    search();
  });
</script>

<script lang="ts">
  export default {
    name: 'SystemUser',
  };
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
