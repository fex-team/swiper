/**
 * @file fade.ts 演示稿翻页效果（默认）
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.27
 */


import Render from '../render';
import { EMPTY_PAGE } from '../constant';

export default class Slide extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset: number = swiper.sideOffset;
        const sideLength = swiper.sideLength;
        const moveDirection = this.sign(sideOffset);

        const currentTransform = `translateZ(0) translate${axis}(${sideOffset}px)`;
        const activeTransform = `translateZ(0) translate${axis}(${sideOffset - moveDirection * sideLength}px)`;

        swiper.currentPage.style.webkitTransform = currentTransform;
        if (swiper.activePage !== EMPTY_PAGE) {
            swiper.activePage.style.webkitTransform = activeTransform;
        }
    }
}
