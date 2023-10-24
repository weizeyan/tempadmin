<template>
  <el-config-provider :locale="localeElement">
    <a-config-provider :locale="locale">
      <ChatGpt></ChatGpt>

      <router-view />
      <global-setting />
    </a-config-provider>
  </el-config-provider>
</template>

<script lang="ts" setup>
  import { computed } from 'vue';
  import enUS from '@arco-design/web-vue/es/locale/lang/en-us';
  import zhCN from '@arco-design/web-vue/es/locale/lang/zh-cn';
  import cn from 'element-plus/dist/locale/zh-cn.mjs';
  import en from 'element-plus/dist/locale/zh-cn.mjs';

  import GlobalSetting from '@/components/global-setting/index.vue';
  import useLocale from '@/hooks/locale';
  import ChatGpt from '@/components/chat-gpt/index.vue';

  const { currentLocale } = useLocale();
  const locale = computed(() => {
    switch (currentLocale.value) {
      case 'zh-CN':
        return zhCN;
      case 'en-US':
        return enUS;
      default:
        return enUS;
    }
  });
  const localeElement = computed(() => {
    switch (currentLocale.value) {
      case 'cn':
        return cn;
      case 'en-US':
        return en;
      default:
        return en;
    }
  });
</script>
