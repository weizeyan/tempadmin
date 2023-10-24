<template>
  <a-card class="general-card">
    <QueryForm
      ref="$queryForm"
      v-model="state.fields"
      :label-col-props="{ span: 8 }"
      :wrapper-col-props="{ span: 16 }"
      :col-span="6"
      @query="submit"
    >
    </QueryForm>
    <a-divider style="margin-top: 0" />
    <a-row style="margin-bottom: 16px">
      <a-col :span="12">
        <a-space>
          <a-button type="primary" @click="createAppointment"
            >新建预约</a-button
          >
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
      row-key="appointmentNo"
      :loading="loading"
      :pagination="pagination"
      :columns="columns"
      :data="renderData"
      :bordered="false"
      size="medium"
      :scroll="{ x: 2200, y: 400 }"
      @sorter-change="sortChange"
      @page-size-change="(pageSize: number) => { pagination.current = 1; pagination.pageSize = pageSize; search(); }"
      @page-change="(current: number) => { pagination.current = current; search(); }"
    >
      <template #index="{ rowIndex }">
        {{ rowIndex + 1 + (pagination.current - 1) * pagination.pageSize }}
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
      <template #action="{ record }">
        <a-button
          v-if="record.processingStatus !== '3'"
          type="primary"
          @click="
            $router.push({
              name: 'MemberAppoinmentHandler',
              query: {
                id: data.memberControlNo,
                appointmentNo: record.appointmentNo,
                planCode: data.plan || '',
                corporateCode: data.corporateCode || '',
                ref: route.fullPath,
              },
            })
          "
          >编辑</a-button
        >

        <a-button
          type="outline"
          @click="
            $router.push({
              name: 'MemberAppoinmentPreview',
              query: {
                id: data.memberControlNo,
                appointmentNo: record.appointmentNo,
                planCode: data.plan || '',
                corporateCode: data.corporateCode || '',
              },
            })
          "
          >详情</a-button
        >
      </template>
    </a-table>
  </a-card>
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, onActivated } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { TableColumnData } from '@arco-design/web-vue';
  import { Field } from '@/components/query-form/index.vue';
  import useLoading from '@/hooks/loading';
  import { PAGE_SIZE_OPTIONS, DIRECT_PAYMENT_METHODS } from '@/utils/consts';
  import { appointmentList } from '@/api/member';
  import dayjs from 'dayjs';
  import { confirm } from '@/utils/dialog';

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
  const router = useRouter();
  const state = reactive({
    appointmentNo: '',
    fields: [
      {
        colSpan: 5,
        name: 'processingStatus',
        label: '处理状态',
        value: '',
        type: 'select',
        options: [
          {
            label: '全部',
            value: '',
          },
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
      },
      {
        colSpan: 9,
        labelColProps: {
          span: 5,
        },
        wrapperColProps: {
          span: 19,
        },
        name: 'createDate',
        label: '创建日期',
        type: 'range-picker',
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
        value: [],
      },
      {
        colSpan: 5,
        name: 'providerName',
        label: '就诊医院',
        value: '',
        type: 'input',
        maxLength: 100,
      },
      {
        colSpan: 5,
        name: 'appointmentNo',
        label: '预约编号',
        value: '',
        type: 'input',
      },
    ] as Field[],
  });
  // 分页列表
  const { loading, setLoading } = useLoading(true);
  const renderData = ref<any[]>([]);
  // 表单筛选器
  const $queryForm = ref();
  const formCache = ref<Record<string, any>>({});
  const selectedIds = ref<any[]>([]);
  const $table = ref();

  // 分页参数
  const pagination = reactive({
    current: 1,
    pageSize: 20,
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
      width: 150,
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
  ];

  /**
   * 查询列表操作
   */
  async function search() {
    setLoading(true);
    const params: Record<string, any> = {
      cardNo: props.data.cardNo,
      pageSize: pagination.pageSize,
      pageNum: pagination.current,
      sorts: sort.sortField
        ? [
            {
              name: sort.sortField,
              sort: sort.sortType === 'descend' ? 'DESC' : 'ASC',
            },
          ]
        : [],
      ...formCache.value,
      createDateStart: formCache.value.createDate.length
        ? formCache.value.createDate[0]
        : '',
      createDateEnd: formCache.value.createDate.length
        ? formCache.value.createDate[1]
        : '',
    };

    console.log('params', params);
    const json: any = await appointmentList(params);
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

  function submit() {
    pagination.current = 1;
    formCache.value = $queryForm.value.form;
    search();
  }

  async function createAppointment() {
    if (props.data.suspendStatus === 'S') {
      const rs = await confirm({
        content: '当前客户处于直付暂停状态，是否继续新建预约？',
      });
      if (!rs) {
        return;
      }
    }
    router.push({
      name: 'MemberAppoinmentBatch',
      query: {
        id: props.data.memberControlNo,
        planCode: props.data.plan || '',
        corporateCode: props.data.corporateCode || '',
        ref: route.fullPath,
      },
    });
  }
  function getField(name: string) {
    return state.fields.find((field) => {
      return field.name === name;
    }) as Field;
  }

  onMounted(() => {
    console.log('onMounted');
    state.appointmentNo = (route.query.appointmentNo || '') as string;
    getField('appointmentNo').value = state.appointmentNo;
    submit();
  });
  onActivated(() => {
    console.log('onActivated');
    search();
  });
</script>

<style scoped lang="less" src="@/assets/style/list.less"></style>
