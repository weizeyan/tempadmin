import { createPinia } from 'pinia';
import useAppStore from './modules/app';
import useUserStore from './modules/user';
import useTabBarStore from './modules/tab-bar';
import useMemberViewStore from './modules/member-view';
const pinia = createPinia();

export { useAppStore, useUserStore, useTabBarStore, useMemberViewStore };
export default pinia;
