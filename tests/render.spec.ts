/**
 * @file render.spec.ts 对应 render.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */

import Render from '../src/render';
import Fade from './__mocks__/render';

describe('testing render abstruct class', () => {

    test('test register', () => {
        Render.register('fade', Fade);
        expect(Render.getRenderInstance('fade')).toBeInstanceOf(Fade);
    });

    test('test get no render instance', () => {
        expect(() => {
            Render.getRenderInstance('none');
        }).toThrow('Missing render : none');
    });

    test('test sign function', () => {
        const fadeInstance = Render.getRenderInstance('fade');
        
        expect(fadeInstance.sign(1)).toBe(1);
        expect(fadeInstance.sign(-1)).toBe(-1);
        expect(fadeInstance.sign(0)).toBe(0);
        expect(fadeInstance.sign(Number.NaN)).toBe(0);
    })

});
