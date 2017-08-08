/**
 * @file dumi.spec.ts 对应 renders/dumi.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Dumi from '../../src/renders/dumi';
import { EMPTY_PAGE } from '../../src/constant';

describe('test dumi render', () => {
    let slide;
    let mockSwiper;
    let style;

    beforeEach(() => {
        slide = new Dumi();
        style = {
            cssText: '',
            webkitTransfom: ''
        };
    });

    test('normal dumi render', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -325,
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

        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) translateY(-325px) scale(0.8)');
        expect(mockSwiper.activePage.style.webkitTransform).toBe('translateZ(0) translateY(325px) scale(1)');
    });

    test('normal dumi render when active page is empty', () => {
        mockSwiper = {
            axis: 'Y',
            sideOffset: -325,
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

        expect(mockSwiper.currentPage.style.webkitTransform).toBe('translateZ(0) translateY(-325px) scale(0.8)');
        expect(mockSwiper.activePage).toBe(EMPTY_PAGE);
    });
});