import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';
const REPORTS: AppRouteRecordRaw = {
  path: '/reports',
  name: 'Reports',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: '报表管理',
    requiresAuth: true,
    icon: 'icon-list',
    order: 3,
  },
  redirect: '',
  children: [
    {
      path: 'corporate',
      name: 'ReportsCorporate',
      component: () => import('@/views/reports/corporate/index.vue'),
      meta: {
        locale: 'Corporate',
        requiresAuth: true,
      },
    },
  ],
};

export default REPORTS;
