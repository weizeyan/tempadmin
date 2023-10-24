import type { RouteRecordNormalized } from 'vue-router';

const modules = import.meta.glob('./modules/*.ts', { eager: true });
// const externalModules = import.meta.glob('./externalModules/*.ts', {
//   eager: true,
// });
const externalModules = [] as string[];

function setNameAndKey(list: RouteRecordNormalized[]) {
  list.forEach((item: any) => {
    if (item.children && item.children.length > 0) {
      setNameAndKey(item.children);
    }

    if (item.meta) {
      item.title = item.meta.locale;
      item.key = item.name;
    }
  });
}

function formatModules(_modules: any, result: RouteRecordNormalized[]) {
  Object.keys(_modules).forEach((key) => {
    const defaultModule = _modules[key].default;
    if (!defaultModule) return;
    const moduleList = Array.isArray(defaultModule)
      ? [...defaultModule]
      : [defaultModule];
    result.push(...moduleList);
  });

  setNameAndKey(result);

  return result;
}

export const appRoutes: RouteRecordNormalized[] = formatModules(modules, []);

export const appExternalRoutes: RouteRecordNormalized[] = formatModules(
  externalModules,
  []
);
