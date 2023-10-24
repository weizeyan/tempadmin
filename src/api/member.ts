import axios from 'axios';
export function searchCorporateList(data: Record<string, any>) {
  return axios.post(`/business/member/search/corpinfo`, data);
}

export function list(data: Record<string, any>) {
  return axios.post(`/business/member/query`, data);
}

export function detail(data: Record<string, any>) {
  return axios.post(`/business/member/detail`, data);
}

export function policyInfo(data: Record<string, any>) {
  return axios.post(`/policy/info`, data);
}

export function policyDoc(data: Record<string, any>) {
  return axios.post(`/policy/doc`, data);
}
export function policyRemark(data: Record<string, any>) {
  return axios.post(`/policy/remark`, data);
}

export function relatedList(data: Record<string, any>) {
  return axios.post(`/policy/relatedList`, data);
}
export function familyMemberList(data: Record<string, any>) {
  return axios.post(`/business/member/family/memberPage`, data);
}

export function familyClaimList(data: Record<string, any>) {
  return axios.post(`/business/member/family/claimPage`, data);
}
export function familySelectList(data: Record<string, any>) {
  return axios.post(`/business/member/family/selectList`, data);
}

export function claimList(data: Record<string, any>) {
  return axios.post(`/business/member/claim/page`, data);
}

export function claimSelectList(data: Record<string, any>) {
  return axios.post(`/business/member/claim/selectList`, data);
}

export function exportAllClaim(data: Record<string, any>) {
  return axios.post(`/business/member/family/exportAllClaim`, data, {
    responseType: 'blob',
  });
}

export function exportSelectClaim(data: Record<string, any>) {
  return axios.post(`/business/member/family/exportSelectClaim`, data, {
    responseType: 'blob',
  });
}
export function claimDetail(data: Record<string, any>) {
  return axios.post(`/business/member/claim/detail`, data);
}

export function claimAssessment(data: Record<string, any>) {
  return axios.post(`/business/member/claim/accessment/page`, data);
}

export function claimEob(data: Record<string, any>) {
  return axios.post(`/business/member/claim/file/eob`, data);
}

export function claimDoc(data: Record<string, any>) {
  return axios.post(`/business/member/claim/file/documents`, data);
}

export function downloadEob(data: Record<string, any>) {
  return axios.get(`/document/file/getEob`, {
    params: data,
    responseType: 'blob',
  });
}

export function downloadDocument(data: Record<string, any>) {
  return axios.get(`/document/file/getDocument`, {
    params: data,
    responseType: 'blob',
  });
}
export function claimEmailBaseInfo(data: Record<string, any>) {
  return axios.post(`/business/member/claim/email/detail`, data);
}
export function claimEmailSend(data: Record<string, any>) {
  return axios.post(`/business/member/claim/email/send`, data);
}
export function claimEmailList(data: Record<string, any>) {
  return axios.post(`/notify/email/list`, data);
}
export function claimEmailUploadAttach(data: Record<string, any>) {
  return axios.post(`/business/member/claim/eob/upload`, data);
}

export function eccsUrl(data: Record<string, any>) {
  return axios.post(
    `/entitlement/getRedirectUrl/${data.memberControlNo}`,
    data
  );
}

export function chatGPTGetAnswer(data: Record<string, any>) {
  return axios.post(`/chatGPT/getAnswer`, data);
}

export function appointmentList(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/page`, data);
}
export function addAppointment(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/add`, data);
}
export function editAppointment(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/edit`, data);
}
export function closeAppointment(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/close`, data);
}
export function appointmentDetail(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/info`, data);
}

export function getProviderList(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/hospitalList`, data);
}

export function getTimeRangeData(data: Record<string, any>) {
  return axios.post(
    `/business/member/appointment/validTime/${data.date}`,
    data
  );
}
export function submitResult(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/submitResult`, data);
}

export function editResult(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/editResult`, data);
}

export function cancelResult(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/cancel`, data);
}
export function appointmentEscortTaskDetail(data: Record<string, any>) {
  return axios.post(
    `/business/member/appointment/escortTaskDetail/${data.appointmentNo}`,
    data
  );
}
export function appointmentGuaranteeLetterUrl(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/guaranteeLetterUrl`, data);
}

export function appointmentSmsList(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/notify/list`, data);
}

export function appointmentNotifySend(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/notify/send`, data);
}
export function appointmentLogList(data: Record<string, any>) {
  return axios.post(`/business/member/appointment/log/page`, data);
}
