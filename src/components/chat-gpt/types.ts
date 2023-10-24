import { Input } from '@arco-design/web-vue';

export interface ChatGPT {
  (content: any): Promise<any>;
}

export interface ConversationList {
  avatar: string;
  content: any;
}

export type InputCtx = InstanceType<typeof Input>;
