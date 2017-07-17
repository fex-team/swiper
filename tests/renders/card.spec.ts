/**
 * @file card.spec.ts 对应 renders/card.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Card from '../../src/renders/card';
import { EMPTY_PAGE } from '../../src/constant';

describe('test card render', () => {
    let slide;
    let mockSwiper;
    let style;

    beforeEach(() => {
        slide = new Card();
        style = {
            cssText: '',
            webkitTransfom: ''
        };
    });

    test('normal card render in Y', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -65,
            sideLength: 650,
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

        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) scaleX(0.98) translateY(-65px)');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('translateZ(0) translateY(585px)');
    });

    test('normal card render in X', () => {
        mockSwiper = {
            axis: 'X',
            sideOffset: -200,
            sideLength: 400,
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

        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) scaleY(0.9) translateX(-200px)');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('translateZ(0) translateX(200px)');
    });


    test('normal card render when active page is empty', () => {
        mockSwiper = {
            axis: 'X',
            sideOffset: -200,
            sideLength: 400,
            $swiper: {
                style: {...style}
            },
            currentPage: {
                style: {...style}
            },
            activePage: EMPTY_PAGE
        };
        
        slide.doRender(mockSwiper);

        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) scaleY(0.9) translateX(-200px)');
        expect(mockSwiper.activePage).toBe(EMPTY_PAGE);
    });

});