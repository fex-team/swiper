/**
 * @file swiper.spec.ts 对应 swiper.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */

import {Swiper} from '../src/swiper';

describe('test swiper', () => {
    document.body.innerHTML = '<div class="outer-container" style="width: 400px; height: 650px;"></div>';

    const data = [{
        content: '<img src="//kityminder-img.cdn.bcebos.com/01.png" alt="01" width="100%" height="100%">'
    }, {
        content: '<img src="//kityminder-img.cdn.bcebos.com/02.png" alt="02" width="100%" height="100%">'
    }, {
        content: '<img src="//kityminder-img.cdn.bcebos.com/03.png" alt="03" width="100%" height="100%">'
    }];

    let swiper;

    beforeEach(() => {
        swiper = new Swiper({
            container: document.querySelector('.outer-container');
            data: data,
            initIndex: 1,
            keepDefaultClass: ['keep-default']
        });
    });

    describe('test preventDefaultHandler', () => {

        test('test a device event on a tag', () => {
            const mockDeviceEventOnATag = {
                target: document.createElement('a'),
                preventDefault: jest.fn();
            };

            swiper.keepDefaultHandler(mockDeviceEventOnATag);
            expect(mockDeviceEventOnATag.preventDefault).toHaveBeenCalledTimes(0);
        });

        test('test a device event on a keep default element', () => {
            const $targetElement = document.createElement('div');
            $targetElement.classList.add('keep-default');

            const mockDeviceEventOnKeepDefault = {
                target: $targetElement,
                preventDefault: jest.fn();
            };

            swiper.keepDefaultHandler(mockDeviceEventOnKeepDefault);
            expect(mockDeviceEventOnKeepDefault.preventDefault).toHaveBeenCalledTimes(0);
        });

        test('test a device event on a normal element', () => {
            const mockDeviceEventOnNormal = {
                target: document.createElement('div'),
                preventDefault: jest.fn();
            };

            swiper.keepDefaultHandler(mockDeviceEventOnNormal);
            expect(mockDeviceEventOnNormal.preventDefault).toHaveBeenCalledTimes(1);
        });
    });

    describe('test touchStartHandler', () => {
        test('test a touch start event', () => {
            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            swiper.startHandler(mockTouchStartPoint);
            expect(swiper.start.X).toBe(100);
            expect(swiper.start.Y).toBe(100);
        });

        test('test prevent touch start when sliding', () => {
            swiper.sliding = true;

            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            swiper.startHandler(mockTouchStartPoint);

            expect(swiper.moving).toBe(false);
        });
    });


    describe('test moveHandler', () => {
        test('test a touch move event', () => {
            const mockTouchStartPoint = {
                X: 100,
                Y: 100
            };

            const mockTouchMovingPoint = {
                X: 100,
                Y: 90
            }

            swiper.startHandler(mockTouchStartPoint);
            swiper.moveHandler(mockTouchMovingPoint)
            expect(swiper.offset.X).toBe(0);
            expect(swiper.offset.Y).toBe(-10);
        });
    });

});