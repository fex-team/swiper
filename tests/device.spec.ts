/**
 * @file device.spec.ts 对应 device.ts 的测试文件
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */


import Touchable from './__mocks__/touchable.ts';
import { Device } from '../src/device';

describe('test device', () => {
    
    test('stardard touchable device', () => {
        const mockTouchableWindow = new Touchable('standard');
        const touchableDevice = new Device(mockTouchableWindow);

        const mockEvent = {
            targetTouches: [{
                pageX: 100,
                pageY: 100
            }]
        };

        expect(touchableDevice.startEvent).toBe('touchstart');

        // expect(touchableDevice.getPageX(mockEvent)).toBe(100);
        // expect(touchableDevice.getPageY(mockEvent)).toBe(100);
    });

    test('obsolete touchable device', () => {
        const mockTouchableWindow = new Touchable('obsolete');
        const touchableDevice = new Device(mockTouchableWindow);
        expect(touchableDevice.startEvent).toBe('touchstart');    
    });

    // only need one assert
    test('untouchable device', () => {
        const untouchableWindow = new Touchable('none');
        const untouchableDevice = new Device(untouchableWindow);

        const mockEvent = {
            pageX: 100,
            pageY: 100
        };

        expect(untouchableDevice.startEvent).toBe('mousedown');

        // expect(untouchableDevice.getPageX(mockEvent)).toBe(100);
        // expect(untouchableDevice.getPageY(mockEvent)).toBe(100); 
    });
});