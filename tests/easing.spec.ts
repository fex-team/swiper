/**
 * @file easing.spec.ts 对应 easing.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.11
 */

import Easing from '../src/easing';

describe('testing easing class', () => {

    test('test easeOutQuad', () => {
        expect(Easing.easeOutQuad(0, 650)).toBe(0);
        expect(Easing.easeOutQuad(325, 650)).toBe(406.25);
        expect(Easing.easeOutQuad(650, 650)).toBe(650);      
    });

    test('test rubberBand', () => {
        expect(Easing.rubberBand(0, 650)).toBe(0);
        expect(Easing.rubberBand(325, 650)).toBeCloseTo(140.2);
        expect(Easing.rubberBand(650, 650)).toBeCloseTo(230.65);
    });

    test('test sign function', () => {
        expect(Easing.sign(1)).toBe(1);
        expect(Easing.sign(-1)).toBe(-1);
        expect(Easing.sign(0)).toBe(0);
        expect(Easing.sign(Number.NaN)).toBe(0);
    })

});
