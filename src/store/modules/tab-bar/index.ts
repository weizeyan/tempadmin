import type { RouteLocationNormalized } from 'vue-router';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import {
  DEFAULT_ROUTE,
  DEFAULT_ROUTE_NAME,
  REDIRECT_ROUTE_NAME,
} from '@/router/constants';
import { isString } from '@/utils/is';
import { TabBarState, TagProps } from './types';

const formatTag = (route: RouteLocationNormalized): TagProps => {
  const { name, meta, fullPath, query } = route;
  return {
    title: meta.locale || '',
    titleQuery: (meta.titleQuery as string) || '',
    name: String(name),
    fullPath,
    query,
    ignoreCache: meta.ignoreCache,
  };
};

const STORAGE_CACE_KEY = 'tabBarCache';
const BAN_LIST = [REDIRECT_ROUTE_NAME];

export function clearStorage() {
  localStorage.removeItem(STORAGE_CACE_KEY);
}
export function updateStorage(value: Record<string, any>) {
  localStorage.setItem(STORAGE_CACE_KEY, JSON.stringify(value));
}
export function getFromStorage() {
  const cache = localStorage.getItem(STORAGE_CACE_KEY)
    ? JSON.parse(localStorage.getItem(STORAGE_CACE_KEY) as string)
    : null;
  return cache;
}
const useAppStore = defineStore('tabBar', {
  state(): TabBarState {
    const cache = getFromStorage();

    if (cache) {
      cache.cacheTabList = new Set(cache.cacheTabList);
    }

    return (
      cache || {
        cacheTabList: new Set([DEFAULT_ROUTE_NAME]),
        tagList: [DEFAULT_ROUTE],
      }
    );
  },

  getters: {
    getTabList(): TagProps[] {
      return this.tagList;
    },
    getCacheList(): string[] {
      return Array.from(this.cacheTabList);
    },
  },

  actions: {
    syncToStorage() {
      const cache = {
        cacheTabList: this.getCacheList,
        tagList: this.getTabList,
      };
      this.updateStorage(cache);
    },
    updateStorage,
    clearStorage,
    getFromStorage,

    updateTabList(route: RouteLocationNormalized) {
      if (BAN_LIST.includes(route.name as string)) return;
      this.tagList.push(formatTag(route));
      if (!route.meta.ignoreCache) {
        this.cacheTabList.add(route.name as string);
      }
      this.syncToStorage();
    },
    deleteTagByFullPath(fullPath: string) {
      const currentName = this.tagList.find(
        (item) => item.fullPath === fullPath
      )?.name;
      this.tagList = this.tagList.filter((item) => item.fullPath !== fullPath);

      if (currentName) {
        const tagNames = new Set(this.tagList.map((item) => item.name));
        if (!tagNames.has(currentName)) {
          this.cacheTabList.delete(currentName);
        }
      }
      this.syncToStorage();
    },
    deleteTag(idx: number, tag: TagProps, deletaCache = true) {
      this.tagList.splice(idx, 1);
      if (deletaCache) {
        this.cacheTabList.delete(tag.name);
      }
      this.syncToStorage();
    },
    addCache(name: string) {
      if (isString(name) && name !== '') {
        this.cacheTabList.add(name);
      }
      this.syncToStorage();
    },
    deleteCache(tag: TagProps) {
      this.cacheTabList.delete(tag.name);
      this.syncToStorage();
    },
    freshTabList(tags: TagProps[]) {
      this.tagList = tags;
      this.cacheTabList.clear();
      // 要先判断ignoreCache
      this.tagList
        .filter((el) => !el.ignoreCache)
        .map((el) => el.name)
        .forEach((x) => this.cacheTabList.add(x));
      this.syncToStorage();
    },
    resetTabList() {
      this.tagList = [DEFAULT_ROUTE];
      this.cacheTabList.clear();
      this.cacheTabList.add(DEFAULT_ROUTE_NAME);
      this.syncToStorage();
    },
    setCurrentTabTitle(customTitle: string, route?: RouteLocationNormalized) {
      console.log('customTitle', customTitle);
      let currentRoute = useRoute();

      if (route) {
        currentRoute = route;
      }

      if (currentRoute) {
        this.tagList.forEach((item) => {
          if (item.fullPath === currentRoute.fullPath) {
            item.customTitle = customTitle;
          }
        });
      }
      this.syncToStorage();
    },
  },
});

export default useAppStore;
