<template>
  <div class="common-container">
    <QueryForm
      ref="$addForm"
      v-model="state.fields"
      :form-type="2"
      :col-span="24"
      label-align="right"
      direction="vertical"
      :show-button-bar="false"
    >
    </QueryForm>

    <a-row>
      <a-col :span="6" class="label">资源</a-col>
      <a-col :span="18" class="content">
        <a-tree
          ref="resourceTreeRef"
          v-model:checked-keys="state.checkedKeysData"
          v-model:half-checked-keys="state.checkedHalfKeysData"
          checkable
          :data="state.treeData"
          @check="onTreenCheck"
        />
      </a-col>
    </a-row>
    <a-row class="btn-bar">
      <a-col :span="6" class="label"></a-col>
      <a-col :span="18" class="content">
        <a-button type="primary" @click="submit" :loading="state.btnLoading"
          >保存</a-button
        >
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onActivated, onMounted, nextTick } from 'vue';
  import { useRoute, RouteRecordName } from 'vue-router';
  import { Message, Tree } from '@arco-design/web-vue';
  import { AppRouteRecordRaw } from '@/router/routes/types';
  import { Field } from '@/components/query-form/index.vue';
  import { detail, save } from '@/api/system-config/role';
  import { all } from '@/api/system-config/menu';
  import { useTabBarStore } from '@/store';
  import router from '@/router';
  type TreeCtx = InstanceType<typeof Tree>;

  const route = useRoute();
  const resourceTreeRef = ref<TreeCtx>();
  const $addForm = ref();
  const tabBarStore = useTabBarStore();

  const state = reactive({
    treeData: [] as AppRouteRecordRaw[],
    checkedKeysData: [] as string[],
    checkedHalfKeysData: [] as string[],
    // 表单字段
    fields: [] as Field[],
    id: '',
    initData: null as Record<string, any> | null,
    btnLoading: false,
  });

  const onTreenCheck = (checkedKeys: Array<string | number>, data: any) => {};

  const filterItems = (arr: any, testFn: any): any => {
    return arr.reduce((acc: any, item: any) => {
      if (testFn(item)) {
        if (item.children) {
          // console.log('push item children', item);
          const filteredChildren = filterItems(item.children, testFn);
          if (filteredChildren.length) {
            acc.push(item.menuId, ...filteredChildren);
          } else {
            acc.push(item.menuId);
          }
        } else {
          acc.push(item.menuId);
        }
      }

      return acc;
    }, []);
  };

  const getResult = () => {
    const checkedKeyList: RouteRecordName[] = [
      ...state.checkedHalfKeysData,
      ...state.checkedKeysData,
    ];

    const finalData = [...state.treeData];

    const results = filterItems(
      finalData,
      (item: any) => checkedKeyList.indexOf(item.name as RouteRecordName) > -1
    );

    console.log(results);
    console.log(JSON.stringify(results));
    return results;
  };

  const setDefaultChecked = (item: AppRouteRecordRaw) => {
    item.disabled = true;
    state.checkedKeysData.push(item.name as string);

    item.children?.forEach((_item) => {
      _item.disabled = true;
      state.checkedKeysData.push(_item.name as string);
    });
  };

  /**
   * 创建动态表单字段
   */
  function genFields() {
    if (!state.initData) {
      return [];
    }
    const fields: Field[] = [
      {
        name: 'name',
        label: '角色名称',
        type: 'input',
        rules: [
          {
            required: true,
            message: '请输入角色名称',
          },
        ],
        value: state.initData.name || '',
      },

      {
        name: 'code',
        label: '角色编码',
        type: 'input',
        // disabled: !!state.id,
        rules: [
          {
            required: true,
            message: '请输入角色编码',
          },
        ],
        value: state.initData.code || '',
      },
    ];
    return fields;
  }

  const initCheckedData = (item: any) => {
    if (item.accessFlag === '1') {
      if (item.children && item.children.length > 0) {
        item.children.forEach((_item: any) => {
          initCheckedData(_item);
        });
        state.checkedHalfKeysData.push(item.name);
      } else {
        state.checkedKeysData.push(item.name);
      }
    }
  };

  const initRouteList = (list: any[]) => {
    list.forEach((item) => {
      if (item.meta && item.meta.requiresAuth) {
        state.treeData.push(item as AppRouteRecordRaw);
      }
    });
    state.treeData.forEach((item: any) => {
      if (item.name === 'Dashboard' || item.name === 'Exception') {
        setDefaultChecked(item);
      } else {
        initCheckedData(item);
      }
    });
    state.treeData.sort((a: AppRouteRecordRaw, b: AppRouteRecordRaw) => {
      return a.meta!.order! - b.meta!.order!;
    });
  };

  async function getInitData() {
    if (!state.id) {
      const json: any = await all().catch(() => false);
      return {
        name: '',
        code: '',
        list: json ? json.data || [] : [],
      };
    }
    const json: any = await detail({ id: state.id }).catch(() => false);
    if (!json) {
      return null;
    }

    return json.data;
  }

  async function submit() {
    const rs = await $addForm.value.query();
    if (!rs) {
      return;
    }
    const menus = getResult();
    const post = {
      ...$addForm.value.form,
      menus,
    };

    if (state.id) {
      post.id = state.id;
    }
    state.btnLoading = true;
    const json: any = await save(post).catch(() => false);
    state.btnLoading = false;
    if (!json) {
      return;
    }
    console.log('保存成功');
    Message.success('保存成功');
    tabBarStore.deleteTagByFullPath(route.fullPath);
    router.push({
      name: 'SystemRole',
    });
  }

  onMounted(async () => {
    state.id = (route.query.id || '') as string;
    state.initData = await getInitData();
    state.fields = genFields();
    initRouteList(state.initData?.list);
    console.log('mounted');
  });

  onActivated(async () => {});
</script>

<script lang="ts">
  export default {
    name: 'SystemRoleDetail',
  };
</script>

<style lang="less" scoped>
  .arco-row {
    padding: 0 8px;

    .label {
      color: var(--color-text-2);
      text-align: right;
      padding-right: 20px !important;
    }

    &.btn-bar {
      padding-top: 40px;
    }
  }
</style>
