/**
 * @file rotate.spec.ts 对应 renders/rotate.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Rotate from '../../src/renders/rotate';
import { EMPTY_PAGE } from '../../src/constant';


describe('test rotate render', () => {
    let slide;
    let mockSwiper;
    let style;

    beforeEach(() => {
        slide = new Rotate();
        style = {
            cssText: '',
            webkitTransfom: ''
        };
    });

    test('normal rotate render in Y axis', () => {
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

        expect(mockSwiper.$swiper.style.cssText).toBe('-webkit-perspective:2600px;-webkit-transform-style:preserve-3d;');        
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('rotateX(9deg) translateZ(288.925px) scale(0.889)');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('rotateX(-81deg) translateZ(288.925px) scale(0.889)');
    });

    test('normal rotate render in X axis', () => {
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

        expect(mockSwiper.$swiper.style.cssText).toBe('-webkit-perspective:1600px;-webkit-transform-style:preserve-3d;');        
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('rotateY(-9deg) translateZ(177.8px) scale(0.889)');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('rotateY(81deg) translateZ(177.8px) scale(0.889)');
    });

    test('normal rotate render when active page is empty', () => {
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

        expect(mockSwiper.$swiper.style.cssText).toBe('-webkit-perspective:2600px;-webkit-transform-style:preserve-3d;');        
        expect(mockSwiper.currentPage.style.webkitTransform).toBe('rotateX(9deg) translateZ(288.925px) scale(0.889)');
        expect(mockSwiper.activePage).toBe(EMPTY_PAGE);
    });
});