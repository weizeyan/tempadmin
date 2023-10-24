import axios from 'axios';
import { resourceRoutes } from '@/views/system/types';

export function list() {
  return axios.post(`/system/menu/list`);
}

export function saveOrUpdate(data: resourceRoutes[]) {
  return axios.post(`/system/menu/saveOrUpdate`, data);
}

export function remove(data: Record<string, (number | undefined)[]>) {
  return axios.post(`/system/menu/remove`, data);
}
