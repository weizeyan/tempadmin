<template>
  <router-view v-slot="{ Component, route }">
    <transition name="fade" mode="out-in" appear>
      <component
        :is="Component"
        v-if="route.meta.ignoreCache"
        :key="route.fullPath"
      />
      <!-- <keep-alive v-else :include="cacheList">
        <component :is="Component" :key="route.fullPath" />
      </keep-alive> -->

      <keep-alive v-else :include="cacheList">
        <component
          :is="wrap(route.fullPath, Component)"
          :key="route.fullPath"
        />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script lang="ts" setup>
  import { computed, h } from 'vue';
  import { useTabBarStore } from '@/store';

  const wrapperMap = new Map();

  const tabBarStore = useTabBarStore();

  const cacheList = computed(() =>
    tabBarStore.getTabList.map((item) => item.fullPath)
  );

  const wrap = (fullPath: string, component: any) => {
    let wrapper;
    // 重点就是这里，这个组件的名字是完全可控的，
    // 只要自己写好逻辑，每次能找到对应的外壳组件就行，完全可以写成任何自己想要的名字.
    // 这就能配合 keep-alive 的 include 属性可控地操作缓存.
    const wrapperName = fullPath;
    if (wrapperMap.has(wrapperName)) {
      wrapper = wrapperMap.get(wrapperName);
    } else {
      wrapper = {
        name: wrapperName,
        render() {
          return h('div', { className: 'prosper-page-wrapper' }, component);
        },
      };
      wrapperMap.set(wrapperName, wrapper);
    }
    return h(wrapper);
  };
</script>

<style scoped lang="less"></style>
