import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';
const REPORTS: AppRouteRecordRaw = {
  path: '/appointment',
  name: 'Appointment',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: '预约管理',
    requiresAuth: true,
    icon: 'icon-list',
    order: 2,
  },
  redirect: '',
  children: [
    {
      path: 'dashboard',
      name: 'AppointmentDashboard',
      component: () => import('@/views/appointment/dashboard.vue'),
      meta: {
        locale: '数据看板',
        requiresAuth: true,
        order: 1,
      },
    },
    {
      path: 'list',
      name: 'AppointmentList',
      component: () => import('@/views/appointment/list.vue'),
      meta: {
        locale: '预约记录查询',
        requiresAuth: true,

        order: 2,
      },
    },
  ],
};

export default REPORTS;
