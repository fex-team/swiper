/**
 * @file fade.ts 渐隐翻页效果
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.27
 */

import Render from '../render';


export default class Fade extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset: number = swiper.offset[axis];
        const sideLength = swiper.sideLength;

        return {
            currentPage: `opacity: ${1 - Math.abs(sideOffset / sideLength)};`,
            activePage: `opacity: ${Math.abs(sideOffset / sideLength)};`
        };
    }
}
