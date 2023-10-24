import axios from 'axios';
export function getDepartments(data: Record<string, any>) {
  return axios.post(`/business/hdyy/getDepartments`, data);
}

export function getDoctors(data: Record<string, any>) {
  return axios.post(`/business/hdyy/getDoctors`, data);
}

export function getDoctorClasses(data: Record<string, any>) {
  return axios.post(`/business/hdyy/getDoctorClasses`, data);
}

export function getDoctorClassPeriods(data: Record<string, any>) {
  return axios.post(
    `/business/hdyy/getDoctorClassPeriods/${data.classId}`,
    data
  );
}

export function submitBooking(data: Record<string, any>) {
  return axios.post(`/business/hdyy/submitBooking`, data);
}

export function cancelBooking(data: Record<string, any>) {
  return axios.post(`/business/hdyy/cancelBooking/${data.bookingId}`, data);
}

export function page(data: Record<string, any>) {
  return axios.post(`/business/hdyy/page`, data);
}

export function syncBookingStatus(data: Record<string, any>) {
  return axios.post(`/business/hdyy/syncBookingStatus`, data);
}

export function memberPage(data: Record<string, any>) {
  return axios.post(`/business/hdyy/memberPage`, data);
}
