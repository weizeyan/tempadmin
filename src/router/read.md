## 请严格遵守

业务路由放置于 modules 目录下

创建路由的 name 遵守大驼峰写法

务必确保 子路由的 name 由上层路由递进而来 如 System SystemRole SystemRoleDetail

同级路由请确保 有统一的父路由和同样的大驼峰写法 如 SystemRole 和 SystemUser 父路由为 System

meta 中各项含义 参照 [路由和菜单](https://arco.design/vue/docs/pro/routes-and-menu)
