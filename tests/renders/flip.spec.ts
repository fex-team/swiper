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
    const slide;
    const mockSwiper;

    beforeEach(() => {
        slide = new Flip();
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: -65
            },
            sideLength: 650;
        };
    });

    test('normal flip render', () => {
        let transform = slide.doRender(mockSwiper);
        
        expect(transform.swiper).toBe('-webkit-perspective:2600px;-webkit-transform-style:flat;');
        expect(transform.currentPage).toBe('-webkit-backface-visibility:hidden;-webkit-transform: translateZ(325px) rotateX(18deg) scale(0.875);');
        expect(transform.activePage).toBe('-webkit-backface-visibility:hidden;-webkit-transform: translateZ(325px) rotateX(-162deg) scale(0.875);z-index: 7;');
    });
});