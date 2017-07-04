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

type Sign = 0 | -1 | 1;

const OPPSITE:any = {
    X: 'Y',
    Y: 'X'
}

export default class Dumi extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.offset[axis];
        const sideLength = swiper.sideLength;
        
        const scaleAxis = OPPSITE[axis];
        const currentRatio = 1 - 0.4 * Math.min(Math.abs(sideOffset / sideLength), 0.5);
        const activeRatio = 0.8 + 0.4 * Math.min(Math.abs(sideOffset / sideLength), 0.5)
        const sign: Sign = this.sign(sideOffset);

        return {
            currentPage: `-webkit-transform: translateZ(0) translate${axis}(${sideOffset}px) scale(${currentRatio});`,
            activePage: `-webkit-transform: translateZ(0) translate${axis}(${sideOffset - sign * sideLength}px) scale(${activeRatio});`
        };
    }
}
