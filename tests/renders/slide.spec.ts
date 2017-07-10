/**
 * @file slide.spec.ts 对应 renders/slide.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Slide from '../../src/renders/slide';

describe('test slide render', () => {
    let slide;
    let mockSwiper;

    beforeEach(() => {
        slide = new Slide();
        mockSwiper = {
            axis: 'Y',
            sideOffset: -100,
            sideLength: 650
        };

    });

    test('normal slide', () => {
        let transform = slide.doRender(mockSwiper);
        expect(transform.currentPage).toBe('-webkit-transform: translateZ(0) translateY(-100px);');
        expect(transform.activePage).toBe('-webkit-transform: translateZ(0) translateY(550px);');
    });
});



