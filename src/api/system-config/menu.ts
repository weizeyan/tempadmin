import axios from 'axios';
export function all(){
  return axios.post(`/system/menu/list`);
}

export function detail(data: Record<string, any>){
  return axios.post(`/system/menu/detail/${data.id}`, data);
}

export function saveTree(data: Record<string, any>){
  return axios.post(`/system/menu/saveOrUpdateByTree`, data);
}

export function save(data: Record<string, any>){
  return axios.post(`/system/user/saveOrUpdate`, data);
}


export function del(data: Record<string, any>){
  return axios.post(`/system/menu/remove`, data);
}




