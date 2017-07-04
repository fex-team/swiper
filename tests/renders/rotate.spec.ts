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
    const slide;
    const mockSwiper;

    beforeEach(() => {
        slide = new Rotate();
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: -65
            },
            sideLength: 650;
        };
    });

    test('normal rotate render', () => {
        let transform = slide.doRender(mockSwiper);
        
        expect(transform.swiper).toBe('-webkit-perspective:2600px;-webkit-transform-style:preserve-3d;');
        expect(transform.currentPage).toBe('-webkit-transform: rotateX(9deg) translateZ(288.925px) scale(0.889);');
        expect(transform.activePage).toBe('-webkit-transform: rotateX(-81deg) translateZ(288.925px) scale(0.889);');
    });
});