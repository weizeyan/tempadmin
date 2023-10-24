import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const SYSTEM: AppRouteRecordRaw = {
  path: '/system',
  name: 'System',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: '系统设置',
    icon: 'icon-settings',
    requiresAuth: true,
    order: 5,
  },
  children: [
    {
      path: 'user',
      name: 'SystemUser',
      component: () => import('@/views/system/user.vue'),
      meta: {
        locale: '用户管理',
        requiresAuth: true,
      },
    },
    {
      path: 'role',
      name: 'SystemRole',
      component: '',
      redirect: '/system/role/list',
      meta: {
        locale: '角色管理',
        requiresAuth: true,
      },
      children: [
        {
          path: 'list',
          name: 'SystemRoleList',
          component: () => import('@/views/system/role.vue'),
          meta: {
            locale: '角色列表',
            requiresAuth: true,
            activeMenu: 'SystemRole',
          },
        },
        {
          path: 'detail',
          name: 'SystemRoleDetail',
          component: () => import('@/views/system/roleDetail.vue'),
          meta: {
            locale: '新建角色',
            titleQuery: '编辑角色',
            requiresAuth: true,
            hideInMenu: true,
            activeMenu: 'SystemRole',
          },
        },
      ],
    },
    {
      path: 'resource',
      name: 'SystemResource',
      component: '',
      redirect: '/system/resource/list',
      meta: {
        locale: '资源管理',
        requiresAuth: true,
      },
      children: [
        {
          path: 'list',
          name: 'SystemResourceList',
          component: () => import('@/views/system/resource.vue'),
          meta: {
            locale: '资源管理列表',
            requiresAuth: true,
            activeMenu: 'SystemResource',
          },
        },
        {
          path: 'detail',
          name: 'SystemResourceDetail',
          component: () => import('@/views/system/resourceDetail.vue'),
          meta: {
            locale: '资源管理详情',
            requiresAuth: true,
            hideInMenu: true,
            activeMenu: 'SystemResource',
          },
        },
      ],
    },
  ],
};

export default SYSTEM;
