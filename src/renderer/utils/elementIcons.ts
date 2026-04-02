import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { markRaw, type Component, createApp, h } from 'vue';

export interface IconInfo {
  name: string;
  component: Component;
}

// 缓存图标列表
let cachedIcons: IconInfo[] | null = null;

// SVG 缓存
const svgCache: Record<string, string> = {};

/**
 * 从 Vue 组件提取 SVG 字符串
 */
function extractSvgFromComponent(component: Component): string {
  const tempDiv = document.createElement('div');
  document.body.appendChild(tempDiv);

  const app = createApp({
    render: () => h(component as any, { size: 16, color: 'currentColor' }),
  });
  app.mount(tempDiv);

  // 获取 SVG 元素
  const svgElement = tempDiv.querySelector('svg');
  const svg = svgElement ? svgElement.outerHTML : tempDiv.innerHTML;

  app.unmount();
  document.body.removeChild(tempDiv);

  return svg;
}

/**
 * 获取所有 Element Plus 图标
 */
export function getAllElementPlusIcons(): IconInfo[] {
  if (cachedIcons) return cachedIcons;

  cachedIcons = [];

  for (const [name, component] of Object.entries(ElementPlusIconsVue)) {
    cachedIcons.push({
      name,
      component: markRaw(component as Component),
    });
  }

  return cachedIcons;
}

/**
 * 搜索图标
 */
export function searchIcons(keyword: string): IconInfo[] {
  const allIcons = getAllElementPlusIcons();
  if (!keyword) return allIcons;

  const lowerKeyword = keyword.toLowerCase();
  return allIcons.filter((icon) =>
    icon.name.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 获取图标的 SVG 字符串（带缓存）
 */
export function getIconSvg(iconName: string): string {
  if (svgCache[iconName]) {
    return svgCache[iconName];
  }

  const component = (ElementPlusIconsVue as any)[iconName];
  if (!component) return '';

  const svg = extractSvgFromComponent(component);
  svgCache[iconName] = svg;
  return svg;
}

/**
 * 注册图标到 simple-mind-map 实例
 * @param mindMapInstance simple-mind-map 实例
 * @param iconName Element Plus 图标名称
 * @returns 注册后的图标 key（用于 setIcon）
 */
export function registerIconToMindMap(mindMapInstance: any, iconName: string): string {
  // simple-mind-map 的 iconList 格式：type_name
  // 例如：priority_1, seal_success 等
  // 我们使用 element_plus 作为 type，iconName 作为 name
  const iconKey = `ep_${iconName}`;

  // 注意：需要修改 mindMap.opt.iconList，而不是 mindMap.iconList
  // 因为渲染时读取的是 opt.iconList
  if (!mindMapInstance.opt.iconList) {
    mindMapInstance.opt.iconList = [];
  }

  // 获取或创建 element_plus 分组
  let group = mindMapInstance.opt.iconList.find((g: any) => g.type === 'ep');

  if (!group) {
    group = {
      name: 'Element Plus 图标',
      type: 'ep',
      list: [],
    };
    mindMapInstance.opt.iconList.push(group);
  }

  // 检查图标是否已在分组中
  const iconExists = group.list.some((icon: any) => icon.name === iconName);
  if (!iconExists) {
    // 获取 SVG 并转换为 data URL
    const svg = getIconSvg(iconName);
    // 将 SVG 转换为 data URL 格式
    const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    group.list.push({
      name: iconName,
      icon: dataUrl,
    });
  }

  return iconKey;
}
