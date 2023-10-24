<template>
  <div class="b-doctor">
    <div class="b-search">
      <form class="flex-center" @submit.prevent="submit">
        <a-input
          v-model="state.form.key"
          allow-clear
          placeholder="请输入医生姓名"
        >
          <template #prefix> <icon-search /> </template
        ></a-input>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </form>
    </div>
    <template v-if="state.initData">
      <a-table
        ref="$table"
        row-key="id"
        :loading="state.loading"
        :pagination="false"
        :columns="state.columns"
        :data="state.initData.list"
        :scroll="{ y: 400 }"
        :bordered="false"
        size="medium"
      >
        <template #tr="{ record }">
          <tr @click="itemClick(record)"></tr>
        </template>
        <template #id="{ record }">
          <a-radio
            v-model="state.selectId"
            :value="record.doctorId"
            @change="changeItem(record)"
          />
        </template>
        <template #empty>
          <div class="arco-empty">
            <icon-empty size="80" :style="{ color: 'rgba(0,0,0,0.5)' }" />
            <div class="text">暂无数据</div>
          </div>
        </template>
      </a-table>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, onActivated, reactive, watch } from 'vue';
  import type { TableColumnData } from '@arco-design/web-vue/es/table/interface';
  import { getDoctors } from '@/api/huadongHospital';

  const props = withDefaults(
    defineProps<{
      data: Record<string, any>;
    }>(),
    {
      data() {
        return {
          department: {
            deptId: '',
            deptName: '',
          },
        };
      },
    }
  );

  const emit = defineEmits<{
    (e: 'change', doctor: Record<string, any> | null): void;
  }>();

  const state = reactive({
    isFirst: false,
    initData: null as Record<string, any> | null,
    form: {
      key: '',
    },
    formCache: {} as Record<string, any>,
    selectId: '',
    loading: false,
    columns: [
      {
        title: '',
        dataIndex: 'id',
        slotName: 'id',
        width: 50,
      },
      {
        title: '医生姓名',
        dataIndex: 'doctorName',
        slotName: 'doctorName',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        title: '性别',
        dataIndex: 'sex',
        slotName: 'sex',
        ellipsis: true,
        tooltip: true,
        width: 100,
      },
      {
        title: '科室',
        dataIndex: 'deptName',
        slotName: 'deptName',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
      {
        title: '职称',
        dataIndex: 'title',
        slotName: 'title',
        ellipsis: true,
        tooltip: true,
        width: 200,
      },
    ] as TableColumnData[],
  });

  function submit() {
    clearSelect();
    state.formCache = JSON.parse(JSON.stringify(state.form));
    search();
  }

  async function search() {
    state.loading = true;
    state.initData = await getInitData();
    state.loading = false;
  }

  async function getInitData() {
    const json: any = await getDoctors({
      deptId: props.data.department.deptId,
      doctorName: state.formCache.key || '',
    }).catch(() => false);
    if (!json) {
      return null;
    }
    return {
      list: json.data || [],
    };
  }

  function itemClick(item: Record<string, any>) {
    state.selectId = item.doctorId;
    changeItem(item);
  }

  function changeItem(item: Record<string, any> | null) {
    console.log('changeItem', item);
    emit('change', item);
  }

  function clearSelect() {
    state.selectId = '';
    changeItem(null);
  }

  onActivated(async () => {
    console.log('onActivated doctor');
    if (state.isFirst) {
      return;
    }

    state.initData = await getInitData();
    state.isFirst = true;
  });
  watch(
    () => {
      return props.data.department.deptId;
    },
    (id, old) => {
      console.log('watch deptId', id, old);
      clearSelect();

      state.form.key = '';
      submit();
    }
  );
</script>

<script lang="ts">
  export default {
    name: 'Doctor',
  };
</script>

<style scoped lang="less">
  .b-doctor {
    width: 800px;
    margin: 0 auto;
    .b-search {
      width: 500px;
      margin: 0 auto 20px;
    }
  }
</style>
