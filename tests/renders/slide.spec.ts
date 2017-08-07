/**
 * @file slide.spec.ts 对应 renders/slide.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Slide from '../../src/renders/slide';
import { EMPTY_PAGE } from '../../src/constant';

describe('test slide render', () => {
    let slide;
    let mockSwiper;
    let style;

    beforeEach(() => {
        slide = new Slide();
        style = {
            cssText: '',
            webkitTransfom: ''
        };
    });

    test('normal slide', () => {
         mockSwiper = {
            axis: 'Y',
            sideOffset: -100,
            sideLength: 650,
            moveDirection: -1,
            $swiper: {
                style: {...style}
            },
            currentPage: {
                style: {...style}
            },
            activePage: {
                style: {...style}
            }
        };
        

        slide.doRender(mockSwiper);
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) translateY(-100px)');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('translateZ(0) translateY(550px)');
    });

    test('normal slide', () => {
         mockSwiper = {
            axis: 'Y',
            sideOffset: -100,
            sideLength: 650,
            moveDirection: -1,
            $swiper: {
                style: {...style}
            },
            currentPage: {
                style: {...style}
            },
            activePage: EMPTY_PAGE
        };
        

        slide.doRender(mockSwiper);
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) translateY(-100px)');
        expect(mockSwiper.activePage).toBe(EMPTY_PAGE);
    });
});



