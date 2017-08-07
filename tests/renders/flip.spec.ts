/**
 * @file flip.spec.ts 对应 renders/flip.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Flip from '../../src/renders/flip';
import { EMPTY_PAGE } from '../../src/constant';


describe('test flip render', () => {
    let slide;
    let mockSwiper;
    let style;

    beforeEach(() => {
        slide = new Flip();
        style = {
            cssText: '',
            webkitBackfaceVisibility: '',
            webkitTransfom: '',
            zIndex: 0
        };
    });

    test('normal flip render in Y axis', () => {
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
        
        expect(mockSwiper.$swiper.style.cssText).toBe('-webkit-perspective:2600px;-webkit-transform-style:flat;');
        expect(mockSwiper.currentPage.style.webkitBackfaceVisibility).toBe('hidden');
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(325px) rotateX(18deg) scale(0.875)');
        expect(mockSwiper.activePage.style.webkitBackfaceVisibility).toBe('hidden');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('translateZ(325px) rotateX(-162deg) scale(0.875)');
        expect(mockSwiper.activePage.style.zIndex).toBe(7);
    });


    test('normal flip render in X axis', () => {
       mockSwiper = {
            axis: 'X',
            sideOffset: -40,
            sideLength: 400,
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

        expect(mockSwiper.$swiper.style.cssText).toBe('-webkit-perspective:1600px;-webkit-transform-style:flat;');
        expect(mockSwiper.currentPage.style.webkitBackfaceVisibility).toBe('hidden');
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(200px) rotateY(-18deg) scale(0.875)');
        expect(mockSwiper.activePage.style.webkitBackfaceVisibility).toBe('hidden');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('translateZ(200px) rotateY(162deg) scale(0.875)');
        expect(mockSwiper.activePage.style.zIndex).toBe(7);
    });

    test('normal flip render when active page is empty', () => {
       mockSwiper = {
            axis: 'X',
            sideOffset: -40,
            sideLength: 400,
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

        expect(mockSwiper.$swiper.style.cssText).toBe('-webkit-perspective:1600px;-webkit-transform-style:flat;');
        expect(mockSwiper.currentPage.style.webkitBackfaceVisibility).toBe('hidden');
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(200px) rotateY(-18deg) scale(0.875)');
        expect(mockSwiper.activePage).toBe(EMPTY_PAGE);
    });
});