/**
 * @file touchable.ts 模拟触屏设备（两种触摸方法）
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.01
 */

export default class Touchable {
    public ontouchstart: Function;
    public navigator: any;

    public DocumentTouch: Function;
    public document: any;

    constructor(touchType: string) {
        if (touchType === 'standard') {
            this.ontouchstart = jest.fn();
            this.navigator = {};
        }
        else if (touchType === 'obsolete') {
            this.DocumentTouch = jest.fn();
            this.document = new this.DocumentTouch();
        }
    }
}