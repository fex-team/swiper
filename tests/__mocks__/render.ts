/**
 * @file render.ts 模拟一个 render 的子类，用于测试 Render 抽象类
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */

import Render from '../../src/render';


export default class Fade extends Render {

    doRender(swiper:any) {
        const axis = swiper.axis;
        const sideOffset: number = swiper.offset[axis];
        const sideLength = swiper.sideLength;

        return {
            currentPage: `opacity: ${1 - Math.abs(sideOffset / sideLength)}`,
            activePage: `opacity: ${Math.abs(sideOffset / sideLength)}`
        };
    }
}