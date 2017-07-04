/**
 * @file rotate.ts 立方体翻页效果
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


export default class Rotate extends Render {
    
    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset = swiper.offset[axis];
        const sideLength = swiper.sideLength;                
        const rotateAxis = OPPSITE[axis];

        const sign: Sign = this.sign(sideOffset);
        const rotateSign: Sign = axis === 'Y' ? -1 : 1;

        return {
            swiper: `-webkit-perspective:${sideLength * 4}px;-webkit-transform-style:preserve-3d;`,
            currentPage: `-webkit-transform: rotate${rotateAxis}(${rotateSign * 90 * sideOffset / sideLength}deg) translateZ(${0.889 * sideLength / 2}px) scale(0.889);`,
            activePage: `-webkit-transform: rotate${rotateAxis}(${rotateSign * 90 * (sideOffset / sideLength - sign)}deg) translateZ(${0.889 * sideLength / 2}px) scale(0.889);`,
        }
    }
}
