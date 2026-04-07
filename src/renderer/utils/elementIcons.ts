import { markRaw, type Component } from 'vue';
import { Icon } from '@iconify/vue';

export interface IconInfo {
  name: string;
  icon: string; // Iconify icon name, e.g. "noto:star"
}

// 精选的 Noto 彩色图标列表
const NOTO_ICONS: IconInfo[] = [
  // 表情
  { name: 'smile', icon: 'noto:smiling-face' },
  { name: 'grinning', icon: 'noto:grinning-face' },
  { name: 'laugh', icon: 'noto:grinning-face-with-smiling-eyes' },
  { name: 'wink', icon: 'noto:winking-face' },
  { name: 'blush', icon: 'noto:smiling-face-with-heart-eyes' },
  { name: 'love', icon: 'noto:smiling-face-with-hearts' },
  { name: 'kiss', icon: 'noto:face-blowing-a-kiss' },
  { name: 'thinking', icon: 'noto:thinking-face' },
  { name: 'cool', icon: 'noto:smiling-face-with-sunglasses' },
  { name: 'star-struck', icon: 'noto:star-struck' },
  { name: 'party', icon: 'noto:partying-face' },
  { name: 'celebrate', icon: 'noto:party-popper' },
  { name: 'sleep', icon: 'noto:sleeping-face' },
  { name: 'tired', icon: 'noto:tired-face' },
  { name: 'cry', icon: 'noto:crying-face' },
  { name: 'sad', icon: 'noto:loudly-crying-face' },
  { name: 'angry', icon: 'noto:angry-face' },
  { name: 'fire', icon: 'noto:face-with-steam-from-nose' },

  // 手势
  { name: 'thumbs-up', icon: 'noto:thumbs-up' },
  { name: 'thumbs-down', icon: 'noto:thumbs-down' },
  { name: 'clap', icon: 'noto:clapping-hands' },
  { name: 'wave', icon: 'noto:waving-hand' },
  { name: 'ok', icon: 'noto:ok-hand' },
  { name: 'peace', icon: 'noto:victory-hand' },
  { name: 'fingers-crossed', icon: 'noto:crossed-fingers' },
  { name: 'rock', icon: 'noto:sign-of-the-horns' },
  { name: 'call-me', icon: 'noto:call-me-hand' },
  { name: 'point-up', icon: 'noto:index-pointing-up' },
  { name: 'point-down', icon: 'noto:backhand-index-pointing-down' },
  { name: 'point-left', icon: 'noto:backhand-index-pointing-left' },
  { name: 'point-right', icon: 'noto:backhand-index-pointing-right' },
  { name: 'pray', icon: 'noto:folded-hands' },
  { name: 'muscle', icon: 'noto:flexed-biceps' },
  { name: 'writing', icon: 'noto:writing-hand' },

  // 星星与符号
  { name: 'star', icon: 'noto:star' },
  { name: 'star2', icon: 'noto:glowing-star' },
  { name: 'sparkles', icon: 'noto:sparkles' },
  { name: 'glitter', icon: 'noto:confetti-ball' },
  { name: 'fire2', icon: 'noto:fire' },
  { name: 'heart', icon: 'noto:red-heart' },
  { name: 'heart2', icon: 'noto:sparkling-heart' },
  { name: 'broken-heart', icon: 'noto:broken-heart' },
  { name: 'diamond', icon: 'noto:gem-stone' },
  { name: 'crown', icon: 'noto:crown' },
  { name: 'trophy', icon: 'noto:trophy' },
  { name: 'medal', icon: 'noto:sports-medal' },
  { name: 'check', icon: 'noto:check-mark-button' },
  { name: 'cross', icon: 'noto:cross-mark' },
  { name: 'warning', icon: 'noto:warning' },
  { name: 'info', icon: 'noto:information' },
  { name: 'question', icon: 'noto:red-question-mark' },
  { name: 'exclamation', icon: 'noto:red-exclamation-mark' },
  { name: 'bulb', icon: 'noto:light-bulb' },
  { name: 'rocket', icon: 'noto:rocket' },
  { name: 'target', icon: 'noto:bullseye' },
  { name: 'link', icon: 'noto:link' },
  { name: 'chain', icon: 'noto:link' },
  { name: 'lock', icon: 'noto:locked' },
  { name: 'unlock', icon: 'noto:unlocked' },
  { name: 'key', icon: 'noto:key' },
  { name: 'pin', icon: 'noto:pushpin' },
  { name: 'bookmark', icon: 'noto:bookmark' },
  { name: 'flag2', icon: 'noto:triangular-flag' },

  // 数字与优先级
  { name: '1', icon: 'noto:keycap-1' },
  { name: '2', icon: 'noto:keycap-2' },
  { name: '3', icon: 'noto:keycap-3' },
  { name: '4', icon: 'noto:keycap-4' },
  { name: '5', icon: 'noto:keycap-5' },
  { name: '6', icon: 'noto:keycap-6' },
  { name: '7', icon: 'noto:keycap-7' },
  { name: '8', icon: 'noto:keycap-8' },
  { name: '9', icon: 'noto:keycap-9' },
  { name: '0', icon: 'noto:keycap-0' },
  { name: 'a', icon: 'noto:input-latin-uppercase' },
  { name: 'b', icon: 'noto:input-latin-lowercase' },
  { name: 'ab', icon: 'noto:input-latin-letters' },

  // 箭头
  { name: 'arrow-up', icon: 'noto:up-arrow' },
  { name: 'arrow-down', icon: 'noto:down-arrow' },
  { name: 'arrow-left', icon: 'noto:left-arrow' },
  { name: 'arrow-right', icon: 'noto:right-arrow' },
  { name: 'up-down', icon: 'noto:up-down-arrow' },
  { name: 'left-right', icon: 'noto:left-right-arrow' },
  { name: 'refresh', icon: 'noto:counterclockwise-arrows-button' },
  { name: 'repeat', icon: 'noto:repeat-button' },
  { name: 'shuffle', icon: 'noto:shuffle-tracks-button' },
  { name: 'play', icon: 'noto:play-button' },
  { name: 'pause', icon: 'noto:pause-button' },
  { name: 'stop', icon: 'noto:stop-button' },
  { name: 'fast-forward', icon: 'noto:fast-forward-button' },
  { name: 'rewind', icon: 'noto:fast-reverse-button' },

  // 文件与文件夹
  { name: 'file', icon: 'noto:page-facing-up' },
  { name: 'folder', icon: 'noto:file-folder' },
  { name: 'folder-open', icon: 'noto:open-file-folder' },
  { name: 'clipboard', icon: 'noto:clipboard' },
  { name: 'notebook', icon: 'noto:notebook' },
  { name: 'book', icon: 'noto:open-book' },
  { name: 'calendar', icon: 'noto:calendar' },
  { name: 'new', icon: 'noto:spiral-notepad' },

  // 通讯
  { name: 'fax', icon: 'noto:fax-machine' },
  { name: 'email', icon: 'noto:e-mail' },
  { name: 'inbox', icon: 'noto:inbox-tray' },
  { name: 'outbox', icon: 'noto:outbox-tray' },
  { name: 'phone', icon: 'noto:telephone' },
  { name: 'mobile', icon: 'noto:mobile-phone' },
  { name: 'message', icon: 'noto:speech-balloon' },
  { name: 'chat', icon: 'noto:left-speech-bubble' },
  { name: 'bell', icon: 'noto:bell' },
  { name: 'megaphone', icon: 'noto:megaphone' },

  // 媒体
  { name: 'camera', icon: 'noto:camera' },
  { name: 'video', icon: 'noto:video-camera' },
  { name: 'microphone', icon: 'noto:microphone' },
  { name: 'headphone', icon: 'noto:headphone' },
  { name: 'music', icon: 'noto:musical-note' },
  { name: 'image', icon: 'noto:framed-picture' },
  { name: 'palette', icon: 'noto:artist-palette' },
  { name: 'paint', icon: 'noto:paintbrush' },

  // 工具
  { name: 'pencil', icon: 'noto:pencil' },
  { name: 'pen', icon: 'noto:fountain-pen' },
  { name: 'edit', icon: 'noto:memo' },
  { name: 'trash', icon: 'noto:wastebasket' },
  { name: 'search', icon: 'noto:magnifying-glass-tilted-left' },
  { name: 'filter', icon: 'noto:down-left-arrow' },
  { name: 'sort', icon: 'noto:up-down-arrow' },
  { name: 'settings', icon: 'noto:gear' },
  { name: 'wrench', icon: 'noto:wrench' },
  { name: 'hammer', icon: 'noto:hammer' },
  { name: 'toolbox', icon: 'noto:toolbox' },
  { name: 'magnifier', icon: 'noto:magnifying-glass-tilted-right' },

  // 设备
  { name: 'computer', icon: 'noto:desktop-computer' },
  { name: 'laptop', icon: 'noto:laptop' },
  { name: 'keyboard', icon: 'noto:keyboard' },
  { name: 'mouse', icon: 'noto:computer-mouse' },
  { name: 'monitor', icon: 'noto:desktop-computer' },
  { name: 'printer', icon: 'noto:printer' },

  // 网络
  { name: 'globe', icon: 'noto:globe-showing-americas' },
  { name: 'wifi', icon: 'noto:antenna-bars' },
  { name: 'cloud', icon: 'noto:cloud' },
  { name: 'download', icon: 'noto:down-arrow' },
  { name: 'upload', icon: 'noto:up-arrow' },
  { name: 'share', icon: 'noto:handshake' },

  // 时间
  { name: 'clock', icon: 'noto:alarm-clock' },
  { name: 'watch', icon: 'noto:watch' },
  { name: 'hourglass', icon: 'noto:hourglass-done' },
  { name: 'timer', icon: 'noto:timer-clock' },

  // 金钱
  { name: 'money', icon: 'noto:money-bag' },
  { name: 'dollar', icon: 'noto:dollar-banknote' },
  { name: 'euro', icon: 'noto:euro-banknote' },
  { name: 'yen', icon: 'noto:yen-banknote' },
  { name: 'pound', icon: 'noto:pound-banknote' },
  { name: 'coin', icon: 'noto:coin' },
  { name: 'credit-card', icon: 'noto:credit-card' },
  { name: 'chart', icon: 'noto:chart-increasing' },
  { name: 'chart-down', icon: 'noto:chart-decreasing' },

  // 购物
  { name: 'cart', icon: 'noto:shopping-cart' },
  { name: 'bag', icon: 'noto:shopping-bags' },
  { name: 'gift', icon: 'noto:wrapped-gift' },
  { name: 'package', icon: 'noto:package' },

  // 食物
  { name: 'coffee', icon: 'noto:hot-beverage' },
  { name: 'tea', icon: 'noto:teacup-without-handle' },
  { name: 'pizza', icon: 'noto:pizza' },
  { name: 'burger', icon: 'noto:hamburger' },
  { name: 'cake', icon: 'noto:shortcake' },
  { name: 'ice-cream', icon: 'noto:ice-cream' },
  { name: 'apple', icon: 'noto:red-apple' },
  { name: 'banana', icon: 'noto:banana' },
  { name: 'watermelon', icon: 'noto:watermelon' },
  { name: 'grape', icon: 'noto:grapes' },
  { name: 'bread', icon: 'noto:bread' },
  { name: 'wine', icon: 'noto:wine-glass' },
  { name: 'beer', icon: 'noto:beer-mug' },

  // 动物
  { name: 'dog', icon: 'noto:dog-face' },
  { name: 'cat', icon: 'noto:cat-face' },
  { name: 'mouse2', icon: 'noto:mouse-face' },
  { name: 'rabbit', icon: 'noto:rabbit-face' },
  { name: 'bear', icon: 'noto:bear' },
  { name: 'panda', icon: 'noto:panda' },
  { name: 'koala', icon: 'noto:koala' },
  { name: 'fox', icon: 'noto:fox' },
  { name: 'lion', icon: 'noto:lion' },
  { name: 'tiger', icon: 'noto:tiger' },
  { name: 'cow', icon: 'noto:cow-face' },
  { name: 'pig', icon: 'noto:pig-face' },
  { name: 'frog', icon: 'noto:frog' },
  { name: 'monkey', icon: 'noto:monkey' },
  { name: 'chicken', icon: 'noto:chicken' },
  { name: 'bird', icon: 'noto:bird' },
  { name: 'penguin', icon: 'noto:penguin' },
  { name: 'butterfly', icon: 'noto:butterfly' },
  { name: 'bee', icon: 'noto:honeybee' },
  { name: 'bug', icon: 'noto:bug' },
  { name: 'fish', icon: 'noto:fish' },
  { name: 'dolphin', icon: 'noto:dolphin' },
  { name: 'whale', icon: 'noto:whale' },
  { name: 'octopus', icon: 'noto:octopus' },

  // 自然
  { name: 'sun', icon: 'noto:sun' },
  { name: 'moon', icon: 'noto:crescent-moon' },
  { name: 'star-night', icon: 'noto:star' },
  { name: 'cloud2', icon: 'noto:cloud' },
  { name: 'rain', icon: 'noto:cloud-with-rain' },
  { name: 'snow', icon: 'noto:cloud-with-snow' },
  { name: 'lightning', icon: 'noto:cloud-with-lightning' },
  { name: 'rose', icon: 'noto:rose' },
  { name: 'tulip', icon: 'noto:tulip' },
  { name: 'palm', icon: 'noto:palm-tree' },
  { name: 'cactus', icon: 'noto:cactus' },
  { name: 'leaf', icon: 'noto:leaf-fluttering-in-wind' },
  { name: 'maple', icon: 'noto:maple-leaf' },
  { name: 'four-leaf', icon: 'noto:four-leaf-clover' },
  { name: 'water', icon: 'noto:water-wave' },
  { name: 'mountain', icon: 'noto:mountain' },
  { name: 'volcano', icon: 'noto:volcano' },
  { name: 'earth', icon: 'noto:globe-showing-americas' },

  // 交通
  { name: 'car', icon: 'noto:racing-car' },
  { name: 'taxi', icon: 'noto:taxi' },
  { name: 'bus', icon: 'noto:bus' },
  { name: 'train', icon: 'noto:train' },
  { name: 'metro', icon: 'noto:locomotive' },
  { name: 'airplane', icon: 'noto:airplane' },
  { name: 'ship', icon: 'noto:ship' },
  { name: 'bicycle', icon: 'noto:bicycle' },
  { name: 'motorcycle', icon: 'noto:motorcycle' },
  { name: 'rocket2', icon: 'noto:rocket' },
  { name: 'satellite', icon: 'noto:satellite' },

  // 建筑
  { name: 'home', icon: 'noto:house' },
  { name: 'office', icon: 'noto:office-building' },
  { name: 'school', icon: 'noto:school' },
  { name: 'hospital', icon: 'noto:hospital' },
  { name: 'bank', icon: 'noto:bank' },
  { name: 'hotel', icon: 'noto:hotel' },
  { name: 'church', icon: 'noto:church' },
  { name: 'castle', icon: 'noto:castle' },
  { name: 'city', icon: 'noto:cityscape' },

  // 运动与游戏
  { name: 'basketball', icon: 'noto:basketball' },
  { name: 'tennis', icon: 'noto:tennis' },
  { name: 'bowling', icon: 'noto:bowling' },
  { name: 'ping-pong', icon: 'noto:ping-pong' },
  { name: 'ski', icon: 'noto:skier' },
  { name: 'swim', icon: 'noto:person-swimming' },
  { name: 'run', icon: 'noto:person-running' },
  { name: 'bike', icon: 'noto:person-biking' },
  { name: 'gym', icon: 'noto:person-lifting-weights' },
  { name: 'game', icon: 'noto:video-game' },
  { name: 'dice', icon: 'noto:game-die' },
  { name: 'puzzle', icon: 'noto:puzzle-piece' },
  { name: 'chess', icon: 'noto:chess-pawn' },
  { name: 'cards', icon: 'noto:flower-playing-cards' },

  // 天气
  { name: 'sunny', icon: 'noto:sun-with-face' },
  { name: 'cloudy', icon: 'noto:sun-behind-cloud' },
  { name: 'rainy', icon: 'noto:cloud-with-rain' },
  { name: 'stormy', icon: 'noto:cloud-with-lightning-and-rain' },
  { name: 'snowy', icon: 'noto:cloud-with-snow' },
  { name: 'windy', icon: 'noto:wind-face' },
  { name: 'hot', icon: 'noto:thermometer' },
  { name: 'cold', icon: 'noto:snowflake' },

  // 其他
  { name: 'glasses', icon: 'noto:glasses' },
  { name: 'tie', icon: 'noto:necktie' },
  { name: 'shirt', icon: 'noto:t-shirt' },
  { name: 'jeans', icon: 'noto:jeans' },
  { name: 'dress', icon: 'noto:dress' },
  { name: 'shoe', icon: 'noto:running-shoe' },
  { name: 'hat', icon: 'noto:billed-cap' },
  { name: 'ring', icon: 'noto:ring' },
  { name: 'lipstick', icon: 'noto:lipstick' },
  { name: 'barber', icon: 'noto:barber-pole' },
  { name: 'syringe', icon: 'noto:syringe' },
  { name: 'pill', icon: 'noto:pill' },
  { name: 'bandage', icon: 'noto:adhesive-bandage' },
  { name: 'recycle', icon: 'noto:recycling-symbol' },
  { name: 'battery', icon: 'noto:battery' },
  { name: 'plug', icon: 'noto:electric-plug' },
  { name: 'bulb2', icon: 'noto:light-bulb' },
  { name: 'candle', icon: 'noto:candle' },
  { name: 'bomb', icon: 'noto:bomb' },
  { name: 'poo', icon: 'noto:pile-of-poo' },
  { name: 'ghost', icon: 'noto:ghost' },
  { name: 'skull', icon: 'noto:skull' },
  { name: 'alien', icon: 'noto:alien' },
  { name: 'robot', icon: 'noto:robot' },
  { name: 'snowman', icon: 'noto:snowman' },

  // 布局
  { name: 'grid', icon: 'noto:layout-grid' },
];

// 缓存图标列表
let cachedIcons: IconInfo[] | null = null;

/**
 * 获取所有彩色图标
 */
export function getAllElementPlusIcons(): IconInfo[] {
  if (cachedIcons) return cachedIcons;
  cachedIcons = NOTO_ICONS;
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
    icon.name.toLowerCase().includes(lowerKeyword) ||
    icon.icon.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * 获取图标的 SVG URL（用于 simple-mind-map）
 */
export function getIconSvgUrl(iconName: string): string {
  const icon = NOTO_ICONS.find(i => i.name === iconName);
  if (!icon) return '';
  // 返回本地 SVG 文件路径
  const iconFileName = icon.icon.replace('noto:', '');
  return new URL(`../assets/icons/${iconFileName}.svg`, import.meta.url).href;
}

/**
 * 获取本地图标 URL
 */
export function getLocalIconUrl(iconName: string): string {
  // 处理 noto: 前缀的图标
  if (iconName.startsWith('noto:')) {
    const iconFileName = iconName.replace('noto:', '');
    return new URL(`../assets/icons/${iconFileName}.svg`, import.meta.url).href;
  }
  // 其他图标暂时返回空
  return '';
}

/**
 * 注册图标到 simple-mind-map 实例
 * @param mindMapInstance simple-mind-map 实例
 * @param iconName 图标名称
 * @returns 注册后的图标 key（用于 setIcon）
 */
export async function registerIconToMindMap(mindMapInstance: any, iconName: string): Promise<string> {
  const iconKey = `noto_${iconName}`;

  if (!mindMapInstance.opt.iconList) {
    mindMapInstance.opt.iconList = [];
  }

  // 获取或创建 noto 分组
  let group = mindMapInstance.opt.iconList.find((g: any) => g.type === 'noto');

  if (!group) {
    group = {
      name: '彩色图标',
      type: 'noto',
      list: [],
    };
    mindMapInstance.opt.iconList.push(group);
  }

  // 检查图标是否已在分组中
  const iconExists = group.list.some((icon: any) => icon.name === iconName);
  if (!iconExists) {
    const icon = NOTO_ICONS.find(i => i.name === iconName);
    if (icon) {
      // 使用本地 SVG 文件路径
      const iconFileName = icon.icon.replace('noto:', '');
      const iconUrl = new URL(`../assets/icons/${iconFileName}.svg`, import.meta.url).href;
      group.list.push({
        name: iconName,
        icon: iconUrl,
      });
    }
  }

  return iconKey;
}
