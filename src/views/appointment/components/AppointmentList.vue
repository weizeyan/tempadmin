<template>
  <a-table
    row-key="appointmentNo"
    :columns="state.columns"
    :data="data"
    :bordered="false"
    size="medium"
    :pagination="pagination"
    :scroll="{ x: 1250, y: 400 }"
    @page-size-change="(pageSize: number) => { emit('page-size-change', pageSize) }"
    @page-change="(current: number) => { emit('page-change', current) }"
  >
    <template #index="{ rowIndex }">
      {{ rowIndex + 1 + (pagination.current - 1) * pagination.pageSize }}
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
    <template #appointmentNo="{ record }">
      <a href="#" @click.prevent="viewDetail(record)">{{
        record.appointmentNo
      }}</a>
    </template>

    <template #action="{ record }">
      <a-button type="primary" @click="viewDetail(record)">处理</a-button>
    </template>

    <template #empty>
      <div class="arco-empty">
        <icon-empty size="80" :style="{ color: 'rgba(0,0,0,0.5)' }" />
        <div class="text">暂无数据</div>
      </div>
    </template>
  </a-table>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { PAGE_SIZE_OPTIONS, POLICY_STATUS_MAP } from '@/utils/consts';
  import { curry } from 'lodash';
  const props = withDefaults(
    defineProps<{
      data: Record<string, any>[];
      pagination: any;
    }>(),
    {
      data() {
        return [];
      },
      pagination() {
        return {
          current: 1,
          pageSize: 10,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          total: 0,
          showTotal: true,
          showJumper: true,
          showPageSize: true,
        };
      },
    }
  );

  const emit = defineEmits<{
    (e: 'page-size-change', v: any): void;
    (e: 'page-change', v: any): void;
  }>();

  const router = useRouter();
  const state = reactive({
    columns: [
      {
        title: '序号',
        dataIndex: 'index',
        slotName: 'index',
        width: 100,
      },
      {
        title: '预约编号',
        dataIndex: 'appointmentNo',
        slotName: 'appointmentNo',

        ellipsis: true,
        tooltip: true,
        width: 150,
      },
      {
        title: '预约医院',
        dataIndex: 'hospital',
        slotName: 'hospital',

        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        title: '处理状态',
        dataIndex: 'processingStatus',
        slotName: 'processingStatus',
        width: 150,
      },
      {
        title: '保单状态',
        dataIndex: 'activeFlag',
        slotName: 'activeFlag',

        width: 150,
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

        width: 200,
      },

      {
        title: '操作',
        dataIndex: 'action',
        slotName: 'action',
        width: 100,
      },
    ] as TableColumnData[],
  });

  function viewDetail(record: Record<string, any>) {
    const query = {
      id: record.memberControlNo || '',
      planCode: record.planCode || '',
      corporateCode: record.corpCode || '',
      appointmentNo: record.appointmentNo || '',
    };
    router.push({
      name: 'MemberAppoinmentHandler',
      query,
    });
  }
</script>
