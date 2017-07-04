/**
 * @file card.spec.ts 对应 renders/card.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.04
 */

import Card from '../../src/renders/card';

describe('test card render', () => {
    const slide;
    const mockSwiper;

    beforeEach(() => {
        slide = new Card();
    });

    test('normal card render in Y', () => {
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: -65
            },
            sideLength: 650;
        };
        
        let transform = slide.doRender(mockSwiper);

        expect(transform.currentPage).toBe('-webkit-transform: translateZ(0) scaleX(0.98) translateY(-65px);');
        expect(transform.activePage).toBe('-webkit-transform: translateZ(0) translateY(585px);');
    });

    test('normal card render in X', () => {
        mockSwiper = {
            axis: 'X',
            offset: {
                X: -200
            },
            sideLength: 400;
        };
        
        let transform = slide.doRender(mockSwiper);

        expect(transform.currentPage).toBe('-webkit-transform: translateZ(0) scaleY(0.9) translateX(-200px);');
        expect(transform.activePage).toBe('-webkit-transform: translateZ(0) translateX(200px);');
    });

    test('normal card render for positive offset', () => {
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: 65
            },
            sideLength: 650;
        };
        
        let transform = slide.doRender(mockSwiper);

        expect(transform.currentPage).toBe('-webkit-transform: translateZ(0) scaleX(0.98) translateY(65px);');
        expect(transform.activePage).toBe('-webkit-transform: translateZ(0) translateY(-585px);');
    });

    test('normal card render for 0 offset', () => {
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: 0
            },
            sideLength: 650;
        };
        
        let transform = slide.doRender(mockSwiper);

        expect(transform.currentPage).toBe('-webkit-transform: translateZ(0) scaleX(1) translateY(0px);');
        expect(transform.activePage).toBe('-webkit-transform: translateZ(0) translateY(0px);');
    });

    test('test sign function', () => {
        mockSwiper = {
            axis: 'Y',
            offset: {
                Y: -65
            },
            sideLength: 650;
        };
        
        slide.sign = jest.fn();
        slide.doRender(mockSwiper);

        expect(slide.sign).toBeCalled();
    });

});