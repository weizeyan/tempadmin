import mitt, { Handler } from 'mitt';
type Events = {
  send: Record<string, any>;
  open: undefined;
  close: undefined;
  // show: undefined;
  // hide: undefined;
  // 'show-conversation': undefined;
  // 'hide-conversation': undefined;
};
export const chatGptEmitter = mitt<Events>();
