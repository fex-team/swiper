/**
 * @file fade.ts 翻转翻页效果
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.27
 */


import Render from '../render';

type Sign = 0 | -1 | 1;

const OPPSITE:any = {
    X: 'Y',
    Y: 'X'
}


export default class Flip extends Render {
    
    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.offset[axis];
        const sideLength = swiper.sideLength;                
        const moveDirection = swiper.moveDirection;        
        const rotateAxis = OPPSITE[axis];
        const pageChange = swiper.pageChange;

        const rotateSign: Sign = axis === 'Y' ? -1 : 1;

        const cssText = '-webkit-backface-visibility:hidden;';

        return {
            container: `-webkit-perspective:${sideLength * 4}`,
            swiper: '-webkit-transform-style:flat',
            currentPage: `${cssText}-webkit-transform: translateZ(${sideLength / 2}px) rotate${rotateAxis}(${rotateSign * 180 * sideOffset / sideLength}deg) scale(0.875)`,
            activePage: `${cssText}-webkit-transform: translateZ(${sideLength / 2}px) rotate${rotateAxis}(${rotateSign * 180 * (sideOffset / sideLength + 1) }deg) scale(0.875);z-index: 7;`
        }
    }
}