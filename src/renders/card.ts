/**
 * @file card.ts 卡片翻页效果
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

export default class Card extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.offset[axis];
        const sideLength = swiper.sideLength;
        
        const scaleAxis = OPPSITE[axis];
        const scaleRatio = 1 - 0.2 * Math.abs(sideOffset / sideLength);
        const sign: Sign = this.sign(sideOffset);

        return {
            currentPage: `-webkit-transform: translateZ(0) scale${scaleAxis}(${scaleRatio}) translate${axis}(${sideOffset}px);`,
            activePage: `-webkit-transform: translateZ(0) translate${axis}(${sideOffset - sign * sideLength}px);`
        };
    }
}
