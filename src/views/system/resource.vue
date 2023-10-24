<template>
  <div class="common-container">
    <a-tree ref="resourceTreeRef" :data="state.treeData" />

    <div class="info-wrap">
      <div v-if="state.addArr.length > 0">
        <h3>新增路由</h3>
        <div v-for="item in state.addArr" :key="item.name">
          <div>{{ item.title }}</div></div
        >
      </div>

      <div v-if="state.minusArr.length > 0">
        <h3>删除路由</h3>
        <div v-for="item in state.minusArr" :key="item.name">
          <div>{{ item.title }}</div></div
        >
      </div>
    </div>

    <a-button type="primary" @click="getResult">保存</a-button>
    <a-button type="primary" class="update-btn" @click="updateResource"
      >更新</a-button
    >
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onActivated } from 'vue';
  import { useRouter } from 'vue-router';
  import { Tree, Message } from '@arco-design/web-vue';
  import { AppRouteRecordRaw } from '@/router/routes/types';
  import { list, saveOrUpdate, remove } from '@/api/system-config/resource';
  import { resourceRoutes } from './types';

  type TreeCtx = InstanceType<typeof Tree>;

  const router = useRouter();
  const resourceTreeRef = ref<TreeCtx>();

  const state = reactive({
    treeData: [] as AppRouteRecordRaw[],
    localRoutes: [] as resourceRoutes[],
    dataRoutes: [] as resourceRoutes[],
    addArr: [] as resourceRoutes[],
    minusArr: [] as resourceRoutes[],
  });

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

  const resetData = () => {
    state.treeData = [];
    state.localRoutes = [];
    state.dataRoutes = [];
    state.addArr = [];
    state.minusArr = [];

    initLocatRoutes();
    initServeRoutes();
  };

  const updateResource = async () => {
    if (state.addArr.length > 0) {
      Message.info('请先保存路由');
      return;
    }

    const updateArr = state.localRoutes.map((item) => {
      let result = {};

      state.dataRoutes.forEach((data) => {
        if (item.name === data.name) {
          result = {
            ...data,
            ...item,
            children: [],
          };
        }
      });

      return result;
    });

    setParentId(updateArr);
    await saveOrUpdate(updateArr);

    Message.success('更新成功');
    resetData();
  };

  const getResult = async () => {
    await remove({
      menus: state.minusArr.map((item) => item.menuId),
    });

    await saveOrUpdate(state.addArr);

    Message.success('保存成功');
    resetData();
  };

  const splitCamelCase = (str: string) => {
    return str
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  };

  const difference = (arr1: any, arr2: any) => {
    return arr1.filter(
      (obj1: any) => !arr2.find((obj2: any) => obj2.name === obj1.name)
    );
  };

  const setParentId = (arr: any[]) => {
    arr.forEach((item) => {
      if (['403', '404', '500'].indexOf(item.name) > -1) {
        item.parentId = state.dataRoutes.find(
          (data) => data.name === 'Exception'
        )?.menuId;
      } else {
        const arr = splitCamelCase(item.name);

        if (arr.length > 1) {
          arr.pop();
          const parentName = arr.join('');

          state.dataRoutes.forEach((data) => {
            if (data.name === parentName) {
              item.parentId = data.menuId;
            }
          });
        }
      }

      if (!item.parentId && item.children) {
        item.parentId = 0;
      }

      item.component = '';
    });
  };

  const getAddRoutes = () => {
    console.log(`output->localRoutes`, state.localRoutes);
    console.log(`output->dataRoutes`, state.dataRoutes);

    const addArr: resourceRoutes[] = difference(
      state.localRoutes,
      state.dataRoutes
    );

    setParentId(addArr);

    state.addArr = addArr.filter(
      (item) => !!item.parentId || item.parentId === 0
    );

    console.log(`output->addArr`, state.addArr);
  };

  const getMinusRoutes = () => {
    state.minusArr = difference(state.dataRoutes, state.localRoutes);
    console.log(`output->minusArr`, state.minusArr);
  };

  const expansionObject = (arr: any[]) => {
    let result: resourceRoutes[] = [];

    arr.forEach((item) => {
      if (item.name) {
        result.push(item);
      }

      if (item.children) {
        result = result.concat(expansionObject(item.children));
      }
    });

    return result;
  };

  const initLocatRoutes = () => {
    router.options.routes.forEach((item) => {
      if (item.meta && item.meta.requiresAuth) {
        state.treeData.push(item as AppRouteRecordRaw);
      }
    });

    state.treeData.sort((a: AppRouteRecordRaw, b: AppRouteRecordRaw) => {
      return a.meta!.order! - b.meta!.order!;
    });

    state.localRoutes = expansionObject(state.treeData);
  };

  const initServeRoutes = async () => {
    try {
      const { data } = await list();
      state.dataRoutes = expansionObject(data);

      getAddRoutes();
      getMinusRoutes();
    } catch (error) {
      console.log(`output->error`, error);
    }
  };

  onActivated(() => {
    state.treeData = [];
    initLocatRoutes();
    initServeRoutes();
  });
</script>

<script lang="ts">
  export default {
    name: 'SystemResourceList',
  };
</script>

<style lang="less" scoped>
  .update-btn {
    margin-left: 10px;
  }

  .info-wrap {
    margin-bottom: 20px;
  }
</style>
