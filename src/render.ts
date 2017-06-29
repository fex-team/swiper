/**
 * @file render.ts 抽象类，为渲染提供运行时支持
 * 
 * @author: zhangbobell
 * @email: zhangbobell@163.com
 * 
 * @created: 2017.06.27
 */


type Sign = 0 | -1 | 1;

interface RenderInterface {
    [key: string]: any;
}

export default abstract class Render {

    static _renders: RenderInterface = {};

    static register(name: string, renderClass: any) {
        Render._renders[name] = renderClass;
    }

    static getRenderInstance(name) {
        let RenderClass = Render._renders[name];
        if (!RenderClass) {
            throw new Error(`Missing render : ${ name }`);
        }

        return new RenderClass();
    }

    protected sign(x: number): Sign {
        x = +x;

        if (x === 0 || isNaN(x)) {
            return 0;
        }

        return x > 0 ? 1 : -1;
    }

    abstract doRender(swiper): any;
}