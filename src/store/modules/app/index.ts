import { defineStore } from 'pinia';
import { Notification } from '@arco-design/web-vue';
import type { NotificationReturn } from '@arco-design/web-vue/es/notification/interface';
import type { RouteRecordNormalized } from 'vue-router';
import defaultSettings from '@/config/settings.json';
import { getMenuList } from '@/api/user';
import { initMeta } from '@/utils';
import { AppState } from './types';
import { getFromStorage, updateStorage } from '../tab-bar/index';

function treeToList(tree: Record<string, any>[]): Record<string, any>[] {
  const list: Record<string, any>[] = [];
  tree.forEach((item) => {
    list.push(item);
    if (item.children) {
      list.push(...treeToList(item.children));
    }
  });
  return list;
}

const useAppStore = defineStore('app', {
  state: (): AppState => ({ ...defaultSettings }),

  getters: {
    appCurrentSetting(state: AppState): AppState {
      return { ...state };
    },
    appDevice(state: AppState) {
      return state.device;
    },
    appAsyncMenus(state: AppState): RouteRecordNormalized[] {
      return state.serverMenu as unknown as RouteRecordNormalized[];
    },
  },

  actions: {
    // Update app settings
    updateSettings(partial: Partial<AppState>) {
      // @ts-ignore-next-line
      this.$patch(partial);
    },

    // Change theme color
    toggleTheme(dark: boolean) {
      if (dark) {
        this.theme = 'dark';
        // document.body.setAttribute('arco-theme', 'dark');
      } else {
        this.theme = 'light';
        document.body.removeAttribute('arco-theme');
      }
    },
    toggleDevice(device: string) {
      this.device = device;
    },
    toggleMenu(value: boolean) {
      this.hideMenu = value;
    },
    async fetchServerMenuConfig() {
      let notifyInstance: NotificationReturn | null = null;
      try {
        const { data } = await getMenuList();
        initMeta(data);
        this.serverMenu = [...data];
        const list = treeToList(this.serverMenu);
        const cache = getFromStorage();
        if (cache) {
          cache.cacheTabList = cache.cacheTabList.filter((item: string) => {
            return !!list.find((menu) => {
              return menu.name === item;
            });
          });
          cache.tagList = cache.tagList.filter((tag: Record<string, any>) => {
            return !!list.find((menu) => {
              return menu.name === tag.name;
            });
          });
          updateStorage(cache);
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        notifyInstance = Notification.error({
          id: 'menuNotice',
          content: error as any,
          closable: true,
        });
      }
    },
    clearServerMenu() {
      this.serverMenu = [];
    },
  },
});

export default useAppStore;
