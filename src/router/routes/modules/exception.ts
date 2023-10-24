import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const EXCEPTION: AppRouteRecordRaw = {
  path: '/exception',
  name: 'Exception',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: '异常页',
    requiresAuth: true,
    icon: 'icon-exclamation-circle',
    order: -1,
    hideInMenu: true,
  },
  children: [
    {
      path: '403',
      name: '403',
      component: () => import('@/views/exception/403/index.vue'),
      meta: {
        locale: '403',
        requiresAuth: true,
        hideInMenu: true,
        noAffix: true,
      },
    },
    {
      path: '404',
      name: '404',
      component: () => import('@/views/exception/404/index.vue'),
      meta: {
        locale: '404',
        requiresAuth: true,
        hideInMenu: true,
        noAffix: true,
      },
    },
    {
      path: '500',
      name: '500',
      component: () => import('@/views/exception/500/index.vue'),
      meta: {
        locale: '500',
        requiresAuth: true,
        hideInMenu: true,
        noAffix: true,
      },
    },
  ],
};

export default EXCEPTION;
