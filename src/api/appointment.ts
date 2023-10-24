import axios from 'axios';
export function list(data: Record<string, any>) {
  return axios.post(`/business/appointmentManage/page`, data);
}

export function todoPage(data: Record<string, any>) {
  return axios.post(`/business/appointmentManage/todoPage`, data);
}

export function dataBoard(data: Record<string, any>) {
  return axios.post(`/business/appointmentManage/dataBoard`, data);
}

export function hospitalSelect(data: Record<string, any>) {
  return axios.post(`/business/appointmentManage/hospitalSelect`, data);
}
