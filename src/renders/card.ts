/**
 * @file card.ts 卡片翻页效果
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.27
 */


import Render from '../render';
import { EMPTY_PAGE, OPPSITE } from '../constant';

type Sign = 0 | -1 | 1;

export default class Card extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.sideOffset;
        const sideLength = swiper.sideLength;
        
        const scaleAxis = OPPSITE[axis];
        const scaleRatio = 1 - 0.2 * Math.abs(sideOffset / sideLength);
        const moveDirection = this.sign(swiper.sideOffset);

        // compute
        const currentTransform = `translateZ(0) scale${scaleAxis}(${scaleRatio}) translate${axis}(${sideOffset}px)`;
        const activeTransform = `translateZ(0) translate${axis}(${sideOffset - moveDirection * sideLength}px)`;

        // apply
        swiper.currentPage.style.webkitTransform = currentTransform;
        if (swiper.activePage !== EMPTY_PAGE) {
            swiper.activePage.style.webkitTransform = activeTransform;
        }
    }
}
