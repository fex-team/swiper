/**
 * @file rotate.ts 立方体翻页效果
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.27
 */


import Render from '../render';

import { EMPTY_PAGE, OPPSITE } from '../constant';

type Sign = 0 | -1 | 1;


export default class Rotate extends Render {
    
    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.sideOffset;
        const sideLength = swiper.sideLength;                
        const rotateAxis = OPPSITE[axis];

        const moveDirection = this.sign(sideOffset);
        const rotateSign: Sign = axis === 'Y' ? -1 : 1;

        // compute
        const swiperCss = `-webkit-perspective:${sideLength * 4}px;-webkit-transform-style:preserve-3d;`;
        const currentTransform = `rotate${rotateAxis}(${rotateSign * 90 * sideOffset / sideLength}deg) translateZ(${0.889 * sideLength / 2}px) scale(0.889)`;
        const activeTransform = `rotate${rotateAxis}(${rotateSign * 90 * (sideOffset / sideLength - moveDirection)}deg) translateZ(${0.889 * sideLength / 2}px) scale(0.889)`;

        // apply
        swiper.$swiper.style.cssText = swiperCss;
        swiper.currentPage.style.webkitTransform = currentTransform;
        if (swiper.activePage !== EMPTY_PAGE) {
            swiper.activePage.style.webkitTransform = activeTransform;
        }
    }
}
