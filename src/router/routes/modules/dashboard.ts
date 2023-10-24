import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const DASHBOARD: AppRouteRecordRaw = {
  path: '/dashboard',
  name: 'Dashboard',
  component: DEFAULT_LAYOUT,
  redirect: '/dashboard/index',
  meta: {
    locale: 'CS Portal',
    requiresAuth: true,
    icon: 'icon-dashboard',
    order: 0,
  },
  children: [
    {
      path: 'index',
      name: 'DashboardIndex',
      component: () => import('@/views/dashboard/index.vue'),
      meta: {
        locale: '欢迎页',
        requiresAuth: true,
        roles: ['*'],
        activeMenu: 'Dashboard',
        noAffix: true,
      },
    },
  ],
};

export default DASHBOARD;
