import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Message, Modal } from '@arco-design/web-vue';
import { useUserStore } from '@/store';
import { getToken } from '@/utils/auth';
export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
  message: string;
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // let each request carry token
    // this example using the JWT token
    // Authorization is a custom headers key
    // please modify it according to the actual situation
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers['x-auth-token'] = `${token}`;
    }
    // console.log('req config', config);
    return config;
  },
  (error) => {
    // do something
    return Promise.reject(error);
  }
);
// add response interceptors
axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const { headers } = response;
    const res = response.data;
    // 非json类型的contentType 直接返回response对象
    if (
      headers['content-type'].toLowerCase().indexOf('application/json') === -1
    ) {
      return response;
    }
    if (typeof res.code === 'undefined') {
      return res;
    }
    if (res.code !== 200) {
      Message.error({
        content: res.message || 'Error',
        duration: 5 * 1000,
      });
      // 登录失效
      if ([401].includes(res.code)) {
        if (window.location.href.indexOf('/login') < 0) {
          const logout = async () => {
            const userStore = useUserStore();
            await userStore.logout();
            window.location.reload();
          };
          logout();
        }

        // Modal.error({
        //   title: '登录失效',
        //   content: '请重新登录',
        //   okText: '重新登录',
        //   async onOk() {
        //     const userStore = useUserStore();
        //     await userStore.logout();
        //     window.location.reload();
        //   },
        // });
      }
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return res;
  },
  (error) => {
    if (error.message === 'Network Error') {
      Message.error({
        content: error.message || '网络连接异常',
        duration: 5 * 1000,
      });
    } else {
      Message.error({
        content: error.message || '请求错误',
        duration: 5 * 1000,
      });
    }

    return Promise.reject(error);
  }
);
