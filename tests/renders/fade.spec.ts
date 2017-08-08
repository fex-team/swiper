/**
 * @file fade.spec.ts 对应 renders/fade.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Fade from '../../src/renders/fade';
import { EMPTY_PAGE } from '../../src/constant';

describe('test fade render', () => {
    let slide;
    let mockSwiper;
    let style;

    beforeEach(() => {
        slide = new Fade();
        style = {
            opacity: ''
        };
    });

    test('normal fade render', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -65,
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
        
        expect(mockSwiper.currentPage.style.opacity).toBe(0.9);
        expect(mockSwiper.activePage.style.opacity).toBe(0.1);
    });

    test('normal fade render when active page is empty', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -65,
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
        
        expect(mockSwiper.currentPage.style.opacity).toBe(0.9);
        expect(mockSwiper.activePage).toBe(EMPTY_PAGE);
    });
});