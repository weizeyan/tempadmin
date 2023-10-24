import axios from 'axios';
export function list(data: Record<string, any>) {
  return axios.post(`/system/user/page`, data);
}

export function detail(data: Record<string, any>) {
  return axios.post(`/system/user/detail/${data.id}`, data);
}

export function save(data: Record<string, any>) {
  return axios.post(`/system/user/${data.id ? 'edit' : 'add'}`, data);
}

export function del(data: Record<string, any>) {
  return axios.post(`/system/user/delete/${data.id}`, data);
}

export function bindFeiShu(data: Record<string, any>) {
  return axios.post(`/system/user/bindFeiShu`, data);
}

export function editRole(data: Record<string, any>) {
  return axios.post(`/system/user/editRole`, data);
}

export function getRoleList(data: Record<string, any>) {
  return axios.post(`/system/user/getRoleList/${data.id}`, data);
}

export function setAdmin(data: Record<string, any>) {
  return axios.post(`/system/user/setAdmin`, data);
}

export function getDepartments() {
  return axios.post(`/system/user/getDepartments`);
}

export function getDepartmentUsers(data: Record<string, any>) {
  return axios.post(`/system/user/getDepartmentUsers`, data);
}
