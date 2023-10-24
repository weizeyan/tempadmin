export interface TagProps {
  title: string;
  titleQuery?: string;
  name: string;
  fullPath: string;
  query?: any;
  ignoreCache?: boolean;
  customTitle?: string;
}

export interface TabBarState {
  tagList: TagProps[];
  cacheTabList: Set<string>;
}
