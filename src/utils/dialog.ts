import { Modal } from '@arco-design/web-vue';
import { RenderContent } from '@arco-design/web-vue/es/_utils/types';

type ConfirmOptions = {
  title?: string;
  content: RenderContent;
  remote?: () => boolean | Promise<boolean>;
};

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.confirm({
      title: options.title || '提示',
      content: options.content || '',
      okText: '确定',
      cancelText: '取消',
      maskClosable: false,
      escToClose: false,
      onBeforeOk: async () => {
        const rs = await (options.remote ? options.remote() : true);
        resolve(rs);
        return true;
      },
      onBeforeCancel() {
        resolve(false);
        return true;
      },
    });
  });
}
