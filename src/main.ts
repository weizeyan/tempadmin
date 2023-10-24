import { createApp } from 'vue';
import ArcoVue from '@arco-design/web-vue';
import ArcoVueIcon from '@arco-design/web-vue/es/icon';
import { QuillEditor } from '@vueup/vue-quill';
import globalComponents from '@/components';
import * as Sentry from '@sentry/vue';
import router from './router';
import store from './store';
import i18n from './locale';
import directive from './directive';

import '@vueup/vue-quill/dist/vue-quill.snow.css';
// import './mock';
import App from './App.vue';
// import '@arco-design/web-vue/dist/arco.css';
import '@arco-themes/vue-prosper-arco/index.less';
// import '@arco-themes/vue-prosper-arco/css/arco.css';
import '@/assets/style/global.less';
import '@/api/interceptor';
import '@/editor';

document.body.removeAttribute('arco-theme');

const app = createApp(App);

app.use(ArcoVue, {});
app.use(ArcoVueIcon);

app.use(router);
app.use(store);
app.use(i18n);
app.use(globalComponents);
app.use(directive);
app.component('QuillEditor', QuillEditor);

app.mount('#app');

// Sentry.init({
//   app,
//   dsn: 'https://ec4b9bedc1874301b3d4128fe3fa9c36@o4505033128935424.ingest.sentry.io/4505349878382592',
//   integrations: [
//     new Sentry.BrowserTracing({
//       // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
//       tracePropagationTargets: [
//         'localhost',
//         '161.189.107.168:10100',
//         '52.80.211.94:10100',
//       ],
//       routingInstrumentation: Sentry.vueRouterInstrumentation(router),
//     }),
//     new Sentry.Replay(),
//   ],
//   environment: import.meta.env.MODE,
//   release: import.meta.env.MODE,
//   // Performance Monitoring
//   tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
//   // Session Replay
//   replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
//   replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
// });
