import axios from 'axios';
export function list(data: Record<string, any>) {
  return axios.post(`/system/role/page`, data);
}

export function detail(data: Record<string, any>) {
  return axios.post(`/system/role/detail`, data);
}

export function save(data: Record<string, any>) {
  return axios.post(`/system/role/addOrEdit`, data);
}

export function del(data: Record<string, any>) {
  return axios.post(`/system/role/remove/${data.id}`, data);
}

export function all() {
  return axios.post(`/system/role/queryall`);
}

export function roleList(data: Record<string, any>) {
  return axios.post(`/system/role/roleList`, data);
}
