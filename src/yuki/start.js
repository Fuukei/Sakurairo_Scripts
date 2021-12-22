import { snowFall } from './yuki'
const amount = mashiro_option.yuki_amount

/* 调用及控制方法 */
var snow = new snowFall({ maxFlake: amount == 'half' ? 250 : 500 });
snow.start();