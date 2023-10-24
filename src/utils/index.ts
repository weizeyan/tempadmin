import axios from 'axios';
import dayJs from 'dayjs';
type TargetContext = '_self' | '_parent' | '_blank' | '_top';
type MergeRoutesType = {
  name: string;
  children: object[];
};

export const openWindow = (
  url: string,
  opts?: { target?: TargetContext; [key: string]: any }
) => {
  const { target = '_blank', ...others } = opts || {};
  window.open(
    url,
    target,
    Object.entries(others)
      .reduce((preValue: string[], curValue) => {
        const [key, value] = curValue;
        return [...preValue, `${key}=${value}`];
      }, [])
      .join(',')
  );
};

export const regexUrl = new RegExp(
  '^(?!mailto:)(?:(?:http|https|ftp)://)(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,})))|localhost)(?::\\d{2,5})?(?:(/|\\?|#)[^\\s]*)?$',
  'i'
);

export const mergeRoutes = (arr1: any[], arr2: any[]) => {
  const merged = [...arr1];

  arr2.forEach((obj2: MergeRoutesType) => {
    const obj1 = merged.find((_obj1) => _obj1.name === obj2.name);

    if (obj1) {
      obj1.children = mergeRoutes(obj1.children || [], obj2.children || []);
    } else {
      merged.push(obj2);
    }
  });

  return merged;
};

export const initMeta = (arr: any[]) => {
  arr.forEach((item: any) => {
    if (item.meta) {
      Object.keys(item.meta).forEach((key) => {
        if (item.meta[key] === 'true') {
          item.meta[key] = true;
        }

        if (item.meta[key] === 'false') {
          item.meta[key] = false;
        }

        if (
          [
            'hideInMenu',
            'hideChildrenInMenu',
            'noAffix',
            'ignoreCache',
          ].indexOf(key) > -1
        ) {
          if (!item.meta[key]) {
            item.meta[key] = false;
          }
        }

        if (['titleQuery'].indexOf(key) > -1) {
          if (!item.meta[key]) {
            item.meta[key] = '';
          }
        }
      });
    }

    if (item.children) {
      initMeta(item.children);
    }
  });
};

export function numberCurrency(value: number) {
  return value.toLocaleString('en-US');
}
export function sexFormat(sex: string) {
  const value = sex.toLocaleLowerCase();
  if (value === 'f') {
    return 'Female';
  }
  if (value === 'm') {
    return 'Male';
  }
  return sex;
}

export async function downloadFile(data: Blob | string, fileName = '') {
  let responseData: any = data instanceof Blob ? data : null;
  let name = fileName;
  if (!responseData) {
    const url = data as string;
    if (!fileName) {
      [name] = url.split('/').reverse();
      name = decodeURIComponent(name);
    }
    const res: any = await axios({
      method: 'get',
      url,
      responseType: 'blob',
    }).catch(() => false);
    if (res) {
      responseData = res.data;
    }
  }
  if (!responseData) {
    return;
  }
  const url = window.URL.createObjectURL(new Blob([responseData]));
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.setAttribute('download', name);
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}

export function smallDateFormat(dateStr: string) {
  if (!dateStr) {
    return dateStr;
  }
  return dayJs(dateStr, 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
}

export function base642Blob(data: string, contentType: string): Blob {
  const raw = window.atob(data);
  const { length } = raw;
  const arr = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    arr[i] = raw.charCodeAt(i);
  }
  const blob = new Blob([arr], { type: contentType });
  return blob;
}
export function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
    /[xy]/g,
    function replace(c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
}

export function openWin(
  url: string,
  name: string,
  width: number,
  height: number
) {
  const { availTop, availLeft, availHeight, availWidth } = window.screen as any;
  let pageTop = (availHeight - width) / 2; // 窗口的垂直位置
  let pageLeft = (availWidth - height) / 2; // 窗口的水平位置;
  if (navigator.userAgent.indexOf('Chrome') !== -1) {
    // 兼容chrome的bug
    pageTop += availTop; // 距顶偏移值
    pageLeft += availLeft; // 距左偏移值
  }
  return window.open(
    url,
    name,
    `width=${width},height=${height},top=${pageTop},left=${pageLeft}`
  );
}

export default null;
