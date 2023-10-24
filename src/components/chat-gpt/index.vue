<template>
  <div
    ref="$el"
    class="conversation-comp"
    :class="{ minus: state.showConversation === false }"
    :data-x="state.x"
    :data-y="state.y"
    :style="{
      visibility: state.show ? 'visible' : 'hidden',
      transform: `translate(${state.x}px, ${state.y}px)`,
    }"
  >
    <div class="touch-item flex-center-between" @pan="onPan">
      <div class="flex-center-start">
        <img :src="state.chatAvatar" class="chat-img" />
        <div class="chat-text">Prosper GPT</div>
        <div class="tip">内容仅供参考</div>
      </div>
      <div class="flex-center-start">
        <!-- <icon-minus
          v-if="state.showConversation"
          @click="state.showConversation = false"
        />
        <icon-plus
          v-if="!state.showConversation"
          @click="state.showConversation = true"
        /> -->
        <icon-close @click="state.show = false" />
      </div>
    </div>

    <div v-show="state.showConversation" @mousedown.stop>
      <div class="conversation-list" ref="$messageContainer">
        <div v-for="(item, idx) in state.conversationList" :key="idx">
          <div class="flex-start-start item-wrap">
            <img :src="item.avatar" alt="" class="avatar-img" />

            <div class="content-text">{{ item.content }}</div>
          </div>
        </div>
      </div>

      <a-input
        ref="inputTextRef"
        v-model="state.text"
        class="conversation-input"
        placeholder="请输入"
        allow-clear
        @press-enter="onInputPressEnter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import AnyTouch from 'any-touch';
  import { ref, reactive, watch, onMounted, nextTick } from 'vue';
  import { Configuration, OpenAIApi } from 'openai';
  import useLoading from '@/hooks/loading';
  import { chatGPTGetAnswer } from '@/api/member';
  import { ChatGPT, ConversationList } from './types';
  import { chatGptEmitter } from './event';

  const { loading, setLoading } = useLoading();

  const inputTextRef = ref();
  const $messageContainer = ref();
  const $el = ref();

  const props = defineProps({
    content: {
      type: String,
      default: '',
    },
  });

  const state = reactive({
    chatGPT: null as unknown as ChatGPT,
    conversationList: [] as ConversationList[],
    text: '',
    showConversation: false,
    userAvatar:
      'https://bhstatics.oss-cn-shanghai.aliyuncs.com/prosper-website/logo-img.png',
    chatAvatar:
      'https://bhstatics.oss-cn-shanghai.aliyuncs.com/prosper-portal-admin-arco/chat-gpt-avatar.png',

    show: false,
    x: 0,
    y: 0,
  });

  watch(
    () => props.content,
    () => {
      state.text = props.content;
      onInputPressEnter();
    }
  );

  const onPan = (e: any) => {
    const x = (parseFloat(state.x + '') || 0) + e.deltaX;
    const y = (parseFloat(state.y + '') || 0) + e.deltaY;

    state.x = x;
    state.y = y;
  };

  const onInputPressEnter = () => {
    if (state.text) {
      chatGptEmitter.emit('send', {
        message: state.text,
      });
      state.text = '';
    }
  };

  const getChatResult = async (content: any) => {
    if (content) {
      try {
        const results = await state.chatGPT(content);
        const replyContent = results.data.choices[0].message.content.trim();
        state.conversationList.push({
          avatar: state.chatAvatar,
          content: replyContent,
        });

        setLoading(false);
        nextTick(() => {
          inputTextRef.value?.focus();
        });
      } catch (error) {
        console.log(`output->error`, error);
        setLoading(false);
        state.conversationList.push({
          avatar: state.chatAvatar,
          content: '连接超时',
        });
      }
    }
  };

  const initOpenai = () => {
    const configuration = new Configuration({
      // apiKey: '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',
    });
    const client = new OpenAIApi(configuration);
    const chatGPT: ChatGPT = async (content) => {
      return await client.createChatCompletion({
        // 使用当前 OpenAI 开放的最新 3.5 模型，如果后续 4 发布，则修改此处参数即可
        model: 'gpt-3.5-turbo',
        // 让 ChatGPT 充当的角色为 assistant
        messages: [{ role: 'assistant', content }],
      });
    };

    state.chatGPT = chatGPT;
  };

  async function addMessageItem(message: ConversationList) {
    state.conversationList.push(message);
    await nextTick();
    $messageContainer.value.scrollTop = $messageContainer.value.scrollHeight;
    await nextTick();
    inputTextRef.value.focus();
  }
  async function open() {
    state.show = true;
    state.showConversation = true;
    await nextTick();
    // 自动布局只执行一次
    if (!state.x) {
      autoPosition();
    }
  }
  function close() {
    state.show = false;
    state.showConversation = false;
  }
  chatGptEmitter.on('open', () => {
    open();
  });
  chatGptEmitter.on('close', () => {
    close();
  });

  chatGptEmitter.on('send', async (e: any) => {
    open();

    setLoading(true);
    await addMessageItem({
      avatar: state.userAvatar,
      content: e.message,
    });
    const json: any = await chatGPTGetAnswer({
      question: e.message,
      temperature: '0.2',
    }).catch((error) => {
      console.log(`output->error`, error);
      return false;
    });
    setLoading(false);
    if (!json) {
      await addMessageItem({
        avatar: state.chatAvatar,
        content: '连接超时',
      });
      return;
    }
    await addMessageItem({
      avatar: state.chatAvatar,
      content: json.data.answer.content,
    });
  });
  // chatGptEmitter.on('show', async () => {
  //   state.show = true;
  //   state.showConversation = true;
  //   autoPosition();
  // });
  // chatGptEmitter.on('show-conversation', () => {
  //   state.showConversation = true;
  // });
  // chatGptEmitter.on('hide-conversation', () => {
  //   state.showConversation = false;
  // });

  function autoPosition() {
    state.x = (window.innerWidth - $el.value.offsetWidth) / 2;
    state.y = (window.innerHeight - $el.value.offsetHeight) / 2;
  }

  onMounted(async () => {
    // initOpenai();
    const element = document.querySelector('.conversation-comp');
    const at = new AnyTouch(element as HTMLElement);
  });
</script>

<style lang="less" scoped>
  .conversation-comp {
    width: 560px;
    position: fixed;
    // height: 490px;
    z-index: 1000;
    background: #fff;

    &.minus {
      width: 200px;
    }
    .arco-icon-close {
      margin-left: 20px;
      cursor: pointer;
    }
  }
  .touch-item {
    background: #eee;
    padding: 4px 10px;
    .tip {
      padding-left: 20px;
      color: #999;
    }

    .chat-img {
      width: 40px;
      height: 40px;
    }

    .chat-text {
      color: #000;
    }
  }
  .conversation-input {
    height: 40px;
  }

  .conversation-list {
    height: 400px;
    overflow: auto;
    padding: 0 20px 20px 10px;
    .item-wrap {
      margin: 16px 0 0 0;
    }

    .avatar-img {
      width: 40px;
      height: 40px;
    }

    .content-text {
      background: #eee;
      padding: 10px;
      margin: 4px 0 0 10px;
      border-radius: 4px;
    }
  }
</style>
