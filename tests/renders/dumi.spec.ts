/**
 * @file dumi.spec.ts 对应 renders/dumi.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Dumi from '../../src/renders/dumi';

describe('test dumi render', () => {
    const slide;
    const mockSwiper;

    beforeEach(() => {
        slide = new Dumi();
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: -325
            },
            sideLength: 650;
        };
    });

    test('normal dumi render', () => {
        let transform = slide.doRender(mockSwiper);

        expect(transform.currentPage).toBe('-webkit-transform: translateZ(0) translateY(-325px) scale(0.8);');
        expect(transform.activePage).toBe('-webkit-transform: translateZ(0) translateY(325px) scale(1);');
    });
});