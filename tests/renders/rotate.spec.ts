/**
 * @file rotate.spec.ts 对应 renders/rotate.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Rotate from '../../src/renders/rotate';


describe('test rotate render', () => {
    let slide;
    let mockSwiper;

    beforeEach(() => {
        slide = new Rotate();
    });

    test('normal rotate render in Y axis', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -65,
            sideLength: 650
        };

        let transform = slide.doRender(mockSwiper);
        
        expect(transform.swiper).toBe('-webkit-perspective:2600px;-webkit-transform-style:preserve-3d;');
        expect(transform.currentPage).toBe('-webkit-transform: rotateX(9deg) translateZ(288.925px) scale(0.889);');
        expect(transform.activePage).toBe('-webkit-transform: rotateX(-81deg) translateZ(288.925px) scale(0.889);');
    });

    test('normal rotate render in X axis', () => {
        mockSwiper = {
            axis: 'X',
            sideOffset: -40,
            sideLength: 400
        };

        let transform = slide.doRender(mockSwiper);
        
        expect(transform.swiper).toBe('-webkit-perspective:1600px;-webkit-transform-style:preserve-3d;');
        expect(transform.currentPage).toBe('-webkit-transform: rotateY(-9deg) translateZ(177.8px) scale(0.889);');
        expect(transform.activePage).toBe('-webkit-transform: rotateY(81deg) translateZ(177.8px) scale(0.889);');
    });
});