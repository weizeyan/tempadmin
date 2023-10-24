<template>
  <div class="login-form-wrapper">
    <div class="login-form-title">Prosper CS Portal</div>
    <div class="login-form-sub-title">CS Portal Admin</div>

    <div class="flex-start-center">
      <div class="feishu-wrap">
        <div class="feishu-title">飞书扫码登录</div>

        <div v-if="errorType === 'feishu'" class="error-wrap">
          <img
            src="https://bhstatics.oss-cn-shanghai.aliyuncs.com/prosper-portal-admin-arco/website-qrcode.png"
            alt=""
            class="error-code-img"
          />

          <div class="over-flow psa-center"></div>

          <a-button
            class="retry-btn psa-center"
            type="primary"
            @click="onReTryFeishu"
            >点击重试</a-button
          >
        </div>

        <div
          v-if="!errorType || errorType === 'common'"
          id="login-container"
        ></div>
      </div>

      <template v-if="envMode === 'development' || envMode === 'test'">
        <div class="divider"></div>

        <div class="login-wrap">
          <div class="title-1">账号密码登录</div>
          <a-form
            ref="loginForm"
            :model="userInfo"
            class="login-form"
            layout="vertical"
            @submit="handleSubmit"
          >
            <a-form-item
              field="username"
              :rules="[{ required: true, message: '用户名不能为空' }]"
              :validate-trigger="['change', 'blur']"
              hide-label
            >
              <a-input v-model="userInfo.username" placeholder="请输入">
                <template #prefix>
                  <icon-user />
                </template>
              </a-input>
            </a-form-item>
            <a-form-item
              field="password"
              :rules="[{ required: true, message: '密码不能为空' }]"
              :validate-trigger="['change', 'blur']"
              hide-label
            >
              <a-input-password
                v-model="userInfo.password"
                placeholder="请输入"
                allow-clear
              >
                <template #prefix>
                  <icon-lock />
                </template>
              </a-input-password>
            </a-form-item>
            <a-space :size="16" direction="vertical">
              <a-button
                type="primary"
                html-type="submit"
                long
                :loading="loading"
              >
                登录
              </a-button>
            </a-space>
          </a-form>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { ValidatedError } from '@arco-design/web-vue/es/form/interface';
  // import { useI18n } from 'vue-i18n';
  import { useStorage } from '@vueuse/core';
  import { useUserStore, useTabBarStore } from '@/store';
  import useLoading from '@/hooks/loading';
  import type { LoginData } from '@/api/user';

  const envMode = import.meta.env.MODE;

  const router = useRouter();
  const route = useRoute();
  // const { t } = useI18n();
  const errorType = ref('');
  const errorMessage = ref('');
  const { loading, setLoading } = useLoading();
  const userStore = useUserStore();
  const tabBarStore = useTabBarStore();

  // const loginConfig = useStorage('login-config', {
  //   rememberPassword: true,
  //   username: 'admin', // 演示默认值
  //   password: 'admin', // demo default value
  // });

  const loginConfig = {};

  const userInfo = reactive({
    username: '',
    password: '',
  });

  const afterLoginHandler = async () => {
    await userStore.info();
    const { redirect, ...othersQuery } = router.currentRoute.value.query;
    tabBarStore.resetTabList();
    router.push({
      // name: (redirect as string) || 'DashboardIndex',
      name: 'DashboardIndex',
      // query: {
      //   ...othersQuery,
      // },
    });
    Message.success('登录成功');
    // const { rememberPassword } = loginConfig.value;
    // const { username, password } = values;

    // 实际生产环境需要进行加密存储。
    // The actual production environment requires encrypted storage.
    // loginConfig.value.username = rememberPassword ? username : '';
    // loginConfig.value.password = rememberPassword ? password : '';
  };

  const handleSubmit = async ({
    errors,
    values,
  }: {
    errors: Record<string, ValidatedError> | undefined;
    values: Record<string, any>;
  }) => {
    if (loading.value) return;
    if (!errors) {
      setLoading(true);
      try {
        await userStore.login(values as LoginData);
        afterLoginHandler();
      } catch (err) {
        errorType.value = 'common';
        errorMessage.value = (err as Error).message;
      } finally {
        setLoading(false);
      }
    }
  };

  const setRememberPassword = (value: boolean) => {
    // loginConfig.value.rememberPassword = value;
  };

  const onReTryFeishu = () => {
    window.location.href = import.meta.env.VITE_FEISHU_LOGIN_REDIRECT_URL;
  };

  const handleFeishuLogin = async () => {
    setLoading(true);
    try {
      await userStore.loginFeishu({
        code: (route.query.code as string) || '',
      });

      afterLoginHandler();
    } catch (err) {
      errorType.value = 'feishu';
      errorMessage.value = (err as Error).message;
    } finally {
      setLoading(false);
    }
  };

  const initFeishuLogin = () => {
    errorMessage.value = '';
    const redirectUrl = import.meta.env.VITE_FEISHU_LOGIN_REDIRECT_URL;

    const goto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=cli_a4b9227e4c63900d&redirect_uri=${redirectUrl}&response_type=code&state=STATE`;

    const QRLoginObj = window.QRLogin({
      id: 'login-container',
      goto,
      width: '200',
      height: '200',
      style: 'width:300px;height:300px;border: none;', // 可选的，二维码html标签的style属性
    });

    const handleMessage = (event: any) => {
      const origin = event.origin || {};

      // 使用 matchOrigin 方法来判断 message 来自页面的url是否合法
      if (QRLoginObj.matchOrigin(origin)) {
        const loginTmpCode = event.data;
        // 在授权页面地址上拼接上参数 tmp_code，并跳转
        window.location.href = `${goto}&tmp_code=${loginTmpCode}`;
      }
    };

    if (typeof window.addEventListener !== 'undefined') {
      window.addEventListener('message', handleMessage, false);
    } else if (typeof window.attachEvent !== 'undefined') {
      window.attachEvent('onmessage', handleMessage);
    }
  };

  onMounted(() => {
    if (route.query.code) {
      handleFeishuLogin();
    } else {
      initFeishuLogin();
    }
  });
</script>

<style lang="less" scoped>
  .divider {
    width: 1px;
    height: 320px;
    background: #ddd;
    margin: 0 60px 0 40px;
  }

  .feishu-wrap {
    .feishu-title {
      font-size: 16px;
      text-align: center;
    }

    .error-wrap {
      position: relative;
    }

    .over-flow {
      width: 250px;
      height: 250px;
      background: rgba(0, 0, 0, 0.5);
    }

    .error-code-img {
      width: 240px;
      height: 240px;
      margin: 30px;
    }
  }

  .login-form {
    &-wrapper {
      width: 700px;
    }

    &-title {
      color: var(--color-text-1);
      font-weight: 500;
      font-size: 40px;
      line-height: 40px;
      text-align: center;
      margin-bottom: 20px;
    }

    &-sub-title {
      color: var(--color-text-3);
      font-size: 16px;
      line-height: 24px;
      text-align: center;
      margin-bottom: 60px;
    }

    &-error-msg {
      height: 32px;
      color: rgb(var(--red-6));
      line-height: 32px;
      text-align: center;
    }

    &-password-actions {
      display: flex;
      justify-content: space-between;
    }

    &-register-btn {
      color: var(--color-text-3) !important;
    }
  }

  #login-container {
    width: 300px;
    height: 300px;
  }

  .login-wrap {
    flex: 1;

    .title-1 {
      font-size: 16px;
      margin-bottom: 80px;
      text-align: center;
    }
  }
</style>
