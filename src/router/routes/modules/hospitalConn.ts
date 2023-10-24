import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const SYSTEM: AppRouteRecordRaw = {
  path: '/hospitalConn',
  name: 'HospitalConn',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: '医院互联',
    icon: 'icon-list',
    requiresAuth: true,
    order: 3,
  },
  children: [
    {
      path: 'huaDongHospital',
      name: 'HospitalConnHuaDongHospital',
      meta: {
        locale: '华东医院',
        requiresAuth: true,
      },
      children: [
        {
          path: 'appointment',
          name: 'HospitalConnHuaDongHospitalAppointment',
          component: () =>
            import('@/views/hospitalConn/huaDongHospital/appointment.vue'),
          meta: {
            locale: '在线预约',
            requiresAuth: true,
          },
        },
        {
          path: 'list',
          name: 'HospitalConnHuaDongHospitalList',
          component: () =>
            import('@/views/hospitalConn/huaDongHospital/list.vue'),
          meta: {
            locale: '预约记录',
            requiresAuth: true,
          },
        },
      ],
    },
  ],
};

export default SYSTEM;
