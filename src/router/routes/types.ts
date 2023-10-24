import { defineComponent } from 'vue';
import type { RouteMeta, NavigationGuard } from 'vue-router';

export type Component<T = any> =
  | ReturnType<typeof defineComponent>
  | (() => Promise<typeof import('*.vue')>)
  | (() => Promise<T>);

export type myRouteMeta = RouteMeta & {
  titleQuery?: string;
};

export interface AppRouteRecordRaw {
  path: string;
  name?: string | symbol;
  meta?: myRouteMeta;
  redirect?: string;
  component?: Component | string;
  children?: AppRouteRecordRaw[];
  alias?: string | string[];
  props?: Record<string, any>;
  beforeEnter?: NavigationGuard | NavigationGuard[];
  fullPath?: string;
  title?: string;
  disabled?: boolean;
}
