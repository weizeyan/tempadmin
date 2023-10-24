import axios from 'axios';
import type { RouteRecordNormalized } from 'vue-router';
import { UserState } from '@/store/modules/user/types';

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginRes {
  token: string;
}

export interface LoginFeishuData {
  code: string;
}

export function login(data: LoginData) {
  return axios.post<LoginRes>('/loginByPassword', data);
}

export function logout() {
  return axios.post<LoginRes>('/logout');
}

export function getUserInfo() {
  return axios.post<UserState>('/userInfo/getUserInfo');
}

export function getMenuList() {
  return axios.post<RouteRecordNormalized[]>('/userInfo/getMenus');
}

export function loginFeishu(data: LoginFeishuData) {
  return axios.post('loginByFeiShu', data);
}
