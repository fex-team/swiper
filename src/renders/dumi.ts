/**
 * @file card.ts 度秘 3.0 新版引导页翻页效果
 * 
 * 两个页面都有缩放效果，暂时没有想到合适名字
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.29
 */


import Render from '../render';
import { EMPTY_PAGE, OPPSITE } from '../constant';

type Sign = 0 | -1 | 1;

export default class Dumi extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.sideOffset;
        const sideLength = swiper.sideLength;
        
        const scaleAxis = OPPSITE[axis];
        const currentRatio = 1 - 0.4 * Math.min(Math.abs(sideOffset / sideLength), 0.5);
        const activeRatio = 0.8 + 0.4 * Math.min(Math.abs(sideOffset / sideLength), 0.5)
        const moveDirection = this.sign(sideOffset);

        // compute
        const currentTransform = `translateZ(0) translate${axis}(${sideOffset}px) scale(${currentRatio})`;
        const activeTransform = `translateZ(0) translate${axis}(${sideOffset - moveDirection * sideLength}px) scale(${activeRatio})`;

        // apply
        swiper.currentPage.style.webkitTransform = currentTransform;
        if (swiper.activePage !== EMPTY_PAGE) {
            swiper.activePage.style.webkitTransform = activeTransform;
        }
    }
}
