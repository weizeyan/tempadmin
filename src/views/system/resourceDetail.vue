<template>
  <div class="common-container">
    <a-tree
      ref="resourceTreeRef"
      v-model:checked-keys="state.checkedKeysData"
      v-model:half-checked-keys="state.checkedHalfKeysData"
      checkable
      :data="state.treeData"
      @check="onTreenCheck"
    />

    <a-button type="primary" @click="getResult">保存</a-button>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onActivated } from 'vue';
  import { useRouter, RouteRecordRaw, RouteRecordName } from 'vue-router';
  import { Tree } from '@arco-design/web-vue';

  type TreeCtx = InstanceType<typeof Tree>;

  const router = useRouter();
  const resourceTreeRef = ref<TreeCtx>();

  const state = reactive({
    treeData: [] as RouteRecordRaw[],
    checkedKeysData: [] as string[],
    checkedHalfKeysData: [] as string[],
  });

  const onTreenCheck = (checkedKeys: Array<string | number>, data: any) => {
    // console.log(`output->`, checkedKeys);
    // console.log(`output->`, data.node);
    // console.log(state.checkedData);
  };

  const filterItems = (arr: any, testFn: any): any => {
    return arr.reduce((acc: any, item: any) => {
      if (testFn(item)) {
        if (item.children) {
          const filteredChildren = filterItems(item.children, testFn);
          if (filteredChildren.length) {
            acc.push({
              ...item,
              children: filteredChildren,
            });
          }
        } else {
          acc.push(item);
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
  };

  onActivated(() => {
    console.log(router.options.routes);
    state.treeData = [];
    // state.checkedKeysData = ['systemResourceList'];

    router.options.routes.forEach((item) => {
      if (item.meta && item.meta.requiresAuth) {
        state.treeData.push(item);
      }
    });
  });
</script>

<script lang="ts">
  export default {
    name: 'systemResourceDetail',
  };
</script>

<style lang="scss" scoped></style>
