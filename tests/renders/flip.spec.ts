/**
 * @file flip.spec.ts 对应 renders/flip.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Flip from '../../src/renders/flip';


describe('test flip render', () => {
    let slide;
    let mockSwiper;

    beforeEach(() => {
        slide = new Flip();
    });

    test('normal flip render in Y axis', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -65,
            sideLength: 650
        };
        let transform = slide.doRender(mockSwiper);
        
        expect(transform.swiper).toBe('-webkit-perspective:2600px;-webkit-transform-style:flat;');
        expect(transform.currentPage).toBe('-webkit-backface-visibility:hidden;-webkit-transform: translateZ(325px) rotateX(18deg) scale(0.875);');
        expect(transform.activePage).toBe('-webkit-backface-visibility:hidden;-webkit-transform: translateZ(325px) rotateX(-162deg) scale(0.875);z-index: 7;');
    });


    test('normal flip render in X axis', () => {
        mockSwiper = {
            axis: 'X',
            sideOffset: -40,
            sideLength: 400
        };
        let transform = slide.doRender(mockSwiper);
        
        expect(transform.swiper).toBe('-webkit-perspective:1600px;-webkit-transform-style:flat;');
        expect(transform.currentPage).toBe('-webkit-backface-visibility:hidden;-webkit-transform: translateZ(200px) rotateY(-18deg) scale(0.875);');
        expect(transform.activePage).toBe('-webkit-backface-visibility:hidden;-webkit-transform: translateZ(200px) rotateY(162deg) scale(0.875);z-index: 7;');
    });
});