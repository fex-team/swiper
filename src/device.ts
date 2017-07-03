/**
 * @file: device.js 关于 swiper 所在设备
 * @class Device
 *
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * @created: 2017.06.26
 * 
 */

interface Point {
    X: number,
    Y: number
}

interface combinedEvent extends TouchEvent, MouseEvent {

};

export interface DeviceEvent {
    type: string;
    position: Point;
    target: HTMLElement,
    button: number;
    preventDefault: Function;
}

export class Device {
    public hasTouch: boolean;
    public startEvent: string;
    public moveEvent: string;
    public endEvent: string;
    public cancelEvent: string;
    public resizeEvent: string;

    constructor(global) {
        this.hasTouch = !!(('ontouchstart' in global && !/Mac OS X /.test(global.navigator.userAgent))
        || (global.DocumentTouch && global.document instanceof global.DocumentTouch));

        this.startEvent = this.hasTouch ? 'touchstart' : 'mousedown';
        this.moveEvent = this.hasTouch ? 'touchmove' : 'mousemove';
        this.endEvent = this.hasTouch ? 'touchend' : 'mouseup';
        this.cancelEvent = this.hasTouch ? 'touchcancel' : 'mouseout';

        // orientationchange also trigger resize
        this.resizeEvent = 'resize'
    }

    public getDeviceEvent(event: combinedEvent): DeviceEvent {
        let position = this.hasTouch ? this.getTouchPosition(event) : this.getMousePosition(event);
        
        return {
            type: event.type,
            position: position,
            target: <HTMLElement>event.target,
            button: event.button,
            preventDefault: event.preventDefault.bind(event)
        }
    }

    private getTouchPosition(event: TouchEvent): Point {
        if (event.targetTouches && event.targetTouches.length > 0) {
            return {
                X: event.targetTouches[0].pageX,
                Y: event.targetTouches[0].pageY,
            }
        }

        return {
            X: undefined,
            Y: undefined
        }
    }

    private getMousePosition(event: MouseEvent): Point {
        if ('pageX' in event) {
            return {
                X: event.pageX,
                Y: event.pageY
            }
        }

        return {
            X: undefined,
            Y: undefined
        }
    }
}