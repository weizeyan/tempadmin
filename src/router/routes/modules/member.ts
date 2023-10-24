import { DEFAULT_LAYOUT } from '../base';
import { AppRouteRecordRaw } from '../types';

const LIST: AppRouteRecordRaw = {
  path: '/member',
  name: 'Member',
  component: DEFAULT_LAYOUT,
  meta: {
    locale: '会员管理',
    requiresAuth: true,
    icon: 'icon-list',
    order: 1,
  },
  redirect: '',
  children: [
    {
      path: 'list',
      name: 'MemberList',
      component: () => import('@/views/member/list.vue'),
      meta: {
        locale: '会员列表',
        requiresAuth: true,
      },
    },
    {
      path: 'view',
      name: 'MemberView',
      component: () => import('@/views/member/view.vue'),
      meta: {
        locale: '会员详情',
        requiresAuth: true,
        activeMenu: 'MemberList',
        hideInMenu: true,
      },
    },
    {
      path: 'claim',
      name: 'MemberClaim',
      component: () => import('@/views/member/claim.vue'),
      meta: {
        locale: 'Claim详情',
        requiresAuth: true,
        activeMenu: 'MemberList',
        hideInMenu: true,
      },
    },
    {
      path: 'appointment',
      name: 'MemberAppoinment',
      component: '',
      redirect: '/member/appointment/create',
      meta: {
        locale: '预约管理',
        requiresAuth: true,
        hideInMenu: true,
      },
      children: [
        {
          path: 'create',
          name: 'MemberAppoinmentCreate',
          component: () => import('@/views/member/appointment-create.vue'),
          meta: {
            locale: '新建预约',
            requiresAuth: true,
            activeMenu: 'MemberList',
            hideInMenu: true,
          },
        },
        {
          path: 'batch',
          name: 'MemberAppoinmentBatch',
          component: () => import('@/views/member/appointment-batch.vue'),
          meta: {
            locale: '批量预约',
            requiresAuth: true,
            activeMenu: 'MemberList',
            hideInMenu: true,
          },
        },
        {
          path: 'handler',
          name: 'MemberAppoinmentHandler',
          component: () => import('@/views/member/appointment-handler.vue'),
          meta: {
            locale: '预约编辑',
            requiresAuth: true,
            activeMenu: 'MemberList',
            hideInMenu: true,
          },
        },
        {
          path: 'preview',
          name: 'MemberAppoinmentPreview',
          component: () => import('@/views/member/appointment-preview.vue'),
          meta: {
            locale: '预约详情',
            requiresAuth: true,
            activeMenu: 'MemberList',
            hideInMenu: true,
          },
        },
      ],
    },
  ],
};

export default LIST;
