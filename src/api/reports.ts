import axios from 'axios';
export function exportWithCorporate(data: Record<string, any>) {
  return axios.post(`/report/exportWithCorporate`, data, {
    responseType: 'blob',
  });
}
