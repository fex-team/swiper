/**
 * @file: device.js 关于 swiper 所在设备
 * @class Device
 *
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * @created: 2017.06.26
 * 
 */

export class Device {
    public hasTouch: boolean;
    public startEvent: string;
    public moveEvent: string;
    public endEvent: string;
    public cancelEvent: string;
    public resizeEvent: string;

    constructor(global) {
        this.hasTouch = !!(('ontouchstart' in global && !/Mac OS X /.test(global.navigator.userAgent))
        || global.DocumentTouch && document instanceof global.DocumentTouch);

        this.startEvent = this.hasTouch ? 'touchstart' : 'mousedown';
        this.moveEvent = this.hasTouch ? 'touchmove' : 'mousemove';
        this.endEvent = this.hasTouch ? 'touchend' : 'mouseup';
        this.cancelEvent = this.hasTouch ? 'touchcancel' : 'mouseout';
        this.resizeEvent = 'onorientationchange' in global ? 'orientationchange' : 'resize'
    }
}