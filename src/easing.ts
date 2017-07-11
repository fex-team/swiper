/**
 * @file easing.ts 缓动效果类，主要提供计算映射的函数
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.07.11
 */

export default class Easing {

    static easeOutQuad(sideOffset: number, sideLength: number): number {
        let t = Math.abs(sideOffset / sideLength);
        let y = 0.5*t*(3-t);

        return Easing.sign(sideOffset) * y * sideLength;
    }

    static rubberBand(sideOffset: number, sideLength: number): number {
        let t = Math.abs(sideOffset / sideLength);
        let d = sideLength;
        let y = 1.0 - (1.0 / ((0.55 * t) + 1.0));

        return Easing.sign(sideOffset) * y * sideLength;
    }

    static sign(x: number): number {
        x = +x;

        if (x === 0 || isNaN(x)) {
            return 0;
        }

        return x > 0 ? 1 : -1;
    }
}