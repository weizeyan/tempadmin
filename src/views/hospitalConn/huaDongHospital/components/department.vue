<template>
  <div class="b-department flex-center">
    <div class="sider">
      <div v-if="state.mainDepartmentData" class="b-search-bar">
        <form class="flex-center">
          <a-input
            v-model="state.form.key"
            allow-clear
            @input="submit"
            @clear="submit"
          >
            <template #prefix> <icon-search /> </template
          ></a-input>
        </form>
      </div>
      <a-scrollbar
        style="
          height: 546px;
          box-sizing: border-box;
          padding: 20px 0;
          overflow: auto;
        "
      >
        <div v-if="state.mainDepartmentData" class="list">
          <div
            v-for="(item, index) in state.searchList"
            :key="index"
            class="item"
            :class="{
              current:
                state.mainDepartmentItem &&
                state.mainDepartmentItem.deptId === item.deptId,
            }"
          >
            <a href="#" @click.prevent="mainItemClick(item)">{{
              item.deptName
            }}</a>
          </div>
        </div>
      </a-scrollbar>
    </div>
    <div class="content">
      <template v-if="state.initData">
        <div class="search-result">
          <a-scrollbar style="height: 460px; overflow: auto">
            <div
              v-for="(item, index) in state.initData.list"
              :key="index"
              class="item"
            >
              <a href="#" @click.prevent="itemClick(item)">{{
                item.deptName
              }}</a>
            </div>
          </a-scrollbar>
        </div>
        <!-- <a-pagination
          v-if="state.initData.total"
          :current="state.page"
          :page-size="state.pageSize"
          :total="state.initData.total"
          show-total
          show-jumper
          show-page-size
          @change="(page: number) => {state.page = page; search()}"
          @page-size-change="(pageSize: number) => {state.page = 1; state.pageSize = pageSize; search()}"
        /> -->
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onActivated, onMounted, reactive } from 'vue';
  import { getDepartments } from '@/api/huadongHospital';
  const state = reactive({
    form: {
      key: '',
    },
    formCache: {} as Record<string, any>,
    initData: null as Record<string, any> | null,
    mainDepartmentData: null as Record<string, any> | null,
    searchList: [] as Record<string, any>[],
    page: 1,
    pageSize: 10,

    isFirst: false,
    mainDepartmentItem: null as Record<string, any> | null,
  });
  const emit = defineEmits<{
    (e: 'change', department: Record<string, any>): void;
  }>();
  function submit() {
    state.formCache = JSON.parse(JSON.stringify(state.form));
    if (!state.mainDepartmentData) {
      return;
    }
    if (!state.formCache.key) {
      state.searchList = JSON.parse(
        JSON.stringify(state.mainDepartmentData.list)
      );
      return;
    }
    state.searchList = state.mainDepartmentData.list.filter(
      (item: Record<string, any>) => {
        return (
          item.deptName
            .toLowerCase()
            .indexOf(state.formCache.key.toLowerCase()) !== -1
        );
      }
    );
  }
  async function search() {
    const params = {
      level: '2',
      deptId: state.mainDepartmentItem?.deptId,
      // page: state.page,
      // pageSize: state.pageSize,
    };
    console.log('search', 'params', params);
    const json: any = await getDepartments(params).catch(() => false);
    if (!json) {
      return;
    }
    state.initData = {
      list: json.data || [],
    };
  }

  async function getMainDepartment() {
    const json: any = await getDepartments({
      level: '1',
    }).catch(() => false);
    if (!json) {
      return null;
    }
    return {
      list: json.data || [],
    };
  }
  function itemClick(item: Record<string, any>) {
    emit('change', item);
  }
  function mainItemClick(item: Record<string, any>) {
    state.mainDepartmentItem = item;
    search();
  }
  async function refreshMainDepartment() {
    const data = await getMainDepartment();
    if (!data) {
      return;
    }
    state.mainDepartmentData = data;
    state.searchList = JSON.parse(JSON.stringify(data.list));
    if (state.searchList.length) {
      mainItemClick(state.searchList[0]);
    }
  }
  onActivated(async () => {
    console.log('onActivated department');
    if (state.isFirst) {
      return;
    }
    await refreshMainDepartment();
    state.isFirst = true;
  });
</script>

<script lang="ts">
  export default {
    name: 'Department',
  };
</script>

<style scoped lang="less">
  .b-department {
    width: 800px;
    margin: 0 auto;

    height: 600px;

    .sider {
      background: #f9f9f9;
      width: 200px;
      border: 1px solid var(--color-border);
      box-sizing: border-box;
      // height: 100%;
      // box-sizing: border-box;
      // padding: 20px 0;
      .b-search-bar {
        padding: 20px 20px 0;
      }
      .arco-scrollbar {
        z-index: 1;
      }
      .list {
        .item {
          text-align: center;
          line-height: 45px;
          a {
            text-decoration: none;
            color: var(--color-text-1);
            display: block;
          }
          &.current {
            a {
              color: rgb(var(--primary-6));
            }
          }
        }
      }
    }
    .content {
      flex: 1;
      overflow: hidden;
      padding: 20px;
      border: 1px solid var(--color-border);
      border-left: 0;
      box-sizing: border-box;
      height: 100%;

      .search-result {
        margin-bottom: 20px;
        .item {
          border-bottom: 1px solid var(--color-border);
          line-height: 45px;

          a {
            text-decoration: none;
            color: var(--color-text-1);
            display: block;
            padding: 0 10px;
          }
          &:nth-child(odd) {
            background: #f9f9f9;
          }
        }
      }
    }
  }
</style>
