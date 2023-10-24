export const PAGE_SIZE_OPTIONS = [20, 50, 100, 200, 500];

export const DIRECT_PAYMENT_METHODS: Record<string, any> = {
  '0': '见卡直付',
  '1': '陪诊垫付',
  '2': '担保函',
};

export const ROLES_MAP: Record<string, any> = {
  'CS': 'Operation CS',
  'PCM': 'Operation PCM',
  'CS Admin': 'CS Admin Report',
};

export const POLICY_STATUS_MAP: Record<string, any> = {
  Y: '有效',
  N: '未生效',
  T: '终止',
  pending: '欠费',
};
