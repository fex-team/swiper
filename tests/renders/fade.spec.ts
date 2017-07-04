/**
 * @file fade.spec.ts 对应 renders/fade.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Fade from '../../src/renders/fade';


describe('test fade render', () => {
    const slide;
    const mockSwiper;

    beforeEach(() => {
        slide = new Fade();
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: -65
            },
            sideLength: 650;
        };
    });

    test('normal fade render', () => {
        let transform = slide.doRender(mockSwiper);
        
        expect(transform.currentPage).toBe('opacity: 0.9;');
        expect(transform.activePage).toBe('opacity: 0.1;');
    });
});