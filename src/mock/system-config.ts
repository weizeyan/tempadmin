import Mock from 'mockjs';
import setupMock, {
  successResponseWrap,
  failResponseWrap,
} from '@/utils/setup-mock';

import { MockParams } from '@/types/mock';

setupMock({
  setup() {
    // 用户列表
    Mock.mock(new RegExp('/systemConfig/userList'), ({ body }) => {
      const params: Record<string, any> = JSON.parse(body);
      const { current, pageSize } = params;
      const total = 101;
      const list: any[] = [];
      for (let i = 0, l = total; i < l; i += 1) {
        list.push({
          id: i + 1,
          name: `用户${i + 1}`,
          realName: `姓名${i + 1}`,
          role: ['管理员', '运营', '测试'],
          status: '1',
        });
      }
      const start = (current - 1) * pageSize;
      const end = start + pageSize;
      console.log('list', list, start, end);

      return successResponseWrap({
        list: list.slice(start, end),
        total,
      });
    });
  },
});
